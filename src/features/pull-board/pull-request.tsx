import { AvatarGroup } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { GitPullRequest } from "@/lib/git-provider";
import clsx from "clsx";
import { GitPullRequestArrow, GitPullRequestDraft } from "lucide-react";
import Link from "next/link";
import { Assignee } from "./assignee";

const PullRequestStatusIcon = ({
  pullRequest,
}: {
  pullRequest: GitPullRequest;
}) => {
  if (pullRequest.draft)
    return (
      <GitPullRequestDraft
        className={clsx("mt-1.5 ml-0.5 h-5 w-5 stroke-gray-600")}
      />
    );

  if (pullRequest.state === "open")
    return (
      <GitPullRequestArrow
        className={clsx("mt-1.5 ml-0.5 h-5 w-5 stroke-green-600")}
      />
    );
};

export const PullRequest = ({
  pullRequest,
}: {
  pullRequest: GitPullRequest;
}) => {
  return (
    <div className="mt-2 flex flex-row place-content-between">
      <div className="flex flex-row gap-2">
        <PullRequestStatusIcon pullRequest={pullRequest} />
        <div className="flex flex-col gap-1">
          <Link
            href={pullRequest.webUrl || ""}
            target="_blank"
            rel="noreferrer"
            className="text-lg"
          >
            {pullRequest.name}
          </Link>

          <div className="flex flex-row items-center gap-1">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-sm text-transparent">
              #{pullRequest.number}
            </span>
            <p className="text-muted-foreground text-sm">
              {!!pullRequest.author && `opened by ${pullRequest.author?.login}`}
            </p>
          </div>
        </div>
      </div>
      <AvatarGroup>
        {pullRequest.assignees?.map((assignee) => (
          <Assignee key={assignee.login} assignee={assignee} />
        ))}
      </AvatarGroup>
    </div>
  );
};

// one line under a repo that simply has nothing open
export const NoPullRequestsRow = ({ className }: { className?: string }) => {
  return (
    <p className={clsx("text-muted-foreground text-sm", className)}>
      No open pull requests
    </p>
  );
};

// the whole board came back empty
export const NoPullRequests = () => {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia>
          <StackedCardsIllustration />
        </EmptyMedia>
        <EmptyTitle>No open pull requests</EmptyTitle>
        <EmptyDescription>
          Nothing to review right now. Add an account or loosen the filters.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

function StackedCardsIllustration() {
  return (
    <div className="relative h-24 w-52" aria-hidden="true">
      {/* Back card */}
      <div className="border-border/50 bg-muted/60 dark:bg-muted/30 absolute inset-x-6 top-0 h-6 rounded-t-lg border" />
      {/* Middle card */}
      <div className="border-border/60 bg-muted/80 dark:bg-muted/50 absolute inset-x-3 top-3 h-6 rounded-t-lg border" />
      {/* Front card */}
      <div className="border-border bg-background absolute inset-x-0 top-6 flex h-16 items-center gap-3 rounded-lg border px-4 shadow-sm">
        <div className="bg-muted size-8 shrink-0 rounded" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-muted h-2.5 w-3/4 rounded" />
          <div className="bg-muted/60 h-2 w-1/2 rounded" />
        </div>
      </div>
      {/* Fade overlay */}
      <div className="from-background/0 via-background/60 to-background pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b" />
    </div>
  );
}
