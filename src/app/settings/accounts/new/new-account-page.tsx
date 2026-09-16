"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { AccountPreview } from "@/features/account/account-preview";
import { addAccount } from "@/features/account/actions";
import {
  accountFormSchema,
  AccountFormValues,
} from "@/features/account/schema";
import { BackIcon } from "@/lib/ui/navigation";
import {
  PageColumn,
  PageContent,
  PageHeader,
  PageRoot,
  PageRow,
  PageTitle,
} from "@/lib/ui/page";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, KeyRound, Router } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

// Token pages open with the name and scopes prefilled — the user only confirms.
// Scopes are the read-only minimum the providers' calls need: repos, pull
// requests and the current user (read:org so organization repos are listed).
const tokenPages = {
  github: {
    label: "Create a GitHub token",
    url: "https://github.com/settings/tokens/new?description=Pulldog&scopes=repo,read:org,read:user",
  },
  gitlab: {
    label: "Create a GitLab token",
    url: "https://gitlab.com/-/user_settings/personal_access_tokens?name=Pulldog&scopes=read_api",
  },
} as const;

const providers = [
  { value: "github", label: "Github" },
  { value: "gitlab", label: "Gitlab" },
];

const NewAccountPage = () => {
  const router = useRouter();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { provider: "github", token: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: AccountFormValues) => addAccount(values),
    onSuccess: () => {
      form.reset();
      router.back();
    },
  });

  // the preview is derived from the live form values, so it needs no state
  const [provider, token] = useWatch({
    control: form.control,
    name: ["provider", "token"],
  });

  return (
    // the generic is explicit because `onSubmit` is not on PageRoot's own props
    <PageRoot<React.ComponentProps<"form">>
      element="form"
      onSubmit={form.handleSubmit((values) => mutate(values))}
    >
      <PageHeader>
        <PageColumn element={BackIcon} href="/settings/accounts" />
        <PageTitle>Add account</PageTitle>
        <Button type="submit" className="w-fit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </PageHeader>
      <PageContent>
        <PageRow>
          <Card className="col-start-2">
            <CardContent>
              <AccountPreview account={{ provider, token }} />
            </CardContent>
          </Card>
        </PageRow>
        <PageRow>
          <Router className="mt-2 ml-1.5" size={20} />
          <Controller
            control={form.control}
            name="provider"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Select
                  items={providers}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </PageRow>
        <PageRow>
          <KeyRound className="mt-2 ml-1.5" size={20} />
          <Controller
            control={form.control}
            name="token"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Textarea placeholder="Token" rows={2} {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </PageRow>
        <PageRow className="pt-2">
          <a
            className="col-start-2 flex w-fit items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
            href={tokenPages[provider].url}
            target="_blank"
            rel="noreferrer"
          >
            {tokenPages[provider].label}
            <ExternalLink size={14} />
          </a>
        </PageRow>
      </PageContent>
    </PageRoot>
  );
};

export { NewAccountPage };
