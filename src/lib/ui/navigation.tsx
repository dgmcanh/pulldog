import { buttonVariants } from "@/components/ui/button";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const BackIcon = ({
  href,
  className,
}: {
  href: string;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={clsx(
        // a Base UI Button forces role="button", so a link gets the styles only
        buttonVariants({ variant: "ghost", size: "icon-lg" }),
        "action-icon size-11 rounded-full",
        className,
      )}
    >
      <ArrowLeft strokeWidth={3} size={18} />
    </Link>
  );
};
