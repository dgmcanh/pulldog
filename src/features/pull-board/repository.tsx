import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GitRepository } from "@/lib/git-provider";

export const Repository = ({ repo }: { repo: GitRepository }) => {
  const owner = repo.owner?.login || "rp";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href={repo.owner?.webUrl}
            className="flex flex-row items-center gap-2 text-foreground"
          >
            <Avatar size="sm">
              <AvatarImage src={repo.owner?.avatarUrl} alt={owner} />
              <AvatarFallback>{owner.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span>{repo.owner?.login}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>›</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href={repo.webUrl} className="text-foreground">
            {repo.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
