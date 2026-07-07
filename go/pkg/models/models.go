package models

import "time"

const (
	TournamentModeGroup  = "group"
	TournamentModeLeague = "league"
)

// Tournament repräsentiert die Tournament-Tabelle
type Tournament struct {
	ID                     int           `json:"id" gorm:"<-:create;primaryKey;autoIncrement"`
	UserSub                string        `json:"user_sub"`
	Mode                   string        `json:"mode"`
	AmountOfTeams          int           `json:"amount_of_teams"`
	Groups                 []Group       `json:"groups" gorm:"foreignKey:TournamentID;references:ID"`
	Matches                []Match       `json:"matches" gorm:"foreignKey:TournamentID;references:ID"`
	IsFinished             bool          `json:"is_finished"`
	GotKoStage             bool          `json:"got_ko_stage"`
	GotStageInbetween      bool          `json:"got_stage_in_between"`
	NumberOfQualifiedTeams int           `json:"number_of_qualified_teams"`
	IncludeThirdPlaceMatch bool          `json:"include_third_place_match"`
	GameTime               time.Duration `json:"game_time"`
	StartTime              time.Time     `json:"start_time"`
	Referee                []Referee     `json:"referee" gorm:"foreignKey:TournamentID;references:ID"`
	UpdatedAt              time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedAt              time.Time     `json:"created_at" gorm:"<-:create"`
}

// Group repräsentiert die Groups-Tabelle
type Group struct {
	GroupID      int       `json:"group_id" gorm:"<-:create;primaryKey;autoIncrement"`
	TournamentID int       `json:"tournament_id"`
	GroupName    string    `json:"group_name"`
	Teams        []Team    `json:"teams" gorm:"foreignKey:GroupID;references:GroupID"`
	CreatedAt    time.Time `json:"created_at" gorm:"<-:create"`

	// Beziehung
	Tournament Tournament `gorm:"foreignKey:TournamentID;references:ID"`
}

// Team repräsentiert die Teams-Tabelle
type Team struct {
	ID            int       `json:"id" gorm:"<-:create;primaryKey;autoIncrement"`
	GroupID       int       `json:"group_id"`
	TournamentID  int       `json:"tournament_id"`
	TeamName      string    `json:"team_name" gorm:"uniqueIndex:idx_tournament_team"`
	GroupName     string    `json:"group_name"`
	Points        int       `json:"points"`
	Rank          int       `json:"rank"`
	CupsHit       int       `json:"cups_hit"`
	CupsGet       int       `json:"cups_get"`
	CupDifference int       `json:"cup_difference"`
	CreatedAt     time.Time `json:"created_at" gorm:"<-:create"`

	// Beziehungen
	Group      Group      `gorm:"foreignKey:GroupID;references:GroupID"`
	Tournament Tournament `gorm:"foreignKey:TournamentID;references:ID"`
}

// Referee repraesentiert die Referee-Tabelle
type Referee struct {
	ID           int       `gorm:"<-:create;primaryKey;autoIncrement"`
	TournamentID int       `json:"tournament_id"`
	Name         string    `json:"name"`
	CreatedAt    time.Time `gorm:"<-:create"`

	// Beziehung
	Tournament Tournament `gorm:"foreignKey:TournamentID;references:ID"`
}

// Match repräsentiert die Matches-Tabelle
type Match struct {
	ID           int       `json:"id" gorm:"<-:create;primaryKey;autoIncrement"`
	TournamentID int       `json:"tournament_id"`
	MatchID      int       `json:"match_id"`
	Type         string    `json:"type"`
	GroupNumber  string    `json:"group_number"`
	HomeTeam     string    `json:"home_team"`
	AwayTeam     string    `json:"away_team"`
	PointsHome   int       `json:"points_home"`
	PointsAway   int       `json:"points_away"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	Referee      string    `json:"referee"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedAt    time.Time `json:"created_at" gorm:"<-:create"`

	// Beziehung
	Tournament Tournament `gorm:"foreignKey:TournamentID;references:ID"`
}

// Teams type für Sortierung
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

type NewTournament struct {
	Tournament Tournament `json:"tournament"`
}

type MatchUpdateRequest struct {
	Matches []Match `json:"matches"`
}

type TeamUpdateRequest struct {
	Teams []TeamUpdate `json:"teams"`
}

type TeamUpdate struct {
	TournamentID int    `json:"tournament_id"`
	TeamName     string `json:"team_name"`
	GroupName    string `json:"group_name"`
	PointsToAdd  int    `json:"points_to_add"`
	CupsHitted   int    `json:"cups_hitted"`
	CupsGot      int    `json:"cups_got"`
}

type QualificationInfo struct {
	GroupName string `json:"group_name"`
	Position  int    `json:"position"`
}
