package usecase

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gladom/beerpong/pkg/models"
)

type OneGroupFiveTeams struct {
	General  General
	GameRepo IGamerepo
}

func NewOneGroupFiveTeams(gr IGamerepo, ge General) *OneGroupFiveTeams {
	return &OneGroupFiveTeams{
		GameRepo: gr,
		General:  ge,
	}
}

func (s *OneGroupFiveTeams) GenerateGamePlan(game *models.NewGame) error {
	//save new game
	err := s.GameRepo.CreateGame(game)
	if err != nil {
		return err
	}
	//calculate matches for game
	matches := s.calculateMatchesForGroup(&game.Game)
	err = s.GameRepo.CreateMatches(matches)
	if err != nil {
		return err
	}
	return nil
}

func (s *OneGroupFiveTeams) UpdateMatchesFinal(gameId int) error {
	if !s.General.matchesAreFinished(gameId, "regular") {
		return fmt.Errorf("matches not finished yet")
	}
	//get teams
	teams, err := s.GameRepo.GetTeamsByGameID(gameId)
	if err != nil {
		return err
	}
	teams = s.General.SortTeamsByPoints(teams)
	//get final
	final, err := s.GameRepo.GetMatchesByGameType(gameId, "final")
	if err != nil {
		return err
	}

	final[0].HomeTeam = teams[0].TeamName
	final[0].AwayTeam = teams[1].TeamName

	err = s.General.UpdateMatches(final[0])
	if err != nil {
		return err
	}

	return nil
}

func (s *OneGroupFiveTeams) calculateMatchesForGroup(game *models.Game) []*models.Match {
	var matches []*models.Match

	//sort teams in groups
	groups := map[string][]models.Team{}
	for _, t := range game.Teams {
		//if no map entry for group create first one
		if _, ok := groups[t.GroupName]; !ok {
			groups[t.GroupName] = append(groups[t.GroupName], t)
			continue
		}
		groups[t.GroupName] = append(groups[t.GroupName], t)
	}

	//set playtime to minutes
	playTime := game.GameTime * time.Minute

	newmatches := s.generateSchedule(groups["A"], game.ID, "A", game.Referee, game.StartTime, playTime)
	matches = append(matches, newmatches...)

	startOfFinal := game.StartTime.Add(playTime * 10)

	//add final
	matches = append(matches, &models.Match{GameID: game.ID, Type: "final", GroupNumber: "A", HomeTeam: "1. der Gruppe", AwayTeam: "2. der Gruppe", PointsHome: 0, PointsAway: 0, StartTime: startOfFinal, EndTime: startOfFinal.Add((playTime * 2))})

	return matches
}

func (s *OneGroupFiveTeams) generateSchedule(teams []models.Team, gameId int, group string, referees []models.Referee, startTime time.Time, playTime time.Duration) []*models.Match {
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
		// Pruefen, ob referees angegeben wurden und ob der aktuelle refereeCounter innerhalb der Grenzen liegt
		if referees != nil {
			if len(match.Referee) >= refereeCounter && referees[refereeCounter].Name != "" {
				match.Referee = referees[refereeCounter].Name
			} else {
				match.Referee = " - "
			}
		} else {
			match.Referee = " - "
		}

		schedule = append(schedule, match)

		// Entfernen des ausgewählten Spiels aus der Liste aller Spiele
		allMatches = append(allMatches[:index], allMatches[index+1:]...)
		refereeCounter++
	}

	tmpTime := time.Now()
	for i := range schedule {
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
