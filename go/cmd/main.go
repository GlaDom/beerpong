package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	_ "github.com/gladom/beerpong/cmd/docs"
	"github.com/gladom/beerpong/pkg/repo"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Gin Swagger Beerpong API
// @version 1.0
// @description This is a beerpong server.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /
// @schemes http
func main() {

	router := gin.Default()

	// url := ginSwagger.URL("http://localhost:8080/swagger/doc.json")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	const apiPrefix = "/api"

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

	//game routes

	//game specific endpoints

	// @Summary Create a new game
	// @Accept json
	// @Produce json
	// @Success 200 {game} string ok
	router.POST(apiPrefix+"/createGame", gameRepo.CreateGame)

	// @Summary Get the current not finished game
	// @Produce json
	router.GET(apiPrefix+"/getGame", gameRepo.GetGame)

	// @Summary Finish the current game
	router.PUT(apiPrefix+"/finishGame/:id", gameRepo.FinishGame)
	// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)

	//match specific endpoints

	// @Summary Update the matches from a specific game
	router.PUT(apiPrefix+"/updateMatches", gameRepo.UpdateMatches)

	//team specific endpoint

	// @Summary Update the teams from the actual game
	router.PUT(apiPrefix+"/updateTeams", gameRepo.UpdateTeams)

	router.Run(":8080")
}
