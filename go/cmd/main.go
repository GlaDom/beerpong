package main

import (
	"fmt"
	"net/http"
	"os"
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
	// Router initialisieren
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

	// Konfiguration aus json Datei laden
	var configuration *BeerpongConfig
	configuration, err := LoadConfig("config.json")
	if err != nil {
		fmt.Printf("Fehler beim Laden der Konfiguration: %v\n", err)
		os.Exit(1)
	}

	// PostgreSQL-Verbindungsinformationen
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		configuration.DatabaseConfig.Host,
		configuration.DatabaseConfig.Port,
		configuration.DatabaseConfig.User, configuration.DatabaseConfig.Password,
		configuration.DatabaseConfig.Database)

	gameRepo := repo.NewGameRepo(psqlInfo)
	general := usecase.NewGeneral(gameRepo)
	beerpongGameHandler := handler.NewBeerpongTournamentHandler(
		*general,
		*usecase.NewSixGroupsFiveTeams(gameRepo, *general),
		*usecase.NewOneGroupFiveTeams(gameRepo, *general),
		gameRepo,
	)

	configuration.Auth0Config.TokenLifetime = time.Duration(1 * time.Hour)
	v1 := router.Group("/api/v1")
	v1.Use(requestvalidation.NewAuth0Middleware(*configuration.Auth0Config))
	{
		v1.POST("/tournament", beerpongGameHandler.CreateGame)
		v1.GET("/tournament", beerpongGameHandler.GetTournament)
		v1.GET("/tournament/last", beerpongGameHandler.GetLastTournament)
		v1.PUT("/tournament/:id", beerpongGameHandler.FinishTournament)
		// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)

		v1.PUT("/tournament/matches", beerpongGameHandler.UpdateMatches)
		v1.PUT("/tournament/matches/round-of-sixteen/:id", beerpongGameHandler.UpdateTournamentRoundOf16)
		v1.PUT("/tournament/matches/quaterfinals/:id", beerpongGameHandler.UpdateTournamentQuaterFinals)
		v1.PUT("/tournament/matches/semifinals/:id", beerpongGameHandler.UpdateTournamentSemiFinals)
		v1.PUT("/tournament/matches/final/:id", beerpongGameHandler.UpdateTournamentFinal)
		v1.PUT("/tournament/teams", beerpongGameHandler.UpdateTeams)
	}
	router.Run(":8082")

}
