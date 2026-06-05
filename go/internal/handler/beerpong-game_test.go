package handler

import (
	"testing"

	"github.com/gladom/beerpong/pkg/models"
)

func TestValidateTournamentDefaultsToGroupMode(t *testing.T) {
	tournament := &models.Tournament{
		AmountOfTeams: 3,
		Groups: []models.Group{{
			GroupName: "A",
			Teams:     []models.Team{{TeamName: "One"}, {TeamName: "Two"}, {TeamName: "Three"}},
		}},
	}

	if err := validateTournament(tournament); err != nil {
		t.Fatalf("expected group mode to validate, got error: %v", err)
	}

	if tournament.Mode != models.TournamentModeGroup {
		t.Fatalf("expected default mode %q, got %q", models.TournamentModeGroup, tournament.Mode)
	}
}

func TestValidateTournamentRejectsInvalidLeagueShape(t *testing.T) {
	tournament := &models.Tournament{
		Mode:          models.TournamentModeLeague,
		AmountOfTeams: 8,
		Groups: []models.Group{
			{GroupName: "A", Teams: []models.Team{{TeamName: "A1"}, {TeamName: "A2"}, {TeamName: "A3"}, {TeamName: "A4"}, {TeamName: "A5"}, {TeamName: "A6"}, {TeamName: "A7"}, {TeamName: "A8"}}},
			{GroupName: "B", Teams: []models.Team{{TeamName: "B1"}, {TeamName: "B2"}, {TeamName: "B3"}, {TeamName: "B4"}, {TeamName: "B5"}, {TeamName: "B6"}, {TeamName: "B7"}, {TeamName: "B8"}}},
		},
	}

	if err := validateTournament(tournament); err == nil {
		t.Fatal("expected league mode with multiple groups to fail validation")
	}
}

func TestValidateTournamentRejectsNonPowerOfTwoLeagueQualifiers(t *testing.T) {
	tournament := &models.Tournament{
		Mode:                   models.TournamentModeLeague,
		AmountOfTeams:          12,
		GotKoStage:             true,
		NumberOfQualifiedTeams: 6,
		Groups: []models.Group{{
			GroupName: "A",
			Teams: []models.Team{
				{TeamName: "T1"}, {TeamName: "T2"}, {TeamName: "T3"}, {TeamName: "T4"},
				{TeamName: "T5"}, {TeamName: "T6"}, {TeamName: "T7"}, {TeamName: "T8"},
				{TeamName: "T9"}, {TeamName: "T10"}, {TeamName: "T11"}, {TeamName: "T12"},
			},
		}},
	}

	if err := validateTournament(tournament); err == nil {
		t.Fatal("expected non-power-of-two league qualifiers to fail validation")
	}
}

func TestValidateTournamentAcceptsLeagueMode(t *testing.T) {
	tournament := &models.Tournament{
		Mode:                   models.TournamentModeLeague,
		AmountOfTeams:          8,
		GotKoStage:             true,
		NumberOfQualifiedTeams: 4,
		Groups: []models.Group{{
			GroupName: "A",
			Teams: []models.Team{
				{TeamName: "T1"}, {TeamName: "T2"}, {TeamName: "T3"}, {TeamName: "T4"},
				{TeamName: "T5"}, {TeamName: "T6"}, {TeamName: "T7"}, {TeamName: "T8"},
			},
		}},
	}

	if err := validateTournament(tournament); err != nil {
		t.Fatalf("expected valid league tournament, got error: %v", err)
	}
}
