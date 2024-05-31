package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	_ "github.com/gladom/beerpong/docs"
	"github.com/gladom/beerpong/pkg/repo"
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

	v1 := router.Group("/api/v1")
	{
		v1.POST("/createGame", gameRepo.CreateGame)
		v1.GET("/getGame", gameRepo.GetGame)
		v1.PUT("/finishGame/:id", gameRepo.FinishGame)
		// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)
		v1.PUT("/updateMatches", gameRepo.UpdateMatches)
		v1.PUT("/updateTeams", gameRepo.UpdateTeams)
	}
	router.Run(":8080")

}
