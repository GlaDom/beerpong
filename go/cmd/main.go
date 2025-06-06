package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/gladom/beerpong/docs"
	"github.com/gladom/beerpong/internal/handler"
	"github.com/gladom/beerpong/pkg/repo"
	"github.com/gladom/beerpong/pkg/requestvalidation"
	"github.com/gladom/beerpong/pkg/usecase"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			Gin Swagger Beerpong API
//	@version		1.0
//	@description	This is a beerpong server.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @host		localhost:8082
// @BasePath	/api/v1
// @schemes	http
func main() {
	// Auth0 Konfiguration
	auth0Config := requestvalidation.Auth0Config{
		Domain:        "dev-nduro5lf8x5ddjgj.eu.auth0.com",
		Audience:      "https://skbeerpongtst.com/api",
		JwksURI:       "https://dev-nduro5lf8x5ddjgj.eu.auth0.com/.well-known/jwks.json",
		TokenLifetime: 1 * time.Hour,
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Verbindungsinformationen zur PostgreSQL-Datenbank
	const (
		host     = "localhost" // Der Name des PostgreSQL-Containers
		port     = 5433        // Standard-PostgreSQL-Port
		user     = "admin"     // Ihr Benutzername
		password = "beerpong"  // Ihr Passwort
		dbname   = "beerpong"  // Der Name Ihrer Datenbank
	)

	// PostgreSQL-Verbindungsinformationen
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	gameRepo := repo.NewGameRepo(psqlInfo)
	general := usecase.NewGeneral(gameRepo)
	beerpongGameHandler := handler.NewBeerpongGameHandler(
		*general,
		*usecase.NewSixGroupsFiveTeams(gameRepo, *general),
		*usecase.NewOneGroupFiveTeams(gameRepo, *general),
	)

	v1 := router.Group("/api/v1")
	v1.Use(requestvalidation.NewAuth0Middleware(auth0Config))
	{
		v1.POST("/game", beerpongGameHandler.CreateGame)
		v1.GET("/game", beerpongGameHandler.GetGame)
		v1.PUT("/game/:id", beerpongGameHandler.FinishGame)
		// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)

		v1.PUT("/game/matches", beerpongGameHandler.UpdateMatches)
		v1.PUT("/game/matches/round-of-sixteen/:id", beerpongGameHandler.UpdateGameRoundOf16)
		v1.PUT("/game/matches/quaterfinals/:id", beerpongGameHandler.UpdateGameQuaterFinals)
		v1.PUT("/game/matches/semifinals/:id", beerpongGameHandler.UpdateGameSemiFinals)
		v1.PUT("/game/matches/final/:id", beerpongGameHandler.UpdateGameFinal)
		v1.PUT("/game/teams", beerpongGameHandler.UpdateTeams)
	}
	router.Run(":8082")

}
