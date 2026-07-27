"use client";

import { GitPullRequest } from "@/lib/git-provider";
import { ActionIcon, Loader, Title } from "@mantine/core";
import { useIntersection, useWindowScroll } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import groupBy from "lodash.groupby";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBoardData, setFilters } from "./actions";
import { FiltersForm } from "./filters-form";
import { NoPullRequests, PullRequest } from "./pull-request";
import { Repository } from "./repository";
import { BoardData, BoardFilters } from "./schema";

export const PullBoard = ({
  initialData,
  filters,
}: {
  initialData: BoardData;
  filters: BoardFilters;
}) => {
  const [boardFilters, setBoardFilters] = useState(filters);

  const isServerRenderedFilters =
    boardFilters.starred === filters.starred &&
    boardFilters.byMe === filters.byMe;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      // starred/byMe belong in the key: flipping one is a different query, so it
      // refetches from page 1 on its own and flipping back hits the cache
      queryKey: ["board", boardFilters.starred, boardFilters.byMe],
      queryFn: ({ pageParam }) =>
        getBoardData({ page: pageParam, filters: boardFilters }),
      initialPageParam: initialData.page,
      getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
      initialData: isServerRenderedFilters
        ? { pages: [initialData], pageParams: [initialData.page] }
        : undefined,
    });

  const repositories = useMemo(() => {
    const fetched = (data?.pages ?? []).flatMap((page) => page.repositories);

    // hiding empty repos is pure display work over data already in hand
    return boardFilters.empty
      ? fetched
      : fetched.filter((repo) => repo.pulls.length > 0);
  }, [data, boardFilters.empty]);

  const handleFiltersChange = (values: BoardFilters) => {
    setBoardFilters(values);
    // persisted for the next visit only — the fetch takes its filters as
    // arguments, so nothing has to wait for this cookie to land
    void setFilters(values);
  };

  const { ref: sentinelRef, entry } = useIntersection();

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasData = repositories.length > 0;
  const [focusedRepoId, setFocusedRepoId] = useState<string | number | null>(
    null,
  );

  const repoIndexes = useMemo(() => {
    // providers already sort by name
    const grouped = groupBy(
      repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
        owner: {
          avatarUrl: repo.owner?.avatarUrl,
          login: repo.owner?.login,
        },
      })),
      "owner.login",
    );

    return Object.keys(grouped).map((owner) => ({
      owner,
      repos: grouped[owner],
    }));
  }, [repositories]);

  const handleRepoNavClick = (repoId: string | number) => {
    setFocusedRepoId((prev) => (prev === repoId ? null : repoId));
    const element = document.getElementById("repo-" + repoId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  return (
    <div>
      <Header className="sticky top-0 z-10" />

      <div className="mx-auto grid max-w-screen-xl grid-cols-[auto_1fr] gap-6 px-3">
        <Sidebar className="max-w-[400px] min-w-[300px] pt-8">
          <FiltersForm values={boardFilters} onChange={handleFiltersChange} />

          <ul className="mt-8">
            {repoIndexes.map((owner) => (
              <div key={owner.owner} className="pb-6">
                <h4 className="mb-1 rounded-md py-1 text-sm font-semibold">
                  {owner.owner}
                </h4>

                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {owner.repos.map((repo) => (
                    <button
                      onClick={() =>
                        handleRepoNavClick(
                          repo.id as unknown as string | number,
                        )
                      }
                      key={repo.id}
                      className={clsx(
                        "text-muted-foreground flex w-full cursor-pointer items-center rounded-md border border-transparent py-1 hover:underline",
                      )}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </ul>
        </Sidebar>

        <Main>
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className={clsx(
                "p-md mb-12 rounded-lg ring-2",
                focusedRepoId === repo.id ? "ring-dark-4" : "ring-transparent",
              )}
            >
              <div className="relative scroll-mt-24" id={"repo-" + repo.id} />
              <Repository repo={repo} />
              <div className="mt-3 flex flex-col gap-3">
                {repo.pulls && repo.pulls.length > 0 ? (
                  repo.pulls.map((pull: GitPullRequest) => (
                    <PullRequest key={pull.id} pullRequest={pull} />
                  ))
                ) : (
                  <NoPullRequests className="ml-8" />
                )}
              </div>
            </div>
          ))}

          {!hasData && !hasNextPage && !isFetching && <NoPullRequests />}

          {!hasData && isFetching && (
            <div className="flex justify-center py-8">
              <Loader size="sm" />
            </div>
          )}

          {/* stays mounted while more pages exist, so a page filtered down to
              nothing keeps the observer firing instead of stalling the scroll */}
          {hasNextPage && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {isFetchingNextPage && <Loader size="sm" />}
            </div>
          )}
        </Main>
      </div>
    </div>
  );
};

function Header({ className }: { className?: string }) {
  const [scroll] = useWindowScroll();

  const isOnTop = useMemo(() => scroll.y === 0, [scroll]);

  return (
    <header
      className={clsx(
        "h-14 backdrop-blur-sm",
        !isOnTop && "border-b border-white/5 shadow-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-row items-center justify-between px-3 py-2">
        <Title order={4}>pulldog</Title>
        <ActionIcon
          component={Link}
          href="/settings"
          variant="subtle"
          size="xl"
        >
          <Settings strokeWidth={3} size={18} />
        </ActionIcon>
      </div>
    </header>
  );
}

function Sidebar({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={clsx("sticky top-14 block self-start pt-4", className)}>
      {children}
    </div>
  );
}

function Main({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <main className={clsx("pt-4", className)}>{children}</main>;
}
