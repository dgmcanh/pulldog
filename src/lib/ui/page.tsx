import clsx from "clsx";
import { createElement, ElementType, ReactElement, ReactNode } from "react";

const PageRoot = <P extends object = object>({
  element = "div",
  children,
  className,
  ...props
}: {
  element?: ElementType;
  children?: ReactNode;
  className?: string;
} & P): ReactElement => {
  return createElement(
    element,
    {
      className: clsx("mx-auto min-h-screen w-full max-w-screen-lg", className),
      ...props,
    },
    children,
  );
};

const PageHeader = <P extends object = object>({
  element = "nav",
  children,
  className,
  fullWidth = false,
  sticky = true,
  ...props
}: {
  element?: ElementType;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  sticky?: boolean;
} & P): ReactElement => {
  return createElement(
    element,
    {
      className: clsx(
        "bg-background grid w-full grid-cols-[3.25rem_1fr_auto] items-center p-2",
        "first:[&_.page-column.action-icon]:-ml-1",
        "last:[&_.page-column.action-icon]:-mr-0.5",
        { "max-w-screen-md": !fullWidth },
        { "sticky top-0 z-10": sticky },
        className,
      ),
      ...props,
    },
    children,
  );
};

const PageContent = <P extends object = object>({
  element = "main",
  children,
  className,
  fullWidth = false,
  ...props
}: {
  element?: ElementType;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
} & P): ReactElement => {
  return createElement(
    element,
    {
      className: clsx("pt-4", { "max-w-screen-md": !fullWidth }, className),
      ...props,
    },
    children,
  );
};

const PageRow = <P extends object = object>({
  element = "div",
  children,
  className,
  rows = 2,
  ...props
}: {
  element?: ElementType;
  children?: ReactNode;
  className?: string;
  rows?: 2 | 3;
} & P): ReactElement => {
  return createElement(
    element,
    {
      className: clsx(
        "grid w-full items-center px-2 pt-4",
        {
          "grid-cols-[3.25rem_1fr]": rows === 2,
          "grid-cols-[3.25rem_1fr_auto]": rows === 3,
        },
        className,
      ),
      ...props,
    },
    children,
  );
};

const PageTitle = ({ children }: { children: ReactNode }) => {
  return <h4 className="col-start-2 text-lg font-bold">{children}</h4>;
};

const PageColumn = <P extends object = object>({
  element = "div",
  children,
  className,
  ...props
}: {
  element?: ElementType;
  children?: ReactNode;
  className?: string;
} & P): ReactElement => {
  return createElement(
    element,
    {
      className: clsx("page-column", className),
      ...props,
    },
    children,
  );
};

export { PageColumn, PageContent, PageHeader, PageRoot, PageRow, PageTitle };
