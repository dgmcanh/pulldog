"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { removeAccount } from "@/features/account/actions";
import { AccountProps } from "@/features/account/schema";
import { BackIcon } from "@/lib/ui/navigation";
import {
  PageColumn,
  PageContent,
  PageHeader,
  PageRoot,
  PageRow,
  PageTitle,
} from "@/lib/ui/page";
import clsx from "clsx";
import { Plus, X } from "lucide-react";
import Link from "next/link";

export const AccountListPage = ({
  accounts = [],
}: {
  accounts?: AccountProps[];
}) => {
  return (
    <PageRoot>
      <PageHeader>
        <PageColumn element={BackIcon} href="/settings" />
        <PageTitle>Accounts</PageTitle>
        <PageColumn
          element={Link}
          href="/settings/accounts/new"
          className={clsx(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "action-icon -mr-0.5 size-11 rounded-full",
          )}
        >
          <Plus strokeWidth={3} size={18} />
        </PageColumn>
      </PageHeader>
      <PageContent element={"ul"}>
        {accounts.map((account, i) => (
          <ListItem key={"account" + i} account={account} />
        ))}
      </PageContent>
    </PageRoot>
  );
};

const ListItem = ({ account }: { account: AccountProps }) => {
  return (
    <PageRow rows={3} element="li">
      <Avatar className="-mt-4.5 ml-0.5">
        {account.avatarUrl && (
          <AvatarImage src={account.avatarUrl} alt={account.login ?? ""} />
        )}
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className="item-content grid grid-cols-[1fr_auto] gap-3 pb-4">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{account.name}</p>
          <Link
            href={account.webUrl || "#"}
            target="_blank"
            className="text-sm"
          >
            {account.login}
          </Link>
        </div>
        <form
          action={removeAccount.bind(null, {
            provider: account.provider,
            token: account.token,
            secured: true,
          })}
        >
          <Button
            type="submit"
            variant="ghost"
            size="icon-lg"
            className="-mr-0.5 size-11 rounded-full"
          >
            <X strokeWidth={3} size={18} />
          </Button>
        </form>
      </div>
    </PageRow>
  );
};
