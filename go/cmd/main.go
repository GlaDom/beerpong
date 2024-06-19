package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/gladom/beerpong/docs"
	"github.com/gladom/beerpong/internal/handler"
	"github.com/gladom/beerpong/pkg/repo"
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

// @host		localhost:8080
// @BasePath	/api/v1
// @schemes	http
func main() {

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
		port     = 5432        // Standard-PostgreSQL-Port
		user     = "admin"     // Ihr Benutzername
		password = "beerpong"  // Ihr Passwort
		dbname   = "beerpong"  // Der Name Ihrer Datenbank
	)

	// PostgreSQL-Verbindungsinformationen
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	gameRepo := repo.NewGameRepo(psqlInfo)
	beerpongGameHandler := handler.NewBeerpongGameHandler(
		*usecase.NewSixGroupsFiveTeams(gameRepo),
	)

	v1 := router.Group("/api/v1")
	{
		v1.POST("/createGame", beerpongGameHandler.CreateGame)
		v1.GET("/getGame", beerpongGameHandler.GetGame)
		v1.PUT("/finishGame/:id", beerpongGameHandler.FinishGame)
		// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)
		v1.PUT("/updateMatches", beerpongGameHandler.UpdateMatches)
		v1.PUT("/updateMatchesRoundOfSixteen/:id", beerpongGameHandler.UpdateGameRoundOf16)
		v1.PUT("/updateMatchesQuaterfinals/:id", beerpongGameHandler.UpdateGameQuaterFinals)
		v1.PUT("/updateMatchesSemifinals/:id", beerpongGameHandler.UpdateGameSemiFinals)
		v1.PUT("/updateMatchesFinal/:id", beerpongGameHandler.UpdateGameSemiFinals)
		v1.PUT("/updateTeams", beerpongGameHandler.UpdateTeams)
	}
	router.Run(":8080")

}
