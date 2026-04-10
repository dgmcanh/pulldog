import { GitPullRequest, GitRepository } from "@/lib/git-provider";

export type BoardFilters = {
  empty: boolean;
  starred: boolean;
  byMe: boolean;
};

export type BoardData = {
  repositories: (GitRepository & { pulls: GitPullRequest[] })[];
};
