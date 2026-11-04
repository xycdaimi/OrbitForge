package model

type CreateFeedbackRequest struct {
	ArticleSlug string `json:"articleSlug"`
	Message     string `json:"message"`
	Email       string `json:"email,omitempty"`
}

type Feedback struct {
	ID          string `json:"id"`
	ArticleSlug string `json:"articleSlug"`
	Message     string `json:"message"`
	Email       string `json:"email,omitempty"`
}

type CreateFeedbackResponse struct {
	ID string `json:"id"`
}
