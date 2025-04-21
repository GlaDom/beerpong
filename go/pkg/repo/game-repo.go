package repo

import (
	"fmt"
	"log"

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

func (gr *Gamerepo) CreateGame(game *models.NewGame) error {
	if tx := gr.db.Create(&game.Game); tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (gr *Gamerepo) CreateMatches(matches []*models.Match) error {
	if tx := gr.db.Create(&matches); tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (gr *Gamerepo) GetGameBySub(sub string) (*models.GameResponse, error) {
	retval := &models.GameResponse{}
	if tx := gr.db.Where("is_finished=false and user_sub=?", sub).Preload("Teams").First(&retval.Game); tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			return retval, fmt.Errorf("no active game found")
		}
		return retval, tx.Error
	}

	return retval, nil
}

func (gr *Gamerepo) GetTeamsByGameID(gameId int) ([]models.Team, error) {
	var retval []models.Team
	if tx := gr.db.Where("game_id=?", gameId).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetMatchesByGameID(gameId int) ([]models.Match, error) {
	var retval []models.Match
	if tx := gr.db.Where("game_id=?", gameId).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetMatchesByGameType(gameId int, gameMode string) ([]models.Match, error) {
	var retval []models.Match
	if tx := gr.db.Where("game_id=? and type=?", gameId, gameMode).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetTeamByGameID(gameId int, teamName string, groupName string) (models.Team, error) {
	var retval models.Team
	if tx := gr.db.Where("game_id=? and team_name=? and group_name=?", gameId, teamName, groupName).First(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) UpdateTeam(t *models.Team) error {
	tx := gr.db.Where("game_id=? and team_name=?", t.GameID, t.TeamName).Save(&t)
	return tx.Error
}

func (gr *Gamerepo) UpdateMatches(m *models.Match) error {
	tx := gr.db.Save(&m)
	return tx.Error
}

func (gr *Gamerepo) GetGameByID(gameId string) (*models.Game, error) {
	var retval *models.Game
	if tx := gr.db.Where("id=?", gameId).First(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) UpdateGame(g *models.Game) error {
	tx := gr.db.Save(&g)
	return tx.Error
}
