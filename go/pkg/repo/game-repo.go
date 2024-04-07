package repo

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gladom/beerpong/pkg/interfaces"
)

type Gamerepo struct {
	dbConn *sql.DB
}

func NewGameRepo(dbConnectionString string) *Gamerepo {
	// Verbindung zur PostgreSQL-Datenbank herstellen
	db, err := sql.Open("postgres", dbConnectionString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Überprüfen, ob die Verbindung ordnungsgemäß funktioniert
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Erfolgreich mit der PostgreSQL-Datenbank verbunden!")
	return &Gamerepo{
		dbConn: db,
	}
}

func (gr *Gamerepo) CreateGame(c *gin.Context) {
	var game interfaces.NewGame
	if err := c.ShouldBindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, game)
}

func (gr *Gamerepo) GetGame(c *gin.Context) {
	// id := c.Param("id")
	game := interfaces.Game{}

	c.JSON(http.StatusOK, game)
}

func (gr *Gamerepo) DeleteGame(c *gin.Context) {
	// id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Game deleted"})
}

func (gr *Gamerepo) UpdateGame(c *gin.Context) {
	// id := c.Param("id")

	c.JSON(http.StatusOK, interfaces.Game{})
}
