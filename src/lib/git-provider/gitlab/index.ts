import axios from "axios";
import {
  DEFAULT_PER_PAGE,
  GitProvider,
  GitPullRequest,
  GitRepository,
  GitUser,
  Paginated,
} from "../schema";
import { GitlabMergeRequest, GitlabProject, GitlabUser } from "./schema";
import { mapState } from "./utils";

const projectOrderBy = {
  name: "name",
  created: "created_at",
  updated: "updated_at",
} as const;

const mergeRequestOrderBy = {
  created: "created_at",
  updated: "updated_at",
} as const;

const mergeRequestState = {
  open: "opened",
  closed: "closed",
  all: "all",
} as const;

export const gitlab: GitProvider = {
  getCurrentUser: async (token) => {
    // https://docs.gitlab.com/api/users/#get-the-current-user
    const response = await axios.get<GitlabUser>(
      "https://gitlab.com/api/v4/user",
      {
        params: {
          private_token: token,
        },
      },
    );

    if (!response.data) {
      return null;
    }

    const data = response.data;

    const gitUser: GitUser = {
      id: data.id,
      login: data.username,
      name: data.name,
      avatarUrl: data.avatar_url,
      webUrl: data.web_url,
    };

    return gitUser;
  },
  listRepos: async function ({
    token,
    options: {
      starred = false,
      sort = "name",
      direction = "asc",
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    },
  }): Promise<Paginated<GitRepository>> {
    // https://docs.gitlab.com/api/projects/#list-projects
    const response = await axios.get<GitlabProject[]>(
      "https://gitlab.com/api/v4/projects",
      {
        params: {
          private_token: token,
          membership: true,
          simple: true,
          archived: false,
          starred: starred,
          order_by: projectOrderBy[sort],
          sort: direction,
          page,
          per_page: perPage,
        },
      },
    );

    const data = response.data;

    const items: GitRepository[] = data.map((project) => ({
      id: project.id,
      webUrl: project.web_url,
      name: project.name,
      owner: {
        id: project.namespace.id,
        login: project.namespace.full_path,
        name: project.namespace.name,
        avatarUrl: project.namespace.avatar_url ?? undefined,
        webUrl: project.namespace.web_url,
      },
    }));

    return { items, page, perPage, hasMore: items.length === perPage };
  },
  listPullRequests: async function ({
    token,
    repo,
    options = {},
  }): Promise<Paginated<GitPullRequest>> {
    const {
      state = "open",
      authorLogin,
      sort = "updated",
      direction = "desc",
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    } = options;

    // https://docs.gitlab.com/api/merge_requests/#list-merge-requests
    const response = await axios.get<GitlabMergeRequest[]>(
      `https://gitlab.com/api/v4/projects/${repo}/merge_requests`,
      {
        params: {
          private_token: token,
          state: mergeRequestState[state],
          author_username: authorLogin,
          order_by: mergeRequestOrderBy[sort],
          sort: direction,
          page,
          per_page: perPage,
        },
      },
    );

    const data = response.data;
    const items: GitPullRequest[] = data.map((mr) => ({
      id: mr.id,
      number: mr.iid,
      draft: mr.work_in_progress,
      state: mapState(mr.state),
      webUrl: mr.web_url,
      name: mr.title,
      assignees: mr.assignees.map((assignee) => ({
        id: assignee.id,
        login: assignee.username,
        name: assignee.name,
        avatarUrl: assignee.avatar_url,
        webUrl: assignee.web_url,
      })),
      author: {
        id: mr.author.id,
        login: mr.author.username,
        name: mr.author.name,
        avatarUrl: mr.author.avatar_url,
        webUrl: mr.author.web_url,
      },
    }));

    return { items, page, perPage, hasMore: items.length === perPage };
  },
};
