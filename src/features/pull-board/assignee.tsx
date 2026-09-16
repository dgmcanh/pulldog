import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GitUser } from "@/lib/git-provider";

export const Assignee = ({ assignee }: { assignee: GitUser }) => {
  if (!assignee.login) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Avatar>
            <AvatarImage src={assignee.avatarUrl} alt={assignee.login} />
            <AvatarFallback>{assignee.login.slice(0, 2)}</AvatarFallback>
          </Avatar>
        }
      />
      <TooltipContent>{assignee.login}</TooltipContent>
    </Tooltip>
  );
};
