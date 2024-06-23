package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gladom/beerpong/pkg/models"
	"github.com/gladom/beerpong/pkg/usecase"
)

type IGameService interface {
	GenerateGamePlan(*models.NewGame) error
}

type beerpongGameHandler struct {
	General        usecase.General
	SixGFiveT_Mode usecase.SixGroupsFiveTeams
	OneGFiveT_Mode usecase.OneGroupFiveTeams
}

func NewBeerpongGameHandler(g usecase.General, sixGfiveT usecase.SixGroupsFiveTeams, oneGfiveT usecase.OneGroupFiveTeams) *beerpongGameHandler {
	return &beerpongGameHandler{
		SixGFiveT_Mode: sixGfiveT,
		OneGFiveT_Mode: oneGfiveT,
		General:        g,
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
func (h *beerpongGameHandler) CreateGame(c *gin.Context) {
	var game models.NewGame
	if err := c.ShouldBindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//handle different game modes
	switch game.Game.Mode {
	case 0:
		err := h.SixGFiveT_Mode.GenerateGamePlan(&game)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to handle create game request err: %s", err)})
			return
		}
	case 1:
		err := h.OneGFiveT_Mode.GenerateGamePlan(&game)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to handle create game request err: %s", err)})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to handle create game reqeust, err: not a valid mode"})
		return
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
func (h *beerpongGameHandler) GetGame(c *gin.Context) {
	// id := c.Param("id")

	game, err := h.General.GetGame()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	teams, err := h.General.GetTeamsByGameID(game.Game.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	game.Groups = h.General.GetGroups(teams)
	game.Matches, err = h.General.GetMatchesByGameID(game.Game.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	game.Matches = h.General.SortMatchesById(game.Matches)

	game.Groups = h.General.SortGroupsByAlphabet(game.Groups)
	for _, g := range game.Groups {
		g.Teams = h.General.SortTeamsByPoints(g.Teams)
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
func (h *beerpongGameHandler) UpdateMatches(c *gin.Context) {
	var m models.Match
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.UpdatedAt = time.Now()
	err := h.General.UpdateMatches(m)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
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
func (h *beerpongGameHandler) UpdateTeams(c *gin.Context) {
	var updateRequest models.TeamUpdateRequest
	retval := []models.Team{}
	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	for _, t := range updateRequest.Teams {
		//get current team entry
		currentTeam, err := h.General.GetTeamByGameID(t.GameID, t.TeamName, t.GroupName)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		}
		//update properties of team
		newTeam := h.General.GetUpdatedTeam(&currentTeam, &t)
		retval = append(retval, *newTeam)
		//save new team entry
		err = h.General.UpdateTeam(newTeam)
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, retval)
}

// Update RoundOf16 godoc
//
//	@Summary	Update the round of 16 matches
//	@Tags 		Match
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/updateMatchesRoundOfSixteen/:id [put]
func (h *beerpongGameHandler) UpdateGameRoundOf16(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")
	gameId, err := strconv.Atoi(idValue[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	err = h.SixGFiveT_Mode.UpdateMatchesRoundOfSixteen(gameId)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nil)
}

// Update Quaterfinals godoc
//
//	@Summary	Update the quaterfinal matches
//	@Tags 		Match
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/updateMatchesQuaterfinals/:id [put]
func (h *beerpongGameHandler) UpdateGameQuaterFinals(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")
	gameId, err := strconv.Atoi(idValue[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	err = h.SixGFiveT_Mode.UpdateMatchesQuaterFinals(gameId)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nil)
}

// Update SemiFinal godoc
//
//	@Summary	Update the semifinals
//	@Tags 		Match
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/updateMatchesSemifinals/:id [put]
func (h *beerpongGameHandler) UpdateGameSemiFinals(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")
	gameId, err := strconv.Atoi(idValue[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.SixGFiveT_Mode.UpdateMatchesSemiFinal(gameId)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nil)
}

// Update SemiFinal godoc
//
//	@Summary	Update the semifinals
//	@Tags 		Match
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/updateMatchesFinal/:id [put]
func (h *beerpongGameHandler) UpdateGameFinal(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")
	gameId, err := strconv.Atoi(idValue[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.SixGFiveT_Mode.UpdateMatchesFinal(gameId)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nil)
}

// Finish Game
//
//	@Summary	Finish the current game
//	@Tags 		Game
//	@Param 		id path string true "Game Id"
//	@Success	200 {object} map[string]any
//	@Failure	400 {object} map[string]any
//	@Router		/finishGame/:id [put]
func (h *beerpongGameHandler) FinishGame(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing game id"})
		return
	}
	idValue := strings.Split(id, "=")

	activeGame, err := h.General.GetGameByID(idValue[1])
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	activeGame.IsFinished = true
	err = h.General.UpdateGame(activeGame)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game finished"})
}
