"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import Link from "next/link";
import { AccountProps } from "./schema";
import { UserQuery } from "./user-query";

export const AccountPreview = ({
  account,
  className,
}: {
  account?: AccountProps;
  className?: string;
}) => {
  return (
    <UserQuery account={account}>
      {({ user }) => (
        <div className={clsx("grid grid-cols-[auto_1fr] gap-2", className)}>
          <Avatar className="my-auto">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.login ?? ""} />
            )}
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="my-auto">
            <p className="text-sm font-bold">{user?.name ?? "Unknown user"}</p>
            {user ? (
              <Link href={user.webUrl || "#"} className="text-sm">
                {user.login}
              </Link>
            ) : (
              <p className="text-sm">user@email.com</p>
            )}
          </div>
        </div>
      )}
    </UserQuery>
  );
};
