"use client";

import { buttonVariants } from "@/components/ui/button";
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

export function Header({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const isOnTop = useAtTop();

  return (
    <header
      className={clsx(
        "h-14 backdrop-blur-sm",
        !isOnTop && "border-b border-white/5 shadow-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-row items-center justify-between px-3 py-2">
        <h4 className="text-lg font-bold">pulldog</h4>
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
  );
}

export function Sidebar({
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

export function Main({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <main className={clsx("pt-4", className)}>{children}</main>;
}
