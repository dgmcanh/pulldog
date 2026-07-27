export type GitUser = {
  id?: string | number;
  name?: string;
  login?: string;
  avatarUrl?: string;
  webUrl?: string;
};

export type GitRepository = {
  id?: string | number;
  owner?: GitUser;
  webUrl?: string;
  name?: string;
};

export type GitPullRequest = {
  id?: string | number;
  number: number;
  draft?: boolean;
  state?: string;
  webUrl?: string;
  name?: string;
  author?: GitUser;
  assignees?: GitUser[];
};

export type SortDirection = "asc" | "desc";
export type RepoSort = "name" | "created" | "updated";
export type PullSort = "created" | "updated";
export type PullState = "open" | "closed" | "all";

export type Paginated<T> = {
  items: T[];
  page: number;
  perPage: number;
  hasMore: boolean;
};

export const DEFAULT_PER_PAGE = 20;

export type ListReposOptions = {
  starred?: boolean;
  sort?: RepoSort;
  direction?: SortDirection;
  page?: number;
  perPage?: number;
};

export type ListPullRequestsOptions = {
  state?: PullState;
  /** Provider filters by author when supported, in memory otherwise. */
  authorLogin?: string;
  sort?: PullSort;
  direction?: SortDirection;
  page?: number;
  perPage?: number;
};

export interface GitProvider {
  getCurrentUser(token: string): Promise<GitUser | null>;
  listRepos(request: {
    token: string;
    options: ListReposOptions;
  }): Promise<Paginated<GitRepository>>;
  listPullRequests(request: {
    token: string;
    owner?: string;
    repo: string | number;
    options?: ListPullRequestsOptions;
  }): Promise<Paginated<GitPullRequest>>;
  /**
   * Optional batch fetch, keyed by repo id. Providers return entries only for
   * repos they resolved, so callers fall back to `listPullRequests` for the
   * rest — a provider that can't batch just omits this.
   */
  listPullRequestsForRepos?(request: {
    token: string;
    repos: GitRepository[];
    options?: ListPullRequestsOptions;
  }): Promise<Map<string | number, GitPullRequest[]>>;
}
