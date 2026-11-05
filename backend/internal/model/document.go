package model

type DocumentStatus string

const (
	StatusDraft     DocumentStatus = "draft"
	StatusPublished DocumentStatus = "published"
)

type Document struct {
	ID          string         `json:"id"`
	Slug        string         `json:"slug"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      DocumentStatus `json:"status"`
	Category    string         `json:"category"`
	Tags        []string       `json:"tags"`
	Series      string         `json:"series,omitempty"`
	CoverKey    string         `json:"coverKey,omitempty"`
	CreatedAt   string         `json:"createdAt"`
	UpdatedAt   string         `json:"updatedAt"`
	PublishedAt string         `json:"publishedAt,omitempty"`
	Body        string         `json:"body,omitempty"`
}
