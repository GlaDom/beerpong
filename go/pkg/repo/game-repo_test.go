package repo

import (
	"fmt"
	"testing"

	"github.com/gladom/beerpong/pkg/interfaces"
)

func TestMatchCalculation(t *testing.T) {
	repo := NewGameRepo("host=localhost port=5432 user=admin password=beerpong dbname=beerpong sslmode=disable")

	testTeams := getTestTeams()

	matches := repo.calculateMatchesPerGroup(testTeams, 1)
	fmt.Print(matches)
}

func getTestTeams() []interfaces.Team {
	teams := []interfaces.Team{
		{GameID: 1, TeamName: "Team1", GroupName: "A", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team2", GroupName: "A", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team3", GroupName: "A", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team4", GroupName: "A", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team5", GroupName: "A", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team6", GroupName: "B", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team7", GroupName: "B", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team8", GroupName: "B", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team9", GroupName: "B", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team10", GroupName: "B", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team11", GroupName: "C", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team12", GroupName: "C", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team13", GroupName: "C", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team14", GroupName: "C", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team15", GroupName: "C", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team16", GroupName: "D", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team17", GroupName: "D", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team18", GroupName: "D", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team19", GroupName: "D", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team20", GroupName: "D", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team21", GroupName: "E", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team22", GroupName: "E", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team23", GroupName: "E", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team24", GroupName: "E", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team25", GroupName: "E", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team26", GroupName: "F", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team27", GroupName: "F", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team28", GroupName: "F", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team29", GroupName: "F", Points: 0, Rank: 0},
		{GameID: 1, TeamName: "Team30", GroupName: "F", Points: 0, Rank: 0},
	}
	return teams
}
