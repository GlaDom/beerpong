package usecase

import (
	"math/rand"
	"sort"
	"time"

	"github.com/gladom/beerpong/pkg/models"
	"github.com/gladom/beerpong/pkg/repo"
)

type SixGroupsFiveTeams struct {
	GameRepo *repo.Gamerepo
}

func NewSixGroupsFiveTeams(gr *repo.Gamerepo) *SixGroupsFiveTeams {
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

func (s *SixGroupsFiveTeams) GetGame() (*models.GameResponse, error) {
	return s.GameRepo.GetGame()
}

func (s *SixGroupsFiveTeams) GetTeamsByGameID(gameID int) ([]models.Team, error) {
	return s.GameRepo.GetTeamsByGameID(gameID)
}

func (s *SixGroupsFiveTeams) GetMatchesByGameID(gameID int) ([]models.Match, error) {
	return s.GameRepo.GetMatchesByGameID(gameID)
}

func (s *SixGroupsFiveTeams) GetTeamByGameID(gameID int, teamName string) (models.Team, error) {
	return s.GameRepo.GetTeamByGameID(gameID, teamName)
}

func (s *SixGroupsFiveTeams) SortGroupsByAlphabet(groups []models.Group) []models.Group {
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].GroupName < groups[j].GroupName
	})
	return groups
}

func (s *SixGroupsFiveTeams) SortTeamsByPoints(teams []models.Team) []models.Team {
	sort.Slice(teams, func(i, j int) bool {
		return teams[i].Points > teams[j].Points
	})
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

func (gr *SixGroupsFiveTeams) GetUpdatedTeam(currentTeam *models.Team, newTeam *models.TeamUpdate) *models.Team {
	retval := &models.Team{
		ID:        currentTeam.ID,
		GameID:    currentTeam.GameID,
		GroupName: currentTeam.GroupName,
		TeamName:  currentTeam.TeamName,
		Points:    currentTeam.Points + newTeam.PointsToAdd,
		CupsHit:   currentTeam.CupsHit + newTeam.CupsHitted,
		CupsGet:   currentTeam.CupsGet + newTeam.CupsGot,
	}
	return retval
}
