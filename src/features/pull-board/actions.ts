"use server";

import { cached, tokenKey } from "@/lib/cache";
import { decrypt } from "@/lib/crypto";
import { getProvider } from "@/lib/git-provider";
import { cookies } from "next/headers";
import { getAccounts } from "../account/actions";
import { BoardData, BoardFilters } from "./schema";

const PER_PAGE = 20;
const BOARD_TTL = 60_000; // matches the React Query staleTime
const USER_TTL = 60 * 60_000;

export async function getBoardData({
  page = 1,
  filters: requested,
}: { page?: number; filters?: BoardFilters } = {}): Promise<BoardData> {
  const securedAccounts = await getAccounts();
  const stored = await getFilters();
  // the client passes filters explicitly so a fetch can't race the cookie write;
  // coerced because these reach provider query params and cache keys
  const filters: BoardFilters = {
    empty: !!(requested ?? stored).empty,
    starred: !!(requested ?? stored).starred,
    byMe: !!(requested ?? stored).byMe,
  };
  const accounts = securedAccounts.map((account) => ({
    token: decrypt(account.token),
    provider: account.provider,
  }));

  // `empty` is deliberately absent from the key: it hides repos we already
  // fetched and is applied in the browser, so toggling it costs no request
  const key = [
    "board",
    accounts.map((account) => tokenKey(account.token)).join("+"),
    filters.starred,
    filters.byMe,
    page,
  ].join(":");

  return cached(key, BOARD_TTL, () => loadBoardPage(accounts, filters, page));
}

async function loadBoardPage(
  accounts: { token: string; provider: "github" | "gitlab" }[],
  filters: BoardFilters,
  page: number,
): Promise<BoardData> {
  const perAccount = await Promise.all(
    accounts.map(async (account) => {
      const provider = getProvider(account.provider);

      // the same identity for every page and every filter flip — cache it hard
      const authorLogin = filters.byMe
        ? ((
            await cached(`user:${tokenKey(account.token)}`, USER_TTL, () =>
              provider.getCurrentUser(account.token),
            )
          )?.login ?? undefined)
        : undefined;

      const repos = await provider.listRepos({
        token: account.token,
        options: {
          starred: filters.starred,
          sort: "name",
          direction: "asc",
          page,
          perPage: PER_PAGE,
        },
      });

      const pullOptions = {
        state: "open" as const,
        authorLogin,
        sort: "updated" as const,
        direction: "desc" as const,
        // GitHub can't filter pulls by author, so reach deeper when byMe is on
        // or a busy repo would hide the user's older pulls behind other people's
        perPage: authorLogin ? 100 : PER_PAGE,
      };

      // one request for the whole page where the provider supports it
      const batched = provider.listPullRequestsForRepos
        ? await provider.listPullRequestsForRepos({
            token: account.token,
            repos: repos.items,
            options: pullOptions,
          })
        : null;

      const repositories = await Promise.all(
        repos.items.map(async (repo) => {
          const pulls = batched?.get(repo.id!);

          if (pulls) {
            return { ...repo, pulls };
          }

          const fetched = await provider.listPullRequests({
            token: account.token,
            owner:
              account.provider === "github" ? repo.owner!.login : undefined,
            repo: account.provider === "github" ? repo.name! : repo.id!,
            options: pullOptions,
          });

          return { ...repo, pulls: fetched.items };
        }),
      );

      return { repositories, hasMore: repos.hasMore };
    }),
  );

  // every repo on the page is returned, empty ones included: no provider can
  // filter by "has open pulls", and dropping them here would mean a refetch
  // every time that switch flips. The board hides them client-side instead.
  return {
    repositories: perAccount.flatMap((account) => account.repositories),
    page,
    hasMore: perAccount.some((account) => account.hasMore),
  };
}

export async function setFilters({
  empty,
  starred,
  byMe,
}: {
  empty: boolean;
  starred: boolean;
  byMe: boolean;
}) {
  const cookieStore = await cookies();

  cookieStore.set("board-filters", JSON.stringify({ empty, starred, byMe }), {
    maxAge: Number.MAX_SAFE_INTEGER,
  });
}

export async function getFilters(): Promise<BoardFilters> {
  const cookieStore = await cookies();

  if (!cookieStore.has("board-filters")) {
    return { empty: false, starred: false, byMe: false };
  }

  const cookie = cookieStore.get("board-filters");
  const filters = JSON.parse(cookie!.value);

  return filters;
}
