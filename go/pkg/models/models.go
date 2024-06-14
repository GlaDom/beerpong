package models

import "time"

// Game repräsentiert die Spiele-Tabelle
type Game struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	Mode          int       `json:"mode"`
	AmountOfTeams int       `json:"amount_of_teams"`
	IsFinished    bool      `json:"is_finished"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"<-:create"`
	CreatedAt     time.Time `json:"created_at" gorm:"<-:create"`
}

// Team repräsentiert die Teams-Tabelle
type Team struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	GameID    int       `json:"game_id"`
	TeamName  string    `json:"team_name"`
	GroupName string    `json:"group_name"`
	Points    int       `json:"points"`
	Rank      int       `json:"rank"`
	CupsHit   int       `json:"cups_hit"`
	CupsGet   int       `json:"cups_get"`
	CreatedAt time.Time `json:"created_at" gorm:"<-:create"`
}

// Match repräsentiert die Matches-Tabelle
type Match struct {
	GameID      int       `json:"game_id"`
	Type        string    `json:"type"`
	GroupNumber string    `json:"group_number"`
	HomeTeam    string    `json:"home_team"`
	AwayTeam    string    `json:"away_team"`
	PointsHome  int       `json:"points_home"`
	PointsAway  int       `json:"points_away"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"<-:create"`
	CreatedAt   time.Time `json:"created_at" gorm:"<-:create"`
}

const (
	GAME_MODE_30_TEAMS = iota //0
)

type NewGame struct {
	Game  Game   `json:"game"`
	Teams []Team `json:"teams" gorm:"foreignKey:game_id"`
}

type GameResponse struct {
	Game    Game    `json:"game"`
	Groups  []Group `json:"groups"`
	Matches []Match `json:"matches"`
}

type MatchUpdateRequest struct {
	Matches []Match `json:"matches"`
}

type TeamUpdateRequest struct {
	Teams []TeamUpdate `json:"teams"`
}

type TeamUpdate struct {
	GameID      int    `json:"game_id"`
	TeamName    string `json:"team_name"`
	GroupName   string `json:"group_name"`
	PointsToAdd int    `json:"points_to_add"`
	CupsHitted  int    `json:"cups_hitted"`
	CupsGot     int    `json:"cups_got"`
}

type Group struct {
	GroupName string `json:"group_name"`
	Teams     []Team `json:"teams"`
}
