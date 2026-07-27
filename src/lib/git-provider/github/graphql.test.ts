import { describe, expect, it } from "vitest";
import {
  buildBatchQuery,
  buildBatchVariables,
  mapBatchResponse,
  type BatchResponse,
} from "./graphql";

const repos = [
  { id: 1, name: "alpha", owner: { login: "acme" } },
  { id: 2, name: "beta", owner: { login: "acme" } },
];

const pull = (login: string, number: number) => ({
  databaseId: number * 100,
  number,
  title: `pull ${number}`,
  url: `https://github.com/acme/alpha/pull/${number}`,
  isDraft: false,
  state: "OPEN",
  author: { login, avatarUrl: "a.png", url: "u", databaseId: 7, name: "Dev" },
  assignees: { nodes: [{ login: "revi", avatarUrl: "r.png", url: "ru" }] },
});

describe("buildBatchQuery", () => {
  it("addresses every repo by its own variable pair", () => {
    const query = buildBatchQuery(repos.length);

    expect(query).toContain("r0: repository(owner: $o0, name: $n0)");
    expect(query).toContain("r1: repository(owner: $o1, name: $n1)");
    expect(query).toContain("$o1: String!, $n1: String!");
  });

  it("declares nothing beyond the repo count", () => {
    expect(buildBatchQuery(2)).not.toContain("$o2");
  });
});

describe("buildBatchVariables", () => {
  it("maps options onto the query variables", () => {
    const variables = buildBatchVariables(repos, {
      state: "open",
      sort: "updated",
      direction: "desc",
      perPage: 20,
    });

    expect(variables).toMatchObject({
      first: 20,
      states: ["OPEN"],
      orderBy: { field: "UPDATED_AT", direction: "DESC" },
      o1: "acme",
      n1: "beta",
    });
  });

  it("clamps to the 100-node connection cap", () => {
    expect(buildBatchVariables(repos, { perPage: 500 }).first).toBe(100);
  });

  it("drops the state filter when asking for all pulls", () => {
    expect(buildBatchVariables(repos, { state: "all" }).states).toBeNull();
  });
});

describe("mapBatchResponse", () => {
  // r1 is null: the token can't read it (SSO/permissions). It must stay absent
  // so the caller retries over REST instead of rendering "no pull requests".
  const response: BatchResponse = {
    r0: { pullRequests: { nodes: [pull("me", 1), pull("someone", 2)] } },
    r1: null,
  };

  it("omits unreadable repos rather than emptying them", () => {
    const mapped = mapBatchResponse(response, repos);

    expect([...mapped.keys()]).toEqual([1]);
    expect(mapped.get(1)).toHaveLength(2);
  });

  it("maps a pull onto the shared shape", () => {
    expect(mapBatchResponse(response, repos).get(1)![0]).toEqual({
      id: 100,
      number: 1,
      draft: false,
      // lowercased to match the REST path, which the UI compares against
      state: "open",
      webUrl: "https://github.com/acme/alpha/pull/1",
      name: "pull 1",
      author: {
        id: 7,
        login: "me",
        name: "Dev",
        avatarUrl: "a.png",
        webUrl: "u",
      },
      assignees: [
        {
          id: undefined,
          login: "revi",
          name: undefined,
          avatarUrl: "r.png",
          webUrl: "ru",
        },
      ],
    });
  });

  it("filters other authors out when byMe is on", () => {
    const mine = mapBatchResponse(response, repos, { authorLogin: "me" });

    expect(mine.get(1)!.map((p) => p.number)).toEqual([1]);
  });

  it("returns nothing when the whole query failed, so everything falls back", () => {
    expect(mapBatchResponse({}, repos).size).toBe(0);
  });
});
