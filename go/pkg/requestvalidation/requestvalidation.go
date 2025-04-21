package requestvalidation

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/lestrrat-go/jwx/jwk"
)

// Auth0Config enthält die Konfiguration für Auth0
type Auth0Config struct {
	Domain        string
	Audience      string
	JwksURI       string
	TokenLifetime time.Duration
}

// NewAuth0Middleware erstellt eine neue Auth0 Middleware
func NewAuth0Middleware(config Auth0Config) gin.HandlerFunc {
	// JWKS (JSON Web Key Set) Client für die Validierung des Tokens
	jwksClient := jwk.NewAutoRefresh(context.Background())
	jwksClient.Configure(config.JwksURI, jwk.WithMinRefreshInterval(15*time.Minute))

	_, err := jwksClient.Refresh(context.Background(), config.JwksURI)
	if err != nil {
		// In der Produktion sollte hier eine ordentliche Fehlerbehandlung stattfinden
		panic("Konnte JWKS nicht laden: " + err.Error())
	}

	return func(c *gin.Context) {
		// Token aus dem Authorization Header extrahieren
		token, err := extractToken(c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Kein gültiger Authorization Header"})
			c.Abort()
			return
		}

		// Token parsen und validieren
		parsedToken, err := parseToken(token, config, jwksClient)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Ungültiger Token: " + err.Error()})
			c.Abort()
			return
		}

		// Claims aus Token extrahieren
		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		if !ok || !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Ungültiger Token"})
			c.Abort()
			return
		}

		// Token im Context speichern für weitere Handler
		c.Set("user", claims)
		c.Next()
	}
}

// extractToken extrahiert den Bearer Token aus dem Authorization Header
func extractToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization header fehlt")
	}

	// Bearer Token Format prüfen
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", errors.New("authorization header hat falsches format")
	}

	return parts[1], nil
}

// parseToken validiert den Token gegen Auth0
func parseToken(tokenString string, config Auth0Config, jwksClient *jwk.AutoRefresh) (*jwt.Token, error) {
	// Token parsen mit entsprechender Validierung
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Prüfen ob der Algorithmus stimmt
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, errors.New("unerwarteter Signatur-Algorithmus")
		}

		// Kid (Key ID) aus Token-Header extrahieren
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid Header fehlt im Token")
		}

		// Passenden Schlüssel aus JWKS abrufen (korrekt implementiert)
		keyset, err := jwksClient.Fetch(context.Background(), config.JwksURI)
		if err != nil {
			return nil, errors.New("JWKS konnte nicht abgerufen werden: " + err.Error())
		}

		key, found := keyset.LookupKeyID(kid)
		if !found {
			return nil, errors.New("passender Schlüssel nicht gefunden")
		}

		var rawKey interface{}
		if err := key.Raw(&rawKey); err != nil {
			return nil, errors.New("konnte Schlüssel nicht verarbeiten")
		}

		return rawKey, nil
	}, jwt.WithValidMethods([]string{"RS256"}))

	if err != nil {
		return nil, err
	}

	// Zusätzliche Validierungen
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("konnte Claims nicht extrahieren")
	}

	// Prüfen der Audience
	checkAudience := false
	audInterface, ok := claims["aud"]
	if !ok {
		return nil, errors.New("keine Audience im Token")
	}

	// Behandlung für String oder Array
	switch aud := audInterface.(type) {
	case string:
		if aud == config.Audience {
			checkAudience = true
		}
	case []interface{}:
		for _, a := range aud {
			if a.(string) == config.Audience {
				checkAudience = true
				break
			}
		}
	default:
		return nil, errors.New("ungültiges Audience-Format")
	}

	if !checkAudience {
		return nil, errors.New("ungültige Audience")
	}

	// Prüfen des Ausstellers (Issuer)
	issuer, ok := claims["iss"].(string)
	if !ok || issuer != "https://"+config.Domain+"/" {
		return nil, errors.New("ungültiger Aussteller")
	}

	return token, nil
}

func GetClaim(c *gin.Context, key string) interface{} {
	user, exists := c.Get("user")
	if !exists {
		return nil
	}

	claims, ok := user.(jwt.MapClaims)
	if !ok {
		return nil
	}

	return claims[key]
}

// GetClaimString ist ein Hilfsmethode, die einen spezifischen Claim als String zurückgibt
// oder einen leeren String, falls der Claim nicht existiert oder kein String ist
func GetClaimString(c *gin.Context, key string) string {
	claim := GetClaim(c, key)
	if claim == nil {
		return ""
	}

	str, ok := claim.(string)
	if !ok {
		return ""
	}

	return str
}
