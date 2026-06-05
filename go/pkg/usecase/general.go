package usecase

import (
	"fmt"
	"sort"

	"github.com/gladom/beerpong/pkg/models"
)

const (
	quaterFinal    = "quaterFinal"
	roundOfSixteen = "roundOfSixteen"
	semiFinal      = "semiFinal"
	finalRound     = "final"
)

type General struct {
	GameRepo ITournamentrepo
}

func NewGeneral(gr ITournamentrepo) *General {
	return &General{
		GameRepo: gr,
	}
}

func (g *General) GetTournamentBySub(sub string) (*models.TournamentResponse, error) {
	return g.GameRepo.GetTournamentBySub(sub)
}

func (g *General) GetLastGameBySub(sub string) (*models.TournamentResponse, error) {
	return g.GameRepo.GetLastTournamentBySub(sub)
}

func (g *General) GetTeamsByGameID(gameID int) ([]models.Team, error) {
	return g.GameRepo.GetTeamsByTournamentID(gameID)
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
	return g.GameRepo.GetMatchesByTournamentID(gameID)
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

func (g *General) GetTeamByTournamentID(tournamentID int, teamName string, groupName string) (models.Team, error) {
	return g.GameRepo.GetTeamByTournamentID(tournamentID, teamName, groupName)
}

func (g *General) GetUpdatedTeam(currentTeam *models.Team, newTeam *models.TeamUpdate) *models.Team {
	retval := &models.Team{
		ID:            currentTeam.ID,
		GroupID:       currentTeam.GroupID,
		TournamentID:  currentTeam.TournamentID,
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

func (g *General) GetGameByID(tournamentID string) (*models.Tournament, error) {
	return g.GameRepo.GetTournamentByID(tournamentID)
}

func (ge *General) UpdateGame(g *models.Tournament) error {
	return ge.GameRepo.UpdateTournament(g)
}

func buildPlaceholderName(position int, groupName string) string {
	positionText := map[int]string{1: "1ter", 2: "2ter", 3: "3ter", 4: "4ter"}
	if text, ok := positionText[position]; ok {
		return fmt.Sprintf("%s Gruppe %s", text, groupName)
	}
	return fmt.Sprintf("%d. Gruppe %s", position, groupName)
}

func (g *General) SeedKORoundFromGroupStage(tournamentID int, roundType string) error {
	teams, err := g.GameRepo.GetTeamsByTournamentID(tournamentID)
	if err != nil {
		return err
	}

	grouped := make(map[string]models.Teams)
	for _, t := range teams {
		grouped[t.GroupName] = append(grouped[t.GroupName], t)
	}
	for name := range grouped {
		sort.Sort(grouped[name])
	}

	placeholderMap := make(map[string]string)
	for groupName, sortedTeams := range grouped {
		for i, team := range sortedTeams {
			placeholderMap[buildPlaceholderName(i+1, groupName)] = team.TeamName
		}
	}

	allMatches, err := g.GameRepo.GetMatchesByTournamentID(tournamentID)
	if err != nil {
		return err
	}

	for i := range allMatches {
		if allMatches[i].Type != roundType {
			continue
		}
		changed := false
		if name, ok := placeholderMap[allMatches[i].HomeTeam]; ok {
			allMatches[i].HomeTeam = name
			changed = true
		}
		if name, ok := placeholderMap[allMatches[i].AwayTeam]; ok {
			allMatches[i].AwayTeam = name
			changed = true
		}
		if changed {
			if err := g.GameRepo.UpdateMatches(&allMatches[i]); err != nil {
				return err
			}
		}
	}
	return nil
}

func (g *General) PropagateKORoundResults(tournamentID int, roundType string) error {
	allMatches, err := g.GameRepo.GetMatchesByTournamentID(tournamentID)
	if err != nil {
		return err
	}

	type snap struct{ home, away string }
	original := make(map[int]snap, len(allMatches))
	for _, m := range allMatches {
		original[m.ID] = snap{m.HomeTeam, m.AwayTeam}
	}

	for _, m := range allMatches {
		if m.Type != roundType {
			continue
		}
		if m.PointsHome == 0 && m.PointsAway == 0 {
			continue
		}
		allMatches = UpdateKOMatchWithResult(allMatches, m)
	}

	if roundType == semiFinal {
		var sfDone []models.Match
		for _, m := range allMatches {
			if m.Type == semiFinal && (m.PointsHome != 0 || m.PointsAway != 0) {
				sfDone = append(sfDone, m)
			}
		}
		sort.Slice(sfDone, func(i, j int) bool { return sfDone[i].MatchID < sfDone[j].MatchID })
		for i, sf := range sfDone {
			allMatches = UpdateKOMatchWithLoser(allMatches, sf, i+1)
		}
	}

	for i := range allMatches {
		s := original[allMatches[i].ID]
		if allMatches[i].HomeTeam != s.home || allMatches[i].AwayTeam != s.away {
			if err := g.GameRepo.UpdateMatches(&allMatches[i]); err != nil {
				return err
			}
		}
	}
	return nil
}

func (g *General) CalculateMatchesForKORound(tournamentId int, groups []models.Group) ([]*models.Match, error) {
	// Versuche, die RoundOfSixteen-Matches zu holen
	roundOfSixteen, err := g.GameRepo.GetRoundOfSixteenMatches(tournamentId, "roundOfSixteen")
	if err != nil {
		return nil, err
	}

	var koMatches []*models.Match

	if len(roundOfSixteen) > 0 {
		// Hole die Gruppensieger
		var groupWinners []models.Team
		for _, group := range groups {
			if len(group.Teams) == 0 {
				continue
			}
			// Annahme: Teams sind nach Punkten/CupDifference sortiert, erster ist Sieger
			groupWinner := group.Teams[0]
			groupWinners = append(groupWinners, groupWinner)
		}

		// Befülle die RoundOfSixteen-Matches mit den Gruppensiegern
		for i, match := range roundOfSixteen {
			if i < len(groupWinners) {
				match.HomeTeam = groupWinners[i].TeamName
			}
			koMatches = append(koMatches, match)
		}
		return koMatches, nil
	}

	// Falls keine RoundOfSixteen-Matches, versuche QuaterFinals
	quaterFinals, err := g.GameRepo.GetQuaterFinalMatches(tournamentId, quaterFinal)
	if err != nil {
		return nil, err
	}

	if len(quaterFinals) > 0 {
		var groupWinners []models.Team
		for _, group := range groups {
			if len(group.Teams) == 0 {
				continue
			}
			groupWinner := group.Teams[0]
			groupWinners = append(groupWinners, groupWinner)
		}

		for i, match := range quaterFinals {
			if i < len(groupWinners) {
				match.HomeTeam = groupWinners[i].TeamName
			}
			koMatches = append(koMatches, match)
		}
		return koMatches, nil
	}

	return nil, nil
}
