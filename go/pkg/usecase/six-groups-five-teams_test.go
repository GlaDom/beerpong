package usecase

import (
	"testing"

	"github.com/gladom/beerpong/pkg/models"
	"github.com/stretchr/testify/assert"
)

var updatedMatches = []models.Match{}

func TestCalculateRoundOfSixteen(t *testing.T) {
	sgft := NewSixGroupsFiveTeams(&MockGameRepo{})
	sgft.UpdateMatchesRoundOfSixteen(1)

	assert.Greater(t, len(updatedMatches), 0)
	for _, m := range updatedMatches {
		assert.NotEqual(t, m.AwayTeam, "")
	}
}

func TestSortTeamsById(t *testing.T) {
	input := []models.Team{
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team1", Points: 6, CupsHit: 28, CupsGet: 25, CupDifference: 3},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team2", Points: 3, CupsHit: 19, CupsGet: 33, CupDifference: 14},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team3", Points: 6, CupsHit: 30, CupsGet: 32, CupDifference: -2},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team4", Points: 9, CupsHit: 35, CupsGet: 17, CupDifference: 18},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team5", Points: 6, CupsHit: 27, CupsGet: 26, CupDifference: 1},
	}

	expected := []models.Team{
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team4", Points: 9, CupsHit: 35, CupsGet: 17, CupDifference: 18},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team1", Points: 6, CupsHit: 28, CupsGet: 25, CupDifference: 3},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team5", Points: 6, CupsHit: 27, CupsGet: 26, CupDifference: 1},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team3", Points: 6, CupsHit: 30, CupsGet: 32, CupDifference: -2},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team2", Points: 3, CupsHit: 19, CupsGet: 33, CupDifference: 14},
	}

	sgft := NewSixGroupsFiveTeams(&MockGameRepo{})

	sortedTeams := sgft.SortTeamsByPoints(input)
	assert.Equal(t, expected, sortedTeams)
}

type MockGameRepo struct{}

func (mr *MockGameRepo) GetGame() (*models.GameResponse, error) {
	return &models.GameResponse{}, nil
}
func (mr *MockGameRepo) GetGameByID(string) (*models.Game, error) {
	return &models.Game{}, nil
}
func (mr *MockGameRepo) CreateGame(*models.NewGame) error {
	return nil
}
func (mr *MockGameRepo) GetTeamByGameID(int, string, string) (models.Team, error) {
	return models.Team{}, nil
}
func (mr *MockGameRepo) GetMatchesByGameID(int) ([]models.Match, error) {
	return []models.Match{}, nil
}
func (mr *MockGameRepo) CreateMatches([]models.Match) error {
	return nil
}
func (mr *MockGameRepo) UpdateTeam(*models.Team) error {
	return nil
}
func (mr *MockGameRepo) UpdateGame(*models.Game) error {
	return nil
}

func (mr *MockGameRepo) GetTeamsByGameID(gameId int) ([]models.Team, error) {
	return getMockTeams(), nil
}

func (mr *MockGameRepo) GetMatchesByGameType(gameId int, gameMode string) ([]models.Match, error) {
	return []models.Match{
		{GameID: 1, MatchID: 1, Type: "round_of_16", GroupNumber: "A", Referee: ""},
		{GameID: 1, MatchID: 2, Type: "round_of_16", GroupNumber: "B", Referee: ""},
		{GameID: 1, MatchID: 3, Type: "round_of_16", GroupNumber: "C", Referee: ""},
		{GameID: 1, MatchID: 4, Type: "round_of_16", GroupNumber: "D", Referee: ""},
		{GameID: 1, MatchID: 5, Type: "round_of_16", GroupNumber: "E", Referee: ""},
		{GameID: 1, MatchID: 6, Type: "round_of_16", GroupNumber: "F", Referee: ""},
		{GameID: 1, MatchID: 7, Type: "round_of_16", GroupNumber: "A", Referee: ""},
		{GameID: 1, MatchID: 8, Type: "round_of_16", GroupNumber: "B", Referee: ""},
	}, nil
}

func (mr *MockGameRepo) UpdateMatches(m *models.Match) error {
	updatedMatches = append(updatedMatches, *m)
	return nil
}

func getMockTeams() []models.Team {
	return []models.Team{
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team1", Points: 6, CupsHit: 28, CupsGet: 25, CupDifference: 3},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team2", Points: 3, CupsHit: 19, CupsGet: 33, CupDifference: -14},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team3", Points: 6, CupsHit: 30, CupsGet: 32, CupDifference: -2},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team4", Points: 9, CupsHit: 35, CupsGet: 17, CupDifference: 18},
		{ID: 1, GameID: 1, GroupName: "A", TeamName: "Team5", Points: 6, CupsHit: 27, CupsGet: 26, CupDifference: 1},
		{ID: 1, GameID: 1, GroupName: "B", TeamName: "Team6", Points: 3, CupsHit: 18, CupsGet: 34, CupDifference: -16},
		{ID: 1, GameID: 1, GroupName: "B", TeamName: "Team7", Points: 3, CupsHit: 17, CupsGet: 32, CupDifference: -15},
		{ID: 1, GameID: 1, GroupName: "B", TeamName: "Team8", Points: 6, CupsHit: 28, CupsGet: 24, CupDifference: 4},
		{ID: 1, GameID: 1, GroupName: "B", TeamName: "Team9", Points: 6, CupsHit: 29, CupsGet: 25, CupDifference: 4},
		{ID: 1, GameID: 1, GroupName: "B", TeamName: "Team10", Points: 12, CupsHit: 40, CupsGet: 15, CupDifference: 25},
		{ID: 1, GameID: 1, GroupName: "C", TeamName: "Team11", Points: 3, CupsHit: 19, CupsGet: 33, CupDifference: -14},
		{ID: 1, GameID: 1, GroupName: "C", TeamName: "Team12", Points: 6, CupsHit: 27, CupsGet: 30, CupDifference: -3},
		{ID: 1, GameID: 1, GroupName: "C", TeamName: "Team13", Points: 6, CupsHit: 32, CupsGet: 25, CupDifference: 7},
		{ID: 1, GameID: 1, GroupName: "C", TeamName: "Team14", Points: 3, CupsHit: 22, CupsGet: 33, CupDifference: -11},
		{ID: 1, GameID: 1, GroupName: "C", TeamName: "Team15", Points: 12, CupsHit: 40, CupsGet: 15, CupDifference: 25},
		{ID: 1, GameID: 1, GroupName: "D", TeamName: "Team16", Points: 6, CupsHit: 27, CupsGet: 29, CupDifference: -2},
		{ID: 1, GameID: 1, GroupName: "D", TeamName: "Team17", Points: 3, CupsHit: 20, CupsGet: 34, CupDifference: 14},
		{ID: 1, GameID: 1, GroupName: "D", TeamName: "Team18", Points: 3, CupsHit: 15, CupsGet: 35, CupDifference: -20},
		{ID: 1, GameID: 1, GroupName: "D", TeamName: "Team19", Points: 9, CupsHit: 35, CupsGet: 17, CupDifference: 18},
		{ID: 1, GameID: 1, GroupName: "D", TeamName: "Team20", Points: 9, CupsHit: 38, CupsGet: 12, CupDifference: 26},
		{ID: 1, GameID: 1, GroupName: "E", TeamName: "Team21", Points: 3, CupsHit: 20, CupsGet: 33, CupDifference: -13},
		{ID: 1, GameID: 1, GroupName: "E", TeamName: "Team22", Points: 6, CupsHit: 34, CupsGet: 30, CupDifference: 4},
		{ID: 1, GameID: 1, GroupName: "E", TeamName: "Team23", Points: 9, CupsHit: 35, CupsGet: 18, CupDifference: 17},
		{ID: 1, GameID: 1, GroupName: "E", TeamName: "Team24", Points: 3, CupsHit: 25, CupsGet: 36, CupDifference: 11},
		{ID: 1, GameID: 1, GroupName: "E", TeamName: "Team25", Points: 9, CupsHit: 37, CupsGet: 14, CupDifference: 23},
		{ID: 1, GameID: 1, GroupName: "F", TeamName: "Team26", Points: 6, CupsHit: 23, CupsGet: 34, CupDifference: -11},
		{ID: 1, GameID: 1, GroupName: "F", TeamName: "Team27", Points: 6, CupsHit: 25, CupsGet: 20, CupDifference: 5},
		{ID: 1, GameID: 1, GroupName: "F", TeamName: "Team28", Points: 6, CupsHit: 30, CupsGet: 25, CupDifference: -5},
		{ID: 1, GameID: 1, GroupName: "F", TeamName: "Team29", Points: 6, CupsHit: 24, CupsGet: 30, CupDifference: -6},
		{ID: 1, GameID: 1, GroupName: "F", TeamName: "Team30", Points: 6, CupsHit: 25, CupsGet: 21, CupDifference: 4},
	}
}
