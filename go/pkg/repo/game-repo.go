package repo

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gladom/beerpong/pkg/interfaces"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Gamerepo struct {
	db *gorm.DB
}

func NewGameRepo(dbConnectionString string) *Gamerepo {
	// Verbindung zur PostgreSQL-Datenbank herstellen
	db, err := gorm.Open(postgres.Open(dbConnectionString), &gorm.Config{}) //sql.Open("postgres", dbConnectionString)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Erfolgreich mit der PostgreSQL-Datenbank verbunden!")
	return &Gamerepo{
		db: db,
	}
}

func (gr *Gamerepo) CreateGame(c *gin.Context) {
	var game interfaces.NewGame
	if err := c.ShouldBindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//handle different game modes
	switch game.Game.Mode {
	case 0:
		err := gr.handleGameMode30Teams(&game)
		if err != nil {
			c.JSON(http.StatusBadRequest, fmt.Errorf("failed to handle create game request err: %s", err))
			return
		}
	default:
		c.JSON(http.StatusBadRequest, fmt.Errorf("failed to handle create game reqeust, err: not a valid mode"))
	}

	c.JSON(http.StatusCreated, game)
}

func (gr *Gamerepo) GetGame(c *gin.Context) {
	// id := c.Param("id")
	game := interfaces.GameResponse{}
	if tx := gr.db.Where("is_finished=false").First(&game.Game); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error})
		return
	}
	if tx := gr.db.Where("game_id=?", game.Game.ID).Find(&game.Teams); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error})
		return
	}
	if tx := gr.db.Where("game_id=?", game.Game.ID).Find(&game.Matches); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (gr *Gamerepo) UpdateMatches(c *gin.Context) {

	c.JSON(http.StatusOK, nil)
}

func (gr *Gamerepo) DeleteGame(c *gin.Context) {
	// id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Game deleted"})
}

func (gr *Gamerepo) UpdateGame(c *gin.Context) {
	// id := c.Param("id")

	c.JSON(http.StatusOK, interfaces.Game{})
}

func (gr *Gamerepo) handleGameMode30Teams(game *interfaces.NewGame) error {
	if tx := gr.db.Create(&game.Game); tx.Error != nil {
		return tx.Error
	}
	if tx := gr.db.Create(&game.Teams); tx.Error != nil {
		return tx.Error
	}
	matches := gr.calculateMatchesPerGroup(game.Teams, game.Game.ID)
	if tx := gr.db.Create(&matches); tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (gr *Gamerepo) calculateMatchesPerGroup(teams []interfaces.Team, gameId int) []interfaces.Match {
	var matches []interfaces.Match

	//sort teams in groups
	groups := map[string][]interfaces.Team{}
	for _, t := range teams {
		//if no map entry for group create first one
		if _, ok := groups[t.GroupName]; !ok {
			groups[t.GroupName] = append(groups[t.GroupName], t)
			continue
		}
		groups[t.GroupName] = append(groups[t.GroupName], t)
	}

	//generate goup games
	for _, g := range groups {
		newmatches := generateSchedule(g, gameId, g[0].GroupName)
		matches = append(matches, newmatches...)
	}

	//add quarterfinals
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	//add semifinals
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "semifinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "semifinal", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	//add final
	matches = append(matches, interfaces.Match{GameID: gameId, Type: "final", GroupNumber: "", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	return matches
}

func generateSchedule(teams []interfaces.Team, gameId int, group string) []interfaces.Match {
	numTeams := len(teams)
	// numMatches := numTeams * (numTeams - 1) / 2 // Anzahl der Spiele

	// Erstellen eines leeren Spielplans
	schedule := make([]interfaces.Match, 0)

	// Erstellen aller möglichen Spiele
	allMatches := make([]interfaces.Match, 0)
	for i := 0; i < numTeams; i++ {
		for j := i + 1; j < numTeams; j++ {
			match := interfaces.Match{
				GameID:      gameId,
				Type:        "regular",
				GroupNumber: group,
				HomeTeam:    teams[i].TeamName,
				AwayTeam:    teams[j].TeamName,
				PointsHome:  0,
				PointsAway:  0,
			}
			allMatches = append(allMatches, match)
		}
	}

	numMatches := len(allMatches)
	// Generieren des Spielplans
	for i := 0; i < numMatches; i++ {
		// Zufälliges Spiel auswählen
		index := rand.Intn(len(allMatches))
		match := allMatches[index]

		schedule = append(schedule, match)

		// Entfernen des ausgewählten Spiels aus der Liste aller Spiele
		allMatches = append(allMatches[:index], allMatches[index+1:]...)
	}

	return schedule
}
