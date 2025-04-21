package usecase

import (
	"sort"

	"github.com/gladom/beerpong/pkg/models"
)

type General struct {
	GameRepo IGamerepo
}

func NewGeneral(gr IGamerepo) *General {
	return &General{
		GameRepo: gr,
	}
}

func (g *General) GetGameBySub(sub string) (*models.GameResponse, error) {
	return g.GameRepo.GetGameBySub(sub)
}

func (g *General) GetTeamsByGameID(gameID int) ([]models.Team, error) {
	return g.GameRepo.GetTeamsByGameID(gameID)
}

func (g *General) GetGroups(teams []models.Team) []models.Group {
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

func (g *General) GetMatchesByGameID(gameID int) ([]models.Match, error) {
	return g.GameRepo.GetMatchesByGameID(gameID)
}

func (g *General) SortMatchesById(matches []models.Match) []models.Match {
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].MatchID < matches[j].MatchID
	})
	return matches
}

func (g *General) SortGroupsByAlphabet(groups []models.Group) []models.Group {
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].GroupName < groups[j].GroupName
	})
	return groups
}

func (g *General) SortTeamsByPoints(teams models.Teams) []models.Team {
	sort.Sort(teams)
	return teams
}

func (g *General) UpdateMatches(match models.Match) error {
	return g.GameRepo.UpdateMatches(&match)
}

func (g *General) GetTeamByGameID(gameID int, teamName string, groupName string) (models.Team, error) {
	return g.GameRepo.GetTeamByGameID(gameID, teamName, groupName)
}

func (g *General) GetUpdatedTeam(currentTeam *models.Team, newTeam *models.TeamUpdate) *models.Team {
	retval := &models.Team{
		ID:            currentTeam.ID,
		GameID:        currentTeam.GameID,
		GroupName:     currentTeam.GroupName,
		TeamName:      currentTeam.TeamName,
		Points:        currentTeam.Points + newTeam.PointsToAdd,
		CupsHit:       currentTeam.CupsHit + newTeam.CupsHitted,
		CupsGet:       currentTeam.CupsGet + newTeam.CupsGot,
		CupDifference: currentTeam.CupDifference + (newTeam.CupsHitted - newTeam.CupsGot),
	}
	return retval
}

func (g *General) UpdateTeam(team *models.Team) error {
	return g.GameRepo.UpdateTeam(team)
}

func (g *General) GetGameByID(gameID string) (*models.Game, error) {
	return g.GameRepo.GetGameByID(gameID)
}

func (ge *General) UpdateGame(g *models.Game) error {
	return ge.GameRepo.UpdateGame(g)
}

func (g *General) matchesAreFinished(gameId int, matchType string) bool {
	//get matches
	matches, err := g.GameRepo.GetMatchesByGameType(gameId, matchType)
	if err != nil {
		return false
	}
	for _, m := range matches {
		if m.PointsHome != 0 || m.PointsAway != 0 {
			continue
		} else {
			return false
		}
	}
	return true
}
