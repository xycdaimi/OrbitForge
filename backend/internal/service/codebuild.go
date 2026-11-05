package service

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/codebuild"
)

type CodeBuildClient interface {
	StartBuild(ctx context.Context, params *codebuild.StartBuildInput, optFns ...func(*codebuild.Options)) (*codebuild.StartBuildOutput, error)
	BatchGetBuilds(ctx context.Context, params *codebuild.BatchGetBuildsInput, optFns ...func(*codebuild.Options)) (*codebuild.BatchGetBuildsOutput, error)
}

type CodeBuildRunner struct {
	client  CodeBuildClient
	project string
}

func NewCodeBuildRunner(client CodeBuildClient, project string) *CodeBuildRunner {
	return &CodeBuildRunner{client: client, project: project}
}

func (r *CodeBuildRunner) Start(ctx context.Context) (string, error) {
	out, err := r.client.StartBuild(ctx, &codebuild.StartBuildInput{
		ProjectName: aws.String(r.project),
	})
	if err != nil {
		return "", err
	}
	return aws.ToString(out.Build.Id), nil
}

func (r *CodeBuildRunner) Status(ctx context.Context, id string) (string, error) {
	out, err := r.client.BatchGetBuilds(ctx, &codebuild.BatchGetBuildsInput{Ids: []string{id}})
	if err != nil {
		return "", err
	}
	if len(out.Builds) == 0 || out.Builds[0].BuildStatus == "" {
		return "IN_PROGRESS", nil
	}
	return string(out.Builds[0].BuildStatus), nil
}
