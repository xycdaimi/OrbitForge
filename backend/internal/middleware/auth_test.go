package middleware

import "testing"

type allowAuth struct{}

func (allowAuth) Subject(token string) (string, error) {
	if token == "good" {
		return "author", nil
	}
	return "", ErrUnauthenticated
}

func TestSubjectFromAuthorization(t *testing.T) {
	if _, err := SubjectFromAuthorization(allowAuth{}, ""); err == nil {
		t.Fatal("expected unauthenticated")
	}
	subject, err := SubjectFromAuthorization(allowAuth{}, "Bearer good")
	if err != nil || subject != "author" {
		t.Fatalf("subject=%s err=%v", subject, err)
	}
	if _, err := SubjectFromAuthorization(allowAuth{}, "Bearer bad"); err == nil {
		t.Fatal("expected reject")
	}
}
