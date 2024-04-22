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
	router.POST(apiPrefix+"/creategame", gameRepo.CreateGame)
	router.GET(apiPrefix+"/getgame", gameRepo.GetGame)
	router.DELETE(apiPrefix+"/games/:id", gameRepo.DeleteGame)
	router.PUT(apiPrefix+"/games/:id", gameRepo.UpdateGame)

	router.Run(":8080")
}
