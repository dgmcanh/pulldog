import { Octokit } from "@octokit/rest";
import {
  DEFAULT_PER_PAGE,
  GitProvider,
  GitPullRequest,
  GitRepository,
  GitUser,
  Paginated,
} from "../schema";
import {
  addressableRepos,
  BatchResponse,
  buildBatchQuery,
  buildBatchVariables,
  mapBatchResponse,
} from "./graphql";

const repoSortParam = {
  name: "full_name",
  created: "created",
  updated: "updated",
} as const;

export const github: GitProvider = {
  getCurrentUser: async (token) => {
    const octokit = new Octokit({
      auth: token,
    });

    try {
      const { data: user } = await octokit.users.getAuthenticated();

      if (!user) {
        return null;
      }

      const gitUser: GitUser = {
        id: user.id,
        login: user.login,
        name: user.name ?? undefined,
        avatarUrl: user.avatar_url,
        webUrl: user.html_url,
      };

      return gitUser;
    } catch {
      return null;
    }
  },
  listRepos: async ({
    token,
    options: {
      starred = false,
      sort = "name",
      direction = "asc",
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    },
  }): Promise<Paginated<GitRepository>> => {
    const octokit = new Octokit({
      auth: token,
    });

    try {
      const { data: repos } = starred
        ? await octokit.activity.listReposStarredByAuthenticatedUser({
            // starred list only sorts by created/updated, so "name" falls back to updated
            sort: sort === "name" ? "updated" : sort,
            direction,
            per_page: perPage,
            page,
          })
        : await octokit.repos.listForAuthenticatedUser({
            sort: repoSortParam[sort],
            direction,
            per_page: perPage,
            page,
          });

      const items = (repos ?? []).map((repo) => ({
        id: repo.id,
        owner: {
          id: repo.owner.id,
          login: repo.owner.login,
          name: repo.owner.name ?? undefined,
          avatarUrl: repo.owner.avatar_url ?? undefined,
          webUrl: repo.owner.html_url,
        },
        name: repo.name,
        webUrl: repo.html_url,
      }));

      return { items, page, perPage, hasMore: items.length === perPage };
    } catch {
      return { items: [], page, perPage, hasMore: false };
    }
  },
  listPullRequests: async ({
    token,
    owner,
    repo,
    options = {},
  }): Promise<Paginated<GitPullRequest>> => {
    const {
      state = "open",
      authorLogin,
      sort = "updated",
      direction = "desc",
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    } = options;

    const octokit = new Octokit({
      auth: token,
    });

    try {
      const { data: pulls } = await octokit.pulls.list({
        owner: owner!,
        repo: String(repo),
        state,
        sort,
        direction,
        per_page: perPage,
        page,
      });

      const items = (pulls ?? [])
        // pulls.list has no author param, unlike GitLab — filter the fetched page
        .filter((pull) => !authorLogin || pull.user?.login === authorLogin)
        .map((pull) => ({
          id: pull.id,
          number: pull.number,
          draft: pull.draft,
          state: pull.state,
          webUrl: pull.html_url,
          name: pull.title,
          assignees: pull.assignee
            ? [
                {
                  id: pull.assignee?.id,
                  login: pull.assignee?.login,
                  name: pull.assignee?.name ?? undefined,
                  avatarUrl: pull.assignee?.avatar_url ?? undefined,
                  webUrl: pull.assignee?.html_url,
                },
              ]
            : [],
          author: {
            id: pull.user?.id,
            login: pull.user?.login,
            name: pull.user?.name ?? undefined,
            avatarUrl: pull.user?.avatar_url ?? undefined,
            webUrl: pull.user?.html_url,
          },
        }));

      return {
        items,
        page,
        perPage,
        hasMore: (pulls ?? []).length === perPage,
      };
    } catch {
      return { items: [], page, perPage, hasMore: false };
    }
  },
  listPullRequestsForRepos: async ({ token, repos, options = {} }) => {
    const addressable = addressableRepos(repos);

    if (addressable.length === 0) {
      return new Map();
    }

    const octokit = new Octokit({
      auth: token,
    });

    let data: BatchResponse;

    try {
      data = await octokit.graphql<BatchResponse>(
        buildBatchQuery(addressable.length),
        buildBatchVariables(addressable, options),
      );
    } catch (error) {
      // GraphQL answers partially: unreadable repos come back as null aliases
      // beside an errors entry. Keep what resolved, let the caller REST the rest.
      data = (error as { data?: BatchResponse }).data ?? {};
    }

    return mapBatchResponse(data, addressable, options);
  },
};
