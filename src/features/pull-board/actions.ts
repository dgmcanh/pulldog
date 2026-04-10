"use server";

import { decrypt } from "@/lib/crypto";
import { getProvider } from "@/lib/git-provider";
import { cookies } from "next/headers";
import { getAccounts } from "../account/actions";
import { BoardData, BoardFilters } from "./schema";

export async function getBoardData(): Promise<BoardData> {
  let allRepos = [];
  const securedAccounts = await getAccounts();
  const filters = await getFilters();
  const accounts = securedAccounts.map((account) => ({
    token: decrypt(account.token),
    provider: account.provider,
  }));

  const currentUserLogins = filters.byMe
    ? new Set(
        (
          await Promise.all(
            accounts.map((account) =>
              getProvider(account.provider).getCurrentUser(account.token),
            ),
          )
        )
          .filter(Boolean)
          .map((u) => u!.login)
          .filter(Boolean) as string[],
      )
    : null;

  for (const account of accounts) {
    const provider = getProvider(account.provider);

    const repos = await provider.listRepos({
      token: account.token,
      options: { starred: filters.starred },
    });

    const pullsPromises = repos.map(async (repo) => {
      let pulls = await provider.listPullRequests({
        token: account.token,
        owner: account.provider === "github" ? repo.owner!.login : undefined,
        repo: account.provider === "github" ? repo.name! : repo.id!,
      });

      if (currentUserLogins) {
        pulls = pulls.filter(
          (pull) => pull.author?.login && currentUserLogins.has(pull.author.login),
        );
      }

      return { id: repo.id, pulls };
    });

    const pullsData = await Promise.all(pullsPromises);

    const repoWithPulls = repos.map((repo) => ({
      ...repo,
      pulls: pullsData.find((pull) => pull.id === repo.id)?.pulls,
    }));

    allRepos.push(...repoWithPulls);
  }

  if (!filters.empty) {
    allRepos = allRepos.filter((repo) => (repo.pulls?.length || 0) > 0);
  }

  return {
    repositories: allRepos as BoardData["repositories"],
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
