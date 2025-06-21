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

func (gr *Gamerepo) CreateTournament(t *models.NewTournament) error {
	if tx := gr.db.Create(&t.Tournament); tx.Error != nil {
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

func (gr *Gamerepo) GetTournamentBySub(sub string) (*models.TournamentResponse, error) {
	retval := &models.TournamentResponse{}
	if tx := gr.db.Where("is_finished=false and user_sub=?", sub).Preload("Groups.Teams").Preload("Groups").Preload("Referee").Preload("Matches").First(&retval.Tournament); tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			return retval, fmt.Errorf("no active game found")
		}
		return retval, tx.Error
	}

	return retval, nil
}

func (gr *Gamerepo) GetLastTournamentBySub(sub string) (*models.TournamentResponse, error) {
	retval := &models.TournamentResponse{}
	if tx := gr.db.Where("user_sub=?", sub).Preload("Groups.Teams").Preload("Groups").Preload("Referee").Preload("Matches").Last(&retval.Tournament); tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			return retval, fmt.Errorf("no game found")
		}
		return retval, tx.Error
	}

	return retval, nil
}

func (gr *Gamerepo) GetTeamsByTournamentID(tournamentId int) ([]models.Team, error) {
	var retval []models.Team
	if tx := gr.db.Where("tournament_id=?", tournamentId).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetMatchesByTournamentID(tournamentId int) ([]models.Match, error) {
	var retval []models.Match
	if tx := gr.db.Where("tournament_id=?", tournamentId).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetMatchesByTournamentType(tournamentId int, tournamentMode string) ([]models.Match, error) {
	var retval []models.Match
	if tx := gr.db.Where("tournament_id=? and type=?", tournamentId, tournamentMode).Find(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) GetTeamByTournamentID(tournamentId int, teamName string, groupName string) (models.Team, error) {
	var retval models.Team
	if tx := gr.db.Where("tournament_id=? and team_name=? and group_name=?", tournamentId, teamName, groupName).First(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) UpdateTeam(t *models.Team) error {
	tx := gr.db.Where("group_id=? and team_name=?", t.GroupID, t.TeamName).Save(&t)
	return tx.Error
}

func (gr *Gamerepo) UpdateMatches(m *models.Match) error {
	tx := gr.db.Save(&m)
	return tx.Error
}

func (gr *Gamerepo) GetTournamentByID(tournamentId string) (*models.Tournament, error) {
	var retval *models.Tournament
	if tx := gr.db.Where("id=?", tournamentId).First(&retval); tx.Error != nil {
		return retval, tx.Error
	}
	return retval, nil
}

func (gr *Gamerepo) UpdateTournament(g *models.Tournament) error {
	tx := gr.db.Save(&g)
	return tx.Error
}
