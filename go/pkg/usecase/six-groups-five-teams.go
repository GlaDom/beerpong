package usecase

import (
	"fmt"
	"math/rand"
	"sort"
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
	CreateMatches([]models.Match) error
	UpdateMatches(*models.Match) error
	UpdateTeam(*models.Team) error
	UpdateGame(*models.Game) error
}

type SixGroupsFiveTeams struct {
	GameRepo IGamerepo
}

func NewSixGroupsFiveTeams(gr IGamerepo) *SixGroupsFiveTeams {
	return &SixGroupsFiveTeams{
		GameRepo: gr,
	}
}

func (s *SixGroupsFiveTeams) HandleGameMode30Teams(game *models.NewGame) error {
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
	if !s.matchesAreFinished(gameId, "regular") {
		return fmt.Errorf("matches not finished yet")
	}
	//get teams of game
	teams, err := s.GameRepo.GetTeamsByGameID(gameId)
	if err != nil {
		return err
	}
	//aufteilen in gruppen
	groups := s.GetGroups(teams)
	//gurppen sortieren nach Punkte
	groups = s.SortGroupsByAlphabet(groups)
	for i, g := range groups {
		groups[i].Teams = s.SortTeamsByPoints(g.Teams)
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
	if !s.matchesAreFinished(gameId, "round_of_16") {
		return fmt.Errorf("matches not finished yet")
	}
	//get matches of round of 16
	roundOfSixteen, err := s.GameRepo.GetMatchesByGameType(gameId, "round_of_16")
	if err != nil {
		return err
	}
	//get matches of quaterfinals
	quaterfinals, err := s.GameRepo.GetMatchesByGameType(gameId, "quaterfinals")
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
	if !s.matchesAreFinished(gameId, "quaterfinal") {
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
		err := s.UpdateMatches(m)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *SixGroupsFiveTeams) UpdateMatchesFinal(gameId int) error {
	if !s.matchesAreFinished(gameId, "semifinal") {
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

	err = s.UpdateMatches(final[0])
	if err != nil {
		return err
	}

	return nil
}

func (s *SixGroupsFiveTeams) GetGame() (*models.GameResponse, error) {
	return s.GameRepo.GetGame()
}

func (s *SixGroupsFiveTeams) GetTeamsByGameID(gameID int) ([]models.Team, error) {
	return s.GameRepo.GetTeamsByGameID(gameID)
}

func (s *SixGroupsFiveTeams) GetMatchesByGameID(gameID int) ([]models.Match, error) {
	return s.GameRepo.GetMatchesByGameID(gameID)
}

func (s *SixGroupsFiveTeams) GetTeamByGameID(gameID int, teamName string, groupName string) (models.Team, error) {
	return s.GameRepo.GetTeamByGameID(gameID, teamName, groupName)
}

func (s *SixGroupsFiveTeams) SortGroupsByAlphabet(groups []models.Group) []models.Group {
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].GroupName < groups[j].GroupName
	})
	return groups
}

func (s *SixGroupsFiveTeams) SortTeamsByPoints(teams models.Teams) []models.Team {

	sort.Sort(teams)
	return teams
}

func (s *SixGroupsFiveTeams) SortMatchesById(matches []models.Match) []models.Match {
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].MatchID < matches[j].MatchID
	})
	return matches
}

func (s *SixGroupsFiveTeams) UpdateTeam(team *models.Team) error {
	return s.GameRepo.UpdateTeam(team)
}

func (s *SixGroupsFiveTeams) UpdateMatches(match models.Match) error {
	return s.GameRepo.UpdateMatches(&match)
}

func (s *SixGroupsFiveTeams) GetGameByID(gameID string) (*models.Game, error) {
	return s.GameRepo.GetGameByID(gameID)
}

func (s *SixGroupsFiveTeams) UpdateGame(g *models.Game) error {
	return s.GameRepo.UpdateGame(g)
}

func (s *SixGroupsFiveTeams) GetGroups(teams []models.Team) []models.Group {
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

func (s *SixGroupsFiveTeams) matchesAreFinished(gameId int, matchType string) bool {
	//get matches
	matches, err := s.GameRepo.GetMatchesByGameType(gameId, matchType)
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
	retval = s.SortTeamsByPoints(retval)
	retval = retval[:4]
	return retval
}

func (s *SixGroupsFiveTeams) calculateMatchesPerGroup(teams []models.Team, gameId int, referees []models.Referee, startTime time.Time, playTime time.Duration) []models.Match {
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

	//set playtime to minutes
	playTime = playTime * time.Minute

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
		newmatches := generateSchedule(g, gameId, g[0].GroupName, refs, startTime, playTime)
		matches = append(matches, newmatches...)
	}

	startOfRoundOf16 := startTime.Add(playTime * 10)

	//add round of 16
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "C", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "D", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "E", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "F", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16, EndTime: startOfRoundOf16.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16.Add(playTime), EndTime: startOfRoundOf16.Add(playTime * 2)})
	matches = append(matches, models.Match{GameID: gameId, Type: "round_of_16", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfRoundOf16.Add(playTime), EndTime: startOfRoundOf16.Add(playTime * 2)})

	startOfQuaterFinals := startOfRoundOf16.Add(playTime * 2)
	//add quarterfinals
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "C", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})
	matches = append(matches, models.Match{GameID: gameId, Type: "quaterfinal", GroupNumber: "D", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfQuaterFinals, EndTime: startOfQuaterFinals.Add((playTime))})

	startOfSemiFinals := startOfQuaterFinals.Add(playTime)
	//add semifinals
	matches = append(matches, models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals, EndTime: startOfSemiFinals.Add(playTime)})
	matches = append(matches, models.Match{GameID: gameId, Type: "semifinal", GroupNumber: "B", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals, EndTime: startOfSemiFinals.Add(playTime)})

	//add final
	matches = append(matches, models.Match{GameID: gameId, Type: "final", GroupNumber: "A", HomeTeam: "", AwayTeam: "", PointsHome: 0, PointsAway: 0, StartTime: startOfSemiFinals.Add(playTime), EndTime: startOfSemiFinals.Add((playTime * 2))})

	return matches
}

func generateSchedule(teams []models.Team, gameId int, group string, referees []models.Referee, startTime time.Time, playTime time.Duration) []models.Match {
	numTeams := len(teams)
	// numMatches := numTeams * (numTeams - 1) / 2 // Anzahl der Spiele

	// Erstellen eines leeren Spielplans
	schedule := make([]models.Match, 0)

	refereeCounter := 0
	// Erstellen aller möglichen Spiele
	allMatches := make([]models.Match, 0)
	for i := 0; i < numTeams; i++ {
		for j := i + 1; j < numTeams; j++ {
			if refereeCounter == 2 {
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

func (s *SixGroupsFiveTeams) GetUpdatedTeam(currentTeam *models.Team, newTeam *models.TeamUpdate) *models.Team {
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
