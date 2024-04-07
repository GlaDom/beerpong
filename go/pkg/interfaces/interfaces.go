package interfaces

import "time"

type NewGame struct {
	Mode          int    `json:"mode"`
	AmountOfTeams int    `json:"amount_of_teams"`
	IsFinished    bool   `json:"is_finished"`
	Teams         []Team `json:"teams"`
}

// Game repräsentiert die Spiele-Tabelle
type Game struct {
	ID            int       `json:"id"`
	Mode          int       `json:"mode"`
	AmountOfTeams int       `json:"amount_of_teams"`
	IsFinished    bool      `json:"is_finished"`
	CreatedAt     time.Time `json:"created_at"`
}

// Team repräsentiert die Teams-Tabelle
type Team struct {
	GameID    int       `json:"game_id"`
	TeamName  string    `json:"team_name"`
	GroupName string    `json:"group_name"`
	Points    int       `json:"points"`
	Rank      int       `json:"rank"`
	CreatedAt time.Time `json:"created_at"`
}

// Match repräsentiert die Matches-Tabelle
type Match struct {
	GameID      int       `json:"game_id"`
	Type        string    `json:"type"`
	GroupNumber int       `json:"group_number"`
	HomeTeam    string    `json:"home_team"`
	AwayTeam    string    `json:"away_team"`
	PointsHome  int       `json:"points_home"`
	PointsAway  int       `json:"points_away"`
	CreatedAt   time.Time `json:"created_at"`
}

const (
	GAME_MODE_30_TEAMS = iota //0
)
