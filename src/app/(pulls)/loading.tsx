import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { BoardShell } from "@/lib/ui/board-shell";

const repoGroups = [3, 2, 2];
const repoBlocks = [
  [400, 300, 250, 500, 200],
  [400, 300, 250, 500, 200],
  [400],
];

export default function Loading() {
  return (
    <BoardShell
      disabled
      sidebar={
        <>
          <SidebarGroup className="gap-2">
            {[50, 60, 70].map((width, i) => (
              <div key={i} className="flex flex-row items-center gap-2">
                <Skeleton className="h-[18px] w-[32px] rounded-full" />
                <Skeleton className="h-[16px] rounded-md" style={{ width }} />
              </div>
            ))}
          </SidebarGroup>

          {repoGroups.map((count, group) => (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>
                <Skeleton className="h-[12px] w-[90px] rounded-full" />
              </SidebarGroupLabel>
              <SidebarMenu>
                {Array.from({ length: count }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </>
      }
    >
      {repoBlocks.map((pulls, block) => (
        <div key={block} className="mb-12 flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <Skeleton className="h-[32px] w-[32px] rounded-full" />
            <Skeleton className="h-[16px] w-[200px] rounded-md" />
          </div>
          {pulls.map((width, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="ml-1 h-[20px] w-[20px] rounded-md" />
                <Skeleton className="h-[16px] rounded-md" style={{ width }} />
              </div>
              <Skeleton className="ml-10 h-[10px] w-[110px] rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </BoardShell>
  );
}
