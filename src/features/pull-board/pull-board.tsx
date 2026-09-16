"use client";

import { Spinner } from "@/components/ui/spinner";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BoardShell } from "@/lib/ui/board-shell";
import { GitPullRequest } from "@/lib/git-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import groupBy from "lodash.groupby";
import { useEffect, useMemo, useState } from "react";
import { getBoardData, setFilters } from "./actions";
import { FiltersForm } from "./filters-form";
import { NoPullRequests, NoPullRequestsRow, PullRequest } from "./pull-request";
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
    <BoardShell
      sidebar={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <FiltersForm values={boardFilters} onChange={handleFiltersChange} />
          </SidebarGroup>

          {repoIndexes.map((owner) => (
            <SidebarGroup key={owner.owner}>
              <SidebarGroupLabel>{owner.owner}</SidebarGroupLabel>
              <SidebarMenu>
                {owner.repos.map((repo) => (
                  <SidebarMenuItem key={repo.id}>
                    <SidebarMenuButton
                      isActive={focusedRepoId === repo.id}
                      onClick={() =>
                        handleRepoNavClick(
                          repo.id as unknown as string | number,
                        )
                      }
                    >
                      {repo.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </>
      }
    >
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className={clsx(
            "mb-12 rounded-lg p-4 ring-2",
            focusedRepoId === repo.id ? "ring-ring" : "ring-transparent",
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
              <NoPullRequestsRow className="ml-8" />
            )}
          </div>
        </div>
      ))}

      {!hasData && !hasNextPage && !isFetching && <NoPullRequests />}

      {!hasData && isFetching && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* stays mounted while more pages exist, so a page filtered down to
          nothing keeps the observer firing instead of stalling the scroll */}
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isFetchingNextPage && <Spinner />}
        </div>
      )}
    </BoardShell>
  );
};

// replaces Mantine's useIntersection; the node lives in state because the
// sentinel unmounts whenever a page turns out to be the last one
function useIntersection<T extends Element>() {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(([first]) => setEntry(first));
    observer.observe(node);

    return () => observer.disconnect();
  }, [node]);

  return { ref: setNode, entry };
}
