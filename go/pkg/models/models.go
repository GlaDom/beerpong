package models

import "time"

// Game repräsentiert die Spiele-Tabelle
type Game struct {
	ID            int           `json:"id" gorm:"<-:create;primaryKey;autoIncrement"`
	UserSub       string        `json:"user_sub"`
	Mode          int           `json:"mode"`
	AmountOfTeams int           `json:"amount_of_teams"`
	IsFinished    bool          `json:"is_finished"`
	GameTime      time.Duration `json:"game_time"`
	StartTime     time.Time     `json:"start_time"`
	Referee       []Referee     `json:"referee" gorm:"foreignKey:game_id;references:ID"`
	Teams         []Team        `json:"teams" gorm:"foreignKey:game_id;references:ID"`
	UpdatedAt     time.Time     `json:"updated_at" gorm:"<-:create"`
	CreatedAt     time.Time     `json:"created_at" gorm:"<-:create"`
}

// Referee repraesentiert die Referee-Tabelle
type Referee struct {
	ID        int       `gorm:"<-:create;primaryKey;autoIncrement"`
	GameID    int       `json:"game_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `gorm:"<-:create"`
}

// Team repräsentiert die Teams-Tabelle
type Team struct {
	ID            uint      `json:"id" gorm:"<-:create;primaryKey;autoIncrement"`
	GameID        int       `json:"game_id"`
	TeamName      string    `json:"team_name"`
	GroupName     string    `json:"group_name"`
	Points        int       `json:"points"`
	Rank          int       `json:"rank"`
	CupsHit       int       `json:"cups_hit"`
	CupsGet       int       `json:"cups_get"`
	CupDifference int       `json:"cup_difference"`
	CreatedAt     time.Time `json:"created_at" gorm:"<-:create"`
}

type Teams []Team

// Implement the sort.Interface for Teams
func (t Teams) Len() int {
	return len(t)
}

func (t Teams) Swap(i, j int) {
	t[i], t[j] = t[j], t[i]
}

// Custom sort: primary by Points, secondary by CupsDifference
func (t Teams) Less(i, j int) bool {
	if t[i].Points == t[j].Points {
		return t[i].CupDifference > t[j].CupDifference
	}
	return t[i].Points > t[j].Points
}

// Match repräsentiert die Matches-Tabelle
type Match struct {
	GameID      int       `json:"game_id"`
	MatchID     int       `json:"match_id" gorm:"<-:create;primaryKey;autoIncrement"`
	Type        string    `json:"type"`
	GroupNumber string    `json:"group_number"`
	HomeTeam    string    `json:"home_team"`
	AwayTeam    string    `json:"away_team"`
	PointsHome  int       `json:"points_home"`
	PointsAway  int       `json:"points_away"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Referee     string    `json:"referee"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"<-:create"`
	CreatedAt   time.Time `json:"created_at" gorm:"<-:create"`
}

const (
	GAME_MODE_30_TEAMS = iota //0
)

type NewGame struct {
	Game Game `json:"game"`
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
