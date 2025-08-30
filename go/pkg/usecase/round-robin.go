package usecase

import (
	"time"

	"github.com/gladom/beerpong/pkg/models"
)

type RoundRobin struct{}

func NewRoundRobin() *RoundRobin {
	return &RoundRobin{}
}

// GenerateOptimalRoundRobinmodels.Tournament erstellt eine optimierte Spielreihenfolge pro Gruppe
// die vermeidet, dass Teams direkt hintereinander spielen
func (rr *RoundRobin) GenerateOptimalRoundRobinTournament(teams []models.Team, matchDuration time.Duration, groupNumber string, startTime time.Time) []models.Match {
	teamNames := make([]string, len(teams))
	for i, team := range teams {
		teamNames[i] = team.TeamName
	}
	// Erst alle möglichen Matches generieren
	allMatches := generateAllMatches(teamNames, groupNumber)

	// Dann optimal anordnen
	optimizedMatches := optimizeMatchOrder(allMatches, teamNames, matchDuration, startTime)

	return optimizedMatches
}

// generateAllMatches erstellt alle möglichen Paarungen
func generateAllMatches(teams []string, groupNumber string) []models.Match {
	var matches []models.Match
	matchID := 1

	for i := 0; i < len(teams); i++ {
		for j := i + 1; j < len(teams); j++ {
			match := models.Match{
				HomeTeam:    teams[i],
				AwayTeam:    teams[j],
				GroupNumber: groupNumber,
				PointsHome:  0,
				PointsAway:  0,
				Type:        "regular",
			}
			matches = append(matches, match)
			matchID++
		}
	}

	return matches
}

// optimizeMatchOrder verwendet einen Greedy-Algorithmus für optimale Verteilung
func optimizeMatchOrder(matches []models.Match, teams []string, matchDuration time.Duration, startTime time.Time) []models.Match {
	var orderedMatches []models.Match
	remainingMatches := make([]models.Match, len(matches))
	copy(remainingMatches, matches)

	// Track wann jedes Team zuletzt gespielt hat
	lastPlayedIndex := make(map[string]int)
	for _, team := range teams {
		lastPlayedIndex[team] = -999 // Sehr weit in der Vergangenheit
	}

	// Greedy: Wähle immer das Match mit der längsten Pause für beide Teams
	for len(remainingMatches) > 0 {
		bestMatchIndex := findBestMatch(remainingMatches, lastPlayedIndex, len(orderedMatches))
		bestMatch := remainingMatches[bestMatchIndex]

		// Match zur finalen Liste hinzufügen
		bestMatch.MatchID = len(orderedMatches) + 1
		orderedMatches = append(orderedMatches, bestMatch)

		// Update wann Teams zuletzt gespielt haben
		lastPlayedIndex[bestMatch.HomeTeam] = len(orderedMatches) - 1
		lastPlayedIndex[bestMatch.AwayTeam] = len(orderedMatches) - 1

		// Match aus verbleibenden entfernen
		remainingMatches = append(remainingMatches[:bestMatchIndex], remainingMatches[bestMatchIndex+1:]...)
	}

	for i := range orderedMatches {
		// Setze Start- und Endzeit für jedes Match
		if i == 0 {
			orderedMatches[i].StartTime = startTime
			orderedMatches[i].EndTime = orderedMatches[i].StartTime.Add(time.Minute * matchDuration)
		} else {
			orderedMatches[i].StartTime = orderedMatches[i-1].EndTime
			orderedMatches[i].EndTime = orderedMatches[i].StartTime.Add(time.Minute * matchDuration)
		}
	}

	return orderedMatches
}

// findBestMatch findet das Match mit der besten Pausenverteilung
func findBestMatch(matches []models.Match, lastPlayed map[string]int, currentIndex int) int {
	bestIndex := 0
	bestScore := -1

	for i, match := range matches {
		// Score = minimale Pause der beiden Teams (je höher, desto besser)
		team1Pause := currentIndex - lastPlayed[match.HomeTeam]
		team2Pause := currentIndex - lastPlayed[match.AwayTeam]

		// Wir wollen die minimale Pause maximieren
		minPause := team1Pause
		if team2Pause < team1Pause {
			minPause = team2Pause
		}

		// Zusätzlicher Bonus für ausgeglichene Pausen
		balanceBonus := 0
		if abs(team1Pause-team2Pause) <= 1 {
			balanceBonus = 1
		}

		score := minPause*10 + balanceBonus

		if score > bestScore {
			bestScore = score
			bestIndex = i
		}
	}

	return bestIndex
}

// abs gibt den Absolutwert zurück
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
