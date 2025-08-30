package usecase

import "github.com/gladom/beerpong/pkg/models"

type ITournamentrepo interface {
	GetTournamentBySub(string) (*models.TournamentResponse, error)
	GetLastTournamentBySub(string) (*models.TournamentResponse, error)
	GetTournamentByID(string) (*models.Tournament, error)
	CreateTournament(*models.NewTournament) error
	GetTeamsByTournamentID(int) ([]models.Team, error)
	GetTeamByTournamentID(int, string, string) (models.Team, error)
	GetMatchesByTournamentType(int, string) ([]models.Match, error)
	GetMatchesByTournamentID(int) ([]models.Match, error)
	CreateMatches([]*models.Match) error
	UpdateMatches(*models.Match) error
	UpdateTeam(*models.Team) error
	UpdateTournament(*models.Tournament) error
}
