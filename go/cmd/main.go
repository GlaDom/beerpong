package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gladom/beerpong/pkg/repo"
	_ "github.com/lib/pq"
)

func main() {

	router := gin.Default()

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
	router.POST(apiPrefix+"/createGame", gameRepo.CreateGame)
	router.GET(apiPrefix+"/getGame", gameRepo.GetGame)
	router.PUT(apiPrefix+"/finishGame/:id", gameRepo.FinishGame)
	// router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)

	//match specific endpoints
	router.PUT(apiPrefix+"/updateMatches", gameRepo.UpdateMatches)

	//team specific endpoint
	router.PUT(apiPrefix+"/updateTeams", gameRepo.UpdateTeams)

	router.Run(":8080")
}
