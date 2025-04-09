package usecase

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gladom/beerpong/pkg/models"
)

type IGamerepo interface {
	GetGame() (*models.GameResponse, error)
	GetGameByID(string) (*models.Game, error)
	CreateGame(*models.NewGame) error
	GetTeamsByGameID(int) ([]models.Team, error)
	GetTeamByGameID(int, string, string) (models.Team, error)
	GetMatchesByGameType(int, string) ([]models.Match, error)
	GetMatchesByGameID(int) ([]models.Match, error)
	CreateMatches([]*models.Match) error
	UpdateMatches(*models.Match) error
	UpdateTeam(*models.Team) error
	UpdateGame(*models.Game) error
}

type SixGroupsFiveTeams struct {
	General  General
	GameRepo IGamerepo
}

func NewSixGroupsFiveTeams(gr IGamerepo, g General) *SixGroupsFiveTeams {
	return &SixGroupsFiveTeams{
		GameRepo: gr,
		General:  g,
	}
}

func (s *SixGroupsFiveTeams) GenerateGamePlan(game *models.NewGame) error {
	//save new game
	err := s.GameRepo.CreateGame(game)
	if err != nil {
		return err
	}
	//calculate matches for game
	matches := s.calculateMatchesPerGroup(game.Game.Teams, game.Game.ID, game.Game.Referee, game.Game.StartTime, game.Game.GameTime)
	err = s.GameRepo.CreateMatches(matches)
	if err != nil {
		return err
	}
	return nil
}

func (s *SixGroupsFiveTeams) UpdateMatchesRoundOfSixteen(gameId int) error {
	if !s.General.matchesAreFinished(gameId, "regular") {
		return fmt.Errorf("matches not finished yet")
	}
	//get teams of game
	teams, err := s.GameRepo.GetTeamsByGameID(gameId)
	if err != nil {
		return err
	}
	//aufteilen in gruppen
	groups := s.General.GetGroups(teams)
	//gurppen sortieren nach Punkte
	groups = s.General.SortGroupsByAlphabet(groups)
	for i, g := range groups {
		groups[i].Teams = s.General.SortTeamsByPoints(g.Teams)
	}
	//alle 3.-platzierten der gruppen filtern
	bestThirdPlaces := s.filterForBestThirdPlaces(groups)
	for i := range groups {
		//ersten beiden je gruppe filtern
		groups[i].Teams = groups[i].Teams[:2]
	}
	//alle round_of_16 matches holen
	matches, err := s.GameRepo.GetMatchesByGameType(gameId, "round_of_16")
	if err != nil {
		return err
	}

	//spiele entsprechend updaten und speichern
	updatedMatches := s.calculateRoundOf16(groups, bestThirdPlaces, matches)
	// spiele speichern
	for _, g := range updatedMatches {
		err := s.GameRepo.UpdateMatches(&g)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *SixGroupsFiveTeams) UpdateMatchesQuaterFinals(gameId int) error {
	if !s.General.matchesAreFinished(gameId, "round_of_16") {
		return fmt.Errorf("matches not finished yet")
	}
	//get matches of round of 16
	roundOfSixteen, err := s.GameRepo.GetMatchesByGameType(gameId, "round_of_16")
	if err != nil {
		return err
	}
	//get matches of quaterfinals
	quaterfinals, err := s.GameRepo.GetMatchesByGameType(gameId, "quaterfinal")
	if err != nil {
		return err
	}
	for i := range quaterfinals {
		switch i {
		case 0:
			quaterfinals[i].HomeTeam = s.getWinnerOfMatch(roundOfSixteen[0])
			quaterfinals[i].AwayTeam = s.getWinnerOfMatch(roundOfSixteen[2])
		case 1:
			quaterfinals[i].HomeTeam = s.getWinnerOfMatch(roundOfSixteen[1])
			quaterfinals[i].AwayTeam = s.getWinnerOfMatch(roundOfSixteen[5])
		case 2:
			quaterfinals[i].HomeTeam = s.getWinnerOfMatch(roundOfSixteen[4])
			quaterfinals[i].AwayTeam = s.getWinnerOfMatch(roundOfSixteen[6])
		case 3:
			quaterfinals[i].HomeTeam = s.getWinnerOfMatch(roundOfSixteen[3])
			quaterfinals[i].AwayTeam = s.getWinnerOfMatch(roundOfSixteen[7])
		}
	}
	for _, m := range quaterfinals {
		err := s.GameRepo.UpdateMatches(&m)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *SixGroupsFiveTeams) UpdateMatchesSemiFinal(gameId int) error {
	if !s.General.matchesAreFinished(gameId, "quaterfinal") {
		return fmt.Errorf("matches not finished yet")
	}
	//get quaterfinals
	quaterFinals, err := s.GameRepo.GetMatchesByGameType(gameId, "quaterfinal")
	if err != nil {
		return err
	}
	//get semifinals
	semiFinals, err := s.GameRepo.GetMatchesByGameType(gameId, "semifinal")
	if err != nil {
		return err
	}

	for i := range semiFinals {
		switch i {
		case 0:
			semiFinals[i].HomeTeam = s.getWinnerOfMatch(quaterFinals[0])
			semiFinals[i].AwayTeam = s.getWinnerOfMatch(quaterFinals[1])
		case 1:
			semiFinals[i].HomeTeam = s.getWinnerOfMatch(quaterFinals[2])
			semiFinals[i].AwayTeam = s.getWinnerOfMatch(quaterFinals[3])
		}
	}

	for _, m := range semiFinals {
		err := s.General.UpdateMatches(m)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *SixGroupsFiveTeams) UpdateMatchesFinal(gameId int) error {
	if !s.General.matchesAreFinished(gameId, "semifinal") {
		return fmt.Errorf("matches not finished yet")
	}
	//get semifinals
	semifinal, err := s.GameRepo.GetMatchesByGameType(gameId, "semifinal")
	if err != nil {
		return err
	}
	//get final
	final, err := s.GameRepo.GetMatchesByGameType(gameId, "final")
	if err != nil {
		return err
	}

	final[0].HomeTeam = s.getWinnerOfMatch(semifinal[0])
	final[0].AwayTeam = s.getWinnerOfMatch(semifinal[1])

	err = s.General.UpdateMatches(final[0])
	if err != nil {
		return err
	}

	return nil
}

func (s *SixGroupsFiveTeams) getWinnerOfMatch(m models.Match) string {
	retval := m.HomeTeam
	if m.PointsAway > m.PointsHome {
		retval = m.AwayTeam
	}
	return retval
}

func (s *SixGroupsFiveTeams) filterForBestThirdPlaces(groups []models.Group) []models.Team {
	retval := []models.Team{}
	for _, g := range groups {
		retval = append(retval, g.Teams[2])
	}
	retval = s.General.SortTeamsByPoints(retval)
	retval = retval[:4]
	return retval
}

func (s *SixGroupsFiveTeams) calculateMatchesPerGroup(teams []models.Team, gameId int, referees []models.Referee, startTime time.Time, playTime time.Duration) []*models.Match {
	var matches []*models.Match

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

	//set playtime to minutes
	playTime = playTime * time.Minute

	//split referees for every group (min 12 referees)

	//generate goup games
	for _, g := range groups {
		refs := []models.Referee{}
		switch g[0].GroupName {
		case "A":
			if len(referees) > 2 {
				refs = referees[:2]
			}
		case "B":
			if len(referees) > 4 {
				refs = referees[2:4]
			}
		case "C":
			if len(referees) > 6 {
				refs = referees[4:6]
			}
		case "D":
			if len(referees) > 8 {
				refs = referees[6:8]
			}
		case "E":
			if len(referees) > 10 {
				refs = referees[8:10]
			}
		case "F":
			if len(referees) > 11 {
				refs = referees[10:]
			}
		default:
			continue
		}
		newmatches := generateSchedule(g, gameId, g[0].GroupName, refs, startTime, playTime)
		matches = append(matches, newmatches...)
	}

	startOfRoundOf16 := startTime.Add(playTime * 10)

	//add round of 16
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "2. Gruppe A", AwayTeam: "2. Gruppe C", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "1. Gruppe B", AwayTeam: "3. Gruppe B/E/F", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "C", HomeTeam: "1. Gruppe D", AwayTeam: "3. Gruppe A/C/D", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "D", HomeTeam: "1. Gruppe A", AwayTeam: "3. Gruppe A/B/F", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "E", HomeTeam: "1. Gruppe C", AwayTeam: "3. Gruppe C/D/E", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "F", HomeTeam: "1. Gruppe F", AwayTeam: "2. Gruppe E", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "1. Gruppe E", AwayTeam: "2. Gruppe D", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16.Add(playTime), EndTime: startOfRoundOf16.Add(playTime * 2)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "1. Gruppe B", AwayTeam: "2. Gruppe F", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16.Add(playTime), EndTime: startOfRoundOf16.Add(playTime * 2)})

	startOfQuaterFinals := startOfRoundOf16.Add(playTime * 2)
	//add quarterfinals
	matches = append(matches, &models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "A", HomeTeam: "Sieger 1. Achtelfinale", AwayTeam: "Sieger 3. Achtelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, &models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "B", HomeTeam: "Sieger 2. Achtelfinale", AwayTeam: "Sieger 6. Achtelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, &models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "C", HomeTeam: "Sieger 5. Achtelfinale", AwayTeam: "Sieger 7. Achtelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, &models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "D", HomeTeam: "Sieger 4. Achtelfinale", AwayTeam: "Sieger 8. Achtelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})

	startOfSemiFinals := startOfQuaterFinals.Add(playTime)
	//add semifinals
	matches = append(matches, &models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "A", HomeTeam: "Sieger 1. Viertelfinale", AwayTeam: "Sieger 2. Viertelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals, EndTime: startOfSemiFinals.Add(playTime)})
	matches = append(matches, &models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "B", HomeTeam: "Sieger 3. Viertelfinale", AwayTeam: "Sieger 4. Viertelfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals, EndTime: startOfSemiFinals.Add(playTime)})

	//add final
	matches = append(matches, &models.Match{GameID: gameId, Type: "final", GroupNumber: "A", HomeTeam: "Sieger 1. Halbfinale", AwayTeam: "Sieger 2. Halbfinale", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals.Add(playTime), EndTime: startOfSemiFinals.Add((playTime * 2))})

	return matches
}

func generateSchedule(teams []models.Team, gameId int, group string, referees []models.Referee, startTime time.Time, playTime time.Duration) []*models.Match {
	numTeams := len(teams)
	// numMatches := numTeams * (numTeams - 1) / 2 // Anzahl der Spiele

	// Erstellen eines leeren Spielplans
	schedule := make([]*models.Match, 0)

	// Erstellen aller möglichen Spiele
	allMatches := make([]*models.Match, 0)
	for i := 0; i < numTeams; i++ {
		for j := i + 1; j < numTeams; j++ {
			match := &models.Match{
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

	refereeCounter := 0
	numMatches := len(allMatches)
	// Generieren des Spielplans
	for i := 0; i < numMatches; i++ {
		if refereeCounter == 2 {
			refereeCounter = 0
		}
		// Zufälliges Spiel auswählen
		index := rand.Intn(len(allMatches))
		match := allMatches[index]
		if len(referees) > refereeCounter {
			match.Referee = referees[refereeCounter].Name
		} else {
			match.Referee = " - "
		}

		schedule = append(schedule, match)

		// Entfernen des ausgewählten Spiels aus der Liste aller Spiele
		allMatches = append(allMatches[:index], allMatches[index+1:]...)
		refereeCounter++
	}

	tmpTime := time.Now()
	for i, _ := range schedule {
		if i == 0 {
			schedule[i].StartTime = startTime
			schedule[i].EndTime = startTime.Add(playTime)
		} else {
			// endTime := tmpTime.Add(playTime)
			schedule[i].StartTime = tmpTime
			schedule[i].EndTime = tmpTime.Add(playTime)
		}
		tmpTime = schedule[i].EndTime
	}

	return schedule
}

func (s *SixGroupsFiveTeams) calculateRoundOf16(groups []models.Group, bestThirdPlaces []models.Team, matches []models.Match) []models.Match {
	retval := []models.Match{}
	for i, m := range matches {
		m.UpdatedAt = time.Now()
		switch i {
		case 0:
			m.HomeTeam = groups[0].Teams[1].TeamName
			m.AwayTeam = groups[2].Teams[1].TeamName
		case 1:
			m.HomeTeam = groups[1].Teams[0].TeamName
			updatedBestThirdPlaces, bestThirdFromGrouBEF := s.getBestThirdPlaceFromGroup("BEF", bestThirdPlaces)
			bestThirdPlaces = updatedBestThirdPlaces
			m.AwayTeam = bestThirdFromGrouBEF
		case 2:
			m.HomeTeam = groups[3].Teams[0].TeamName
			updatedBestThirdPlaces, bestThirdFromGrouACD := s.getBestThirdPlaceFromGroup("ACD", bestThirdPlaces)
			bestThirdPlaces = updatedBestThirdPlaces
			m.AwayTeam = bestThirdFromGrouACD
		case 3:
			m.HomeTeam = groups[0].Teams[0].TeamName
			updatedBestThirdPlaces, bestThirdFromGroupABF := s.getBestThirdPlaceFromGroup("ABF", bestThirdPlaces)
			bestThirdPlaces = updatedBestThirdPlaces
			m.AwayTeam = bestThirdFromGroupABF
		case 4:
			m.HomeTeam = groups[2].Teams[0].TeamName
			updatedBestThirdPlaces, bestThirdFromGroupCDE := s.getBestThirdPlaceFromGroup("CDE", bestThirdPlaces)
			bestThirdPlaces = updatedBestThirdPlaces
			m.AwayTeam = bestThirdFromGroupCDE
		case 5:
			m.HomeTeam = groups[5].Teams[0].TeamName
			m.AwayTeam = groups[4].Teams[1].TeamName
		case 6:
			m.HomeTeam = groups[4].Teams[0].TeamName
			m.AwayTeam = groups[3].Teams[1].TeamName
		case 7:
			m.HomeTeam = groups[1].Teams[0].TeamName
			m.AwayTeam = groups[5].Teams[1].TeamName
		}
		retval = append(retval, m)
	}

	for i, m := range retval {
		if m.AwayTeam == "" && len(bestThirdPlaces) > 0 {
			retval[i].AwayTeam = bestThirdPlaces[0].TeamName
		}
	}

	return retval
}

func (s *SixGroupsFiveTeams) getBestThirdPlaceFromGroup(groupsString string, bestThirdPlaces []models.Team) ([]models.Team, string) {
	teamName := ""
	updatedBestThirdPlaces := []models.Team{}
	for _, t := range bestThirdPlaces {
		if strings.Contains(groupsString, t.GroupName) {
			teamName = t.TeamName
			break
		}
	}
	for _, t := range bestThirdPlaces {
		if t.TeamName != teamName {
			updatedBestThirdPlaces = append(updatedBestThirdPlaces, t)
		}
	}
	return updatedBestThirdPlaces, teamName
}
