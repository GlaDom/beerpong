package repo

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gladom/beerpong/pkg/models"
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

// CreateGame godoc
//
//		@Summary		Create a new game
//		@Description	create a new game
//	 	@Tags 			Game
//		@Accept			json
//		@Produce		json
//		@Param			NewGame body models.NewGame true "New game to create"
//		@Success		201 {object} models.NewGame
//		@Failure		400 {object} map[string]any
//		@Router			/createGame [post]
func (gr *Gamerepo) CreateGame(c *gin.Context) {
	var game models.NewGame
	if err := c.ShouldBindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//handle different game modes
	switch game.Game.Mode {
	case 0:
		err := gr.handleGameMode30Teams(&game)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to handle create game request err: %s", err)})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, fmt.Errorf("failed to handle create game reqeust, err: not a valid mode"))
	}

	c.JSON(http.StatusCreated, game)
}

// GetGame godoc
//
//		@Summary		Get game
//		@Description	Get the current not finished game
//	 	@Tags			Game
//		@Produce		json
//		@Success		200 {object} models.GameResponse
//		@Failure 		404 {object} map[string]any
//		@Router			/getGame [get]
func (gr *Gamerepo) GetGame(c *gin.Context) {
	// id := c.Param("id")
	game := models.GameResponse{}
	teams := []models.Team{}
	if tx := gr.db.Where("is_finished=false").First(&game.Game); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		return
	}
	if tx := gr.db.Where("game_id=?", game.Game.ID).Find(&teams); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		return
	}
	game.Groups = gr.getGroups(teams)
	if tx := gr.db.Where("game_id=?", game.Game.ID).Find(&game.Matches); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		return
	}

	game.Matches = gr.sortMatchesById(game.Matches)

	game.Groups = gr.sortGroupsByAlphabet(game.Groups)
	for _, g := range game.Groups {
		g.Teams = gr.sortTeamsByPoints(g.Teams)
	}

	c.JSON(http.StatusOK, game)
}

// Update Matches godoc
//
//		@Summary	Update the matches from a specific game
//		@Tags 		Match
//		@Param		MatchUpdateRequest body models.MatchUpdateRequest true "Update Matches"
//		@Success	200 {object} map[string]any
//	 	@Failure 	400 {object} map[string]any
//		@Router		/updateMatches [put]
func (gr *Gamerepo) UpdateMatches(c *gin.Context) {
	var m models.Match
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.UpdatedAt = time.Now()
	if tx := gr.db.Where("game_id=? and away_team=? and home_team=? and match_id=?", m.GameID, m.AwayTeam, m.HomeTeam, m.MatchID).Save(&m); tx.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": tx.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

// Update Teams godoc
//
//	@Summary	Update the teams from the actual game
//	@Param 		Teams body models.TeamUpdateRequest true "Teams to update"
//	@Success	200 {object} map[string]any
//	@Failure 	400 {object} map[string]any
//	@Tags 		Teams
//	@Router		/updateTeams [put]
func (gr *Gamerepo) UpdateTeams(c *gin.Context) {
	var updateRequest models.TeamUpdateRequest
	retval := []models.Team{}
	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	for _, t := range updateRequest.Teams {
		//get current team entry
		var currentTeam *models.Team
		if tx := gr.db.Where("game_id=? and team_name=?", t.GameID, t.TeamName).First(&currentTeam); tx.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		}
		//update properties of team
		newTeam := gr.getUpdatedTeam(currentTeam, &t)
		retval = append(retval, *newTeam)
		//save new team entry
		if tx := gr.db.Where("game_id=? and team_name=?", t.GameID, t.TeamName).Save(&newTeam); tx.Error != nil {
			c.JSON(http.StatusConflict, gin.H{"error": tx.Error.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, retval)
}

// Finish Game
//
//	@Summary	Finish the current game
//	@Tags 		Game
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/finishGame/:id [put]
func (gr *Gamerepo) FinishGame(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")

	var activeGame *models.Game
	if tx := gr.db.Where("id=?", idValue[1]).First(&activeGame); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		return
	}
	activeGame.IsFinished = true
	if tx := gr.db.Save(&activeGame); tx.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": tx.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game finished"})
}

func (gr *Gamerepo) handleGameMode30Teams(game *models.NewGame) error {
	//save new game
	if tx := gr.db.Create(&game.Game); tx.Error != nil {
		return tx.Error
	}
	//calculate matches for game
	matches := gr.calculateMatchesPerGroup(game.Game.Teams, game.Game.ID, game.Game.Referee)
	if tx := gr.db.Create(&matches); tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (gr *Gamerepo) sortGroupsByAlphabet(groups []models.Group) []models.Group {
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].GroupName < groups[j].GroupName
	})
	return groups
}

func (gr *Gamerepo) sortTeamsByPoints(teams []models.Team) []models.Team {
	sort.Slice(teams, func(i, j int) bool {
		return teams[i].Points > teams[j].Points
	})
	return teams
}

func (gr *Gamerepo) sortMatchesById(matches []models.Match) []models.Match {
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].MatchID < matches[j].MatchID
	})
	return matches
}

func (gr *Gamerepo) getGroups(teams []models.Team) []models.Group {
	retval := []models.Group{}
	groupMap := map[string]models.Group{}

	for _, t := range teams {
		if _, ok := groupMap[t.GroupName]; ok {
			tmpTeams := groupMap[t.GroupName].Teams
			tmpTeams = append(tmpTeams, t)
			mapEntry := models.Group{
				GroupName: t.GroupName,
				Teams:     tmpTeams,
			}
			groupMap[t.GroupName] = mapEntry
		} else {
			groupMap[t.GroupName] = models.Group{
				GroupName: t.GroupName,
				Teams:     []models.Team{t},
			}
		}
	}

	for _, k := range groupMap {
		retval = append(retval, k)
	}
	return retval
}

func (gr *Gamerepo) calculateMatchesPerGroup(teams []models.Team, gameId int, referees []models.Referee) []models.Match {
	var matches []models.Match

	//sort teams in groups
	groups := map[string][]models.Team{}
	for _, t := range teams {
		//if no map entry for group create first one
		if _, ok := groups[t.GroupName]; !ok {
			groups[t.GroupName] = append(groups[t.GroupName], t)
			continue
		}
		groups[t.GroupName] = append(groups[t.GroupName], t)
	}

	//split referees for every group (min 12 referees)

	//generate goup games
	for _, g := range groups {
		refs := []models.Referee{}
		switch g[0].GroupName {
		case "A":
			refs = referees[:2]
		case "B":
			refs = referees[2:4]
		case "C":
			refs = referees[4:6]
		case "D":
			refs = referees[6:8]
		case "E":
			refs = referees[8:10]
		case "F":
			refs = referees[10:]
		default:
			break
		}
		newmatches := generateSchedule(g, gameId, g[0].GroupName, refs)
		matches = append(matches, newmatches...)
	}

	//add round of 16
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "C", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "D", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "E", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "F", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	//add quarterfinals
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "C", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "D", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	//add semifinals
	matches = append(matches, models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})
	matches = append(matches, models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	//add final
	matches = append(matches, models.Match{GameID: gameId, Type: "final", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0})

	return matches
}

func generateSchedule(teams []models.Team, gameId int, group string, referees []models.Referee) []models.Match {
	numTeams := len(teams)
	// numMatches := numTeams * (numTeams - 1) / 2 // Anzahl der Spiele

	// Erstellen eines leeren Spielplans
	schedule := make([]models.Match, 0)

	refereeCounter := 0
	// Erstellen aller möglichen Spiele
	allMatches := make([]models.Match, 0)
	for i := 0; i < numTeams; i++ {
		for j := i + 1; j < numTeams; j++ {
			if refereeCounter == 3 {
				refereeCounter = 0
			}
			match := models.Match{
				GameID:      gameId,
				Type:        "regular",
				GroupNumber: group,
				HomeTeam:    teams[i].TeamName,
				AwayTeam:    teams[j].TeamName,
				PointsHome:  0,
				PointsAway:  0,
				Referee:     referees[refereeCounter].Name,
			}
			allMatches = append(allMatches, match)
			refereeCounter++
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

func (gr *Gamerepo) getUpdatedTeam(currentTeam *models.Team, newTeam *models.TeamUpdate) *models.Team {
	retval := &models.Team{
		ID:        currentTeam.ID,
		GameID:    currentTeam.GameID,
		GroupName: currentTeam.GroupName,
		TeamName:  currentTeam.TeamName,
		Points:    currentTeam.Points + newTeam.PointsToAdd,
		CupsHit:   currentTeam.CupsHit + newTeam.CupsHitted,
		CupsGet:   currentTeam.CupsGet + newTeam.CupsGot,
	}
	return retval
}
