import type {
  GitPullRequest,
  GitRepository,
  ListPullRequestsOptions,
} from "../schema";

/**
 * One GraphQL query fetching open pulls for many repos at once, replacing one
 * REST call per repo. Repos are addressed by explicit owner/name (never
 * `viewer.repositories`, whose ownerAffiliations default silently drops org
 * repos) so the permission surface matches `pulls.list` exactly.
 */

const PULL_FIELDS = `
  databaseId
  number
  title
  url
  isDraft
  state
  author {
    login
    avatarUrl
    url
    ... on User {
      databaseId
      name
    }
  }
  assignees(first: 10) {
    nodes {
      databaseId
      login
      name
      avatarUrl
      url
    }
  }
`;

const stateFilter = {
  open: ["OPEN"],
  closed: ["CLOSED", "MERGED"],
  all: null,
} as const;

const orderField = {
  created: "CREATED_AT",
  updated: "UPDATED_AT",
} as const;

export type GraphqlActor = {
  login?: string;
  name?: string | null;
  avatarUrl?: string;
  url?: string;
  databaseId?: number | null;
};

export type GraphqlPullRequest = {
  databaseId: number | null;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  state: string;
  author: GraphqlActor | null;
  assignees: { nodes: (GraphqlActor | null)[] | null } | null;
};

export type BatchResponse = Record<
  string,
  { pullRequests: { nodes: (GraphqlPullRequest | null)[] | null } } | null
>;

export const repoAlias = (index: number) => `r${index}`;

/** Repos we can address by owner/name; the rest fall back to the REST path. */
export const addressableRepos = (repos: GitRepository[]) =>
  repos.filter((repo) => repo.owner?.login && repo.name && repo.id != null);

export function buildBatchQuery(repoCount: number): string {
  const repoVars = Array.from(
    { length: repoCount },
    (_, index) => `$o${index}: String!, $n${index}: String!`,
  ).join(", ");

  const selections = Array.from(
    { length: repoCount },
    (_, index) => `
    ${repoAlias(index)}: repository(owner: $o${index}, name: $n${index}) {
      pullRequests(first: $first, states: $states, orderBy: $orderBy) {
        nodes { ...PullFields }
      }
    }`,
  ).join("");

  return `query batchPulls($first: Int!, $states: [PullRequestState!], $orderBy: IssueOrder!, ${repoVars}) {${selections}
}

fragment PullFields on PullRequest {${PULL_FIELDS}}`;
}

export function buildBatchVariables(
  repos: GitRepository[],
  {
    state = "open",
    sort = "updated",
    direction = "desc",
    perPage = 20,
  }: ListPullRequestsOptions = {},
): Record<string, unknown> {
  const variables: Record<string, unknown> = {
    first: Math.min(perPage, 100), // GraphQL connections cap at 100
    states: stateFilter[state],
    orderBy: {
      field: orderField[sort],
      direction: direction.toUpperCase(),
    },
  };

  repos.forEach((repo, index) => {
    variables[`o${index}`] = repo.owner!.login;
    variables[`n${index}`] = repo.name;
  });

  return variables;
}

const mapActor = (actor: GraphqlActor | null | undefined) =>
  actor
    ? {
        id: actor.databaseId ?? undefined,
        login: actor.login,
        name: actor.name ?? undefined,
        avatarUrl: actor.avatarUrl,
        webUrl: actor.url,
      }
    : undefined;

/**
 * Only repos present in the response are returned. A repo the token can't read
 * comes back as a null alias next to an errors entry, and stays absent here so
 * the caller can retry it over REST.
 */
export function mapBatchResponse(
  data: BatchResponse,
  repos: GitRepository[],
  { authorLogin }: ListPullRequestsOptions = {},
): Map<string | number, GitPullRequest[]> {
  const byRepo = new Map<string | number, GitPullRequest[]>();

  repos.forEach((repo, index) => {
    const entry = data?.[repoAlias(index)];

    if (!entry) {
      return;
    }

    const nodes = (entry.pullRequests?.nodes ?? []).filter(
      (node): node is GraphqlPullRequest => !!node,
    );

    byRepo.set(
      repo.id!,
      nodes
        // GraphQL has no author arg on pullRequests, same as REST — filter here
        .filter((node) => !authorLogin || node.author?.login === authorLogin)
        .map((node) => ({
          id: node.databaseId ?? undefined,
          number: node.number,
          draft: node.isDraft,
          state: node.state.toLowerCase(),
          webUrl: node.url,
          name: node.title,
          author: mapActor(node.author),
          assignees: (node.assignees?.nodes ?? [])
            .map(mapActor)
            .filter((assignee) => !!assignee),
        })),
    );
  });

  return byRepo;
}
