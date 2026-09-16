"use client";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import clsx from "clsx";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// only `scroll.y === 0` was ever read off Mantine's useWindowScroll
function useAtTop() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY === 0);

    onScroll(); // the browser may restore a scroll position before hydration
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return atTop;
}

export function BoardShell({
  sidebar,
  children,
  disabled = false,
}: {
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const isOnTop = useAtTop();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-14 justify-center px-4">
          <h4 className="text-lg font-bold">pulldog</h4>
        </SidebarHeader>
        <SidebarContent className="gap-0 px-2">{sidebar}</SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header
          className={clsx(
            "bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center backdrop-blur-sm",
            !isOnTop && "border-b border-white/5 shadow-md",
          )}
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
          </div>
          <div className="ml-auto px-3">
            <Link
              href="/settings"
              aria-disabled={disabled}
              className={clsx(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "size-11 rounded-full",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <Settings strokeWidth={3} size={18} />
            </Link>
          </div>
        </header>
        <main className="px-4 py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
