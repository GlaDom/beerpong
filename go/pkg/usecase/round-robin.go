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
	allMatches := generateAllMatches(teamNames, matchDuration, groupNumber, startTime)

	// Dann optimal anordnen
	optimizedMatches := optimizeMatchOrder(allMatches, teamNames)

	return optimizedMatches
}

// generateAllMatches erstellt alle möglichen Paarungen
func generateAllMatches(teams []string, matchDuration time.Duration, groupNumber string, startTime time.Time) []models.Match {
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
				StartTime:   startTime.Add(matchDuration * time.Duration(i)),
				EndTime:     startTime.Add(matchDuration * time.Duration(i+1)),
				Type:        "regular",
			}
			matches = append(matches, match)
			matchID++
		}
	}

	return matches
}

// optimizeMatchOrder verwendet einen Greedy-Algorithmus für optimale Verteilung
func optimizeMatchOrder(matches []models.Match, teams []string) []models.Match {
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

// GenerateSequentialSchedule fügt Startzeiten hinzu
// func GenerateSequentialSchedule(tournament models.Tournament, startTime time.Time, breakBetweenMatches int) models.Tournament {
// 	currentTime := startTime

// 	for i := range models.Tournament.Matches {
// 		models.Tournament.Matches[i].StartTime = currentTime
// 		currentTime = currentTime.Add(time.Duration(models.Tournament.Matches[i].Duration+breakBetweenMatches) * time.Minute)
// 	}

// 	return models.Tournament
// }

// AnalyzeScheduleQuality analysiert wie gut die Pausenverteilung ist
// func AnalyzeScheduleQuality(tournament models.Tournament) map[string]interface{} {
// 	teamLastPlayed := make(map[string]int)
// 	for _, team := range models.Tournament.Teams {
// 		teamLastPlayed[team] = -999
// 	}

// 	var pauses []int
// 	consecutiveGames := 0
// 	maxConsecutive := 0

// 	for i, match := range models.Tournament.Matches {
// 		team1LastPlayed := teamLastPlayed[match.Team1]
// 		team2LastPlayed := teamLastPlayed[match.Team2]

// 		// Prüfe auf direkt aufeinanderfolgende Spiele
// 		if i > 0 {
// 			if team1LastPlayed == i-1 || team2LastPlayed == i-1 {
// 				consecutiveGames++
// 				if consecutiveGames > maxConsecutive {
// 					maxConsecutive = consecutiveGames
// 				}
// 			} else {
// 				consecutiveGames = 0
// 			}
// 		}

// 		// Sammle Pausenlängen
// 		if team1LastPlayed >= 0 {
// 			pauses = append(pauses, i-team1LastPlayed-1)
// 		}
// 		if team2LastPlayed >= 0 {
// 			pauses = append(pauses, i-team2LastPlayed-1)
// 		}

// 		// Update letzte Spielzeit
// 		teamLastPlayed[match.Team1] = i
// 		teamLastPlayed[match.Team2] = i
// 	}

// 	// Berechne Durchschnittspause
// 	avgPause := 0.0
// 	if len(pauses) > 0 {
// 		sum := 0
// 		for _, pause := range pauses {
// 			sum += pause
// 		}
// 		avgPause = float64(sum) / float64(len(pauses))
// 	}

// 	return map[string]interface{}{
// 		"consecutiveGames": consecutiveGames,
// 		"maxConsecutive":   maxConsecutive,
// 		"averagePause":     avgPause,
// 		"totalPauses":      len(pauses),
// 		"shortPauses":      countShortPauses(pauses),
// 	}
// }

// func countShortPauses(pauses []int) int {
// 	count := 0
// 	for _, pause := range pauses {
// 		if pause == 0 { // 0 = direktes Folge-Spiel
// 			count++
// 		}
// 	}
// 	return count
// }

// GetTeamSchedule zeigt wann jedes Team spielt
// func GetTeamSchedule(tournament models.Tournament) map[string][]int {
// 	schedule := make(map[string][]int)

// 	for _, team := range tournament.Teams {
// 		schedule[team] = []int{}
// 	}

// 	for i, match := range tournament.Matches {
// 		schedule[match.Team1] = append(schedule[match.Team1], i+1)
// 		schedule[match.Team2] = append(schedule[match.Team2], i+1)
// 	}

// 	return schedule
// }
