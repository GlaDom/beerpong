package usecase

import (
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/gladom/beerpong/pkg/models"
)

type KoRoundGenerator struct {
	QualificationSlots []models.QualificationInfo
}

func NewKoRoundGenerator() *KoRoundGenerator {
	return &KoRoundGenerator{
		QualificationSlots: []models.QualificationInfo{},
	}
}

// GenerateKOMatches erstellt alle K.O.-Matches mit Platzhaltern
func (kg *KoRoundGenerator) GenerateKOMatches(tournamentId int, groups []models.Group, teamsPerGroup int, includeThirdPlace bool, gameDuration time.Duration, startTime time.Time) ([]models.Match, error) {
	// Qualifikationsslots bestimmen
	err := kg.determineQualificationSlots(groups, teamsPerGroup)
	if err != nil {
		return nil, err
	}

	totalTeams := len(kg.QualificationSlots)

	// Auf nächste Zweierpotenz reduzieren falls nötig
	koTeams := kg.adjustToNextPowerOfTwo(totalTeams)

	if koTeams < 2 {
		return nil, fmt.Errorf("nicht genügend Teams für K.O.-Phase: %d", totalTeams)
	}

	fmt.Printf("K.O.-Phase wird mit %d Teams gespielt\n", koTeams)

	// Alle K.O.-Matches generieren
	matches := kg.generateAllKOMatches(koTeams, startTime, groups, gameDuration, includeThirdPlace, teamsPerGroup, tournamentId)

	return matches, nil
}

// determineQualificationSlots bestimmt welche Teams sich qualifizieren
func (kg *KoRoundGenerator) determineQualificationSlots(groups []models.Group, teamsPerGroup int) error {
	kg.QualificationSlots = []models.QualificationInfo{}

	// Gruppen sortieren für konsistente Reihenfolge
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].GroupName < groups[j].GroupName
	})

	for _, group := range groups {
		for pos := 1; pos <= teamsPerGroup; pos++ {
			qualification := models.QualificationInfo{
				GroupName: group.GroupName,
				Position:  pos,
			}
			kg.QualificationSlots = append(kg.QualificationSlots, qualification)
		}
	}

	return nil
}

// adjustToNextPowerOfTwo passt die Teamanzahl auf die nächste Zweierpotenz an
func (kg *KoRoundGenerator) adjustToNextPowerOfTwo(teamCount int) int {
	if isPowerOfTwo(teamCount) {
		return teamCount
	}

	// Nächste kleinere Zweierpotenz
	return int(math.Pow(2, math.Floor(math.Log2(float64(teamCount)))))
}

// generateAllKOMatches erstellt alle K.O.-Matches
func (kg *KoRoundGenerator) generateAllKOMatches(koTeams int, startTime time.Time, groups []models.Group, gameDuration time.Duration, includeThirdPlace bool, teamsPerGroup int, tournamentID int) []models.Match {
	var allMatches []models.Match
	currentTime := startTime
	matchID := 1

	// Setzliste erstellen
	seededSlots := kg.createSeeding(koTeams, teamsPerGroup, groups)

	// Erste Runde
	currentRoundSlots := seededSlots
	roundNumber := 1

	for len(currentRoundSlots) > 1 {
		roundName := kg.getRoundName(koTeams, roundNumber)
		roundMatches, nextRoundSlots := kg.generateRoundMatches(
			currentRoundSlots, roundName, matchID, currentTime, gameDuration, tournamentID)

		allMatches = append(allMatches, roundMatches...)

		// Für nächste Runde vorbereiten
		matchID += len(roundMatches)
		currentTime = currentTime.Add(time.Duration(len(roundMatches)) *
			(gameDuration))
		currentRoundSlots = nextRoundSlots
		roundNumber++
	}

	// Spiel um Platz 3 hinzufügen
	if includeThirdPlace && koTeams >= 4 {
		thirdPlaceMatch := kg.createThirdPlaceMatch(matchID, currentTime, gameDuration, tournamentID)
		allMatches = append(allMatches, thirdPlaceMatch)
	}

	return allMatches
}

// createSeeding erstellt die Setzliste mit Platzhaltern
func (kg *KoRoundGenerator) createSeeding(koTeams int, teamsPerGroup int, groups []models.Group) []string {
	slots := make([]string, koTeams)

	// hier normal seedByGroupPosition in if statement, aber soll eigenlicht immer verwendet werden
	if true {
		// Erst alle Gruppensieger, dann alle Zweitplatzierten
		slotIndex := 0
		for pos := 1; pos <= teamsPerGroup; pos++ {
			for _, group := range groups {
				if slotIndex >= koTeams {
					break
				}
				slots[slotIndex] = kg.getPlaceholderName(group.GroupName, pos)
				slotIndex++
			}
			if slotIndex >= koTeams {
				break
			}
		}
	} else {
		// Gruppen-weise: Sieger und Zweiter jeder Gruppe nacheinander
		slotIndex := 0
		for _, group := range groups {
			for pos := 1; pos <= teamsPerGroup; pos++ {
				if slotIndex >= koTeams {
					break
				}
				slots[slotIndex] = kg.getPlaceholderName(group.GroupName, pos)
				slotIndex++
			}
			if slotIndex >= koTeams {
				break
			}
		}
	}

	// Standard K.O.-Setzung: 1 vs letzter, 2 vs vorletzter, etc.
	seeded := make([]string, koTeams)
	for i := 0; i < koTeams/2; i++ {
		seeded[i*2] = slots[i]
		seeded[i*2+1] = slots[koTeams-1-i]
	}

	return seeded
}

// generateRoundMatches erstellt die Matches einer Runde
func (kg *KoRoundGenerator) generateRoundMatches(slots []string, roundName string,
	startMatchID int, startTime time.Time, gameDuration time.Duration, tournamentID int) ([]models.Match, []string) {

	var matches []models.Match
	var nextRoundSlots []string

	for i := 0; i < len(slots); i += 2 {
		matchTime := startTime.Add(time.Duration(i/2) *
			(gameDuration))

		var homeTeam, awayTeam string
		if i < len(slots) {
			homeTeam = slots[i]
		}
		if i+1 < len(slots) {
			awayTeam = slots[i+1]
		}

		match := models.Match{
			TournamentID: tournamentID,
			MatchID:      startMatchID + i/2,
			Type:         roundName,
			GroupNumber:  "K.O. Rund",
			HomeTeam:     homeTeam,
			AwayTeam:     awayTeam,
			StartTime:    matchTime,
			EndTime:      matchTime.Add(gameDuration),
		}

		matches = append(matches, match)

		// Platzhalter für nächste Runde
		winnerPlaceholder := fmt.Sprintf("Gewinner Match %d", startMatchID+i/2)
		nextRoundSlots = append(nextRoundSlots, winnerPlaceholder)
	}

	return matches, nextRoundSlots
}

// createThirdPlaceMatch erstellt das Spiel um Platz 3
func (kg *KoRoundGenerator) createThirdPlaceMatch(matchID int, startTime time.Time, gameDuration time.Duration, tournamentID int) models.Match {
	return models.Match{
		TournamentID: tournamentID,
		MatchID:      matchID,
		Type:         "Spiel um Platz 3",
		GroupNumber:  "K.O.-Phase",
		HomeTeam:     "Verlierer Halbfinale 1",
		AwayTeam:     "Verlierer Halbfinale 2",
		StartTime:    startTime,
		EndTime:      startTime.Add(gameDuration),
	}
}

// getPlaceholderName erstellt Platzhalter-Namen
func (kg *KoRoundGenerator) getPlaceholderName(groupName string, position int) string {
	positionText := map[int]string{
		1: "1ter",
		2: "2ter",
		3: "3ter",
		4: "4ter",
	}

	if text, exists := positionText[position]; exists {
		return fmt.Sprintf("%s Gruppe %s", text, groupName)
	}
	return fmt.Sprintf("%d. Gruppe %s", position, groupName)
}

// getRoundName bestimmt den Namen der Runde
func (kg *KoRoundGenerator) getRoundName(totalTeams, roundNumber int) string {
	teamsInRound := totalTeams / int(math.Pow(2, float64(roundNumber-1)))

	switch teamsInRound {
	case 2:
		return "final"
	case 4:
		return "semiFinal"
	case 8:
		return "quaterFinal"
	case 16:
		return "roundOfSixteen"
	case 32:
		return "roundOfThirtyTwo"
	default:
		return fmt.Sprintf("Runde der letzten %d", teamsInRound)
	}
}

// Hilfsfunktionen
func isPowerOfTwo(n int) bool {
	return n > 0 && (n&(n-1)) == 0
}

// UpdateKOMatchWithResult aktualisiert K.O.-Match und erstellt Folgematches
func UpdateKOMatchWithResult(matches []models.Match, completedMatchID int, winnerTeam string) []models.Match {
	// Match finden und Winner setzen
	for _, match := range matches {
		if match.MatchID == completedMatchID {
			// Winner bestimmen basierend auf Punkten
			var winner string
			if match.PointsHome > match.PointsAway {
				winner = match.HomeTeam
			} else {
				winner = match.AwayTeam
			}

			// In Folgematch einsetzen
			winnerPlaceholder := fmt.Sprintf("Gewinner Match %d", completedMatchID)

			for j := range matches {
				if matches[j].HomeTeam == winnerPlaceholder {
					matches[j].HomeTeam = winner
				} else if matches[j].AwayTeam == winnerPlaceholder {
					matches[j].AwayTeam = winner
				}
			}
			break
		}
	}

	return matches
}
