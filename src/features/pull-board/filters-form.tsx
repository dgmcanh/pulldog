"use client";

import { Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BoardFilters } from "./schema";

export const FiltersForm = ({
  values,
  onChange,
}: {
  values: BoardFilters;
  onChange: (values: BoardFilters) => void;
}) => {
  const form = useForm({
    mode: "controlled",
    initialValues: values,
  });

  return (
    <form onChange={form.onSubmit(onChange)} className="space-y-2">
      <Switch
        label="Empty"
        defaultChecked={values.empty}
        key={form.key("empty")}
        {...form.getInputProps("empty")}
      />
      <Switch
        label="Starred"
        defaultChecked={values.starred}
        key={form.key("starred")}
        {...form.getInputProps("starred")}
      />
      <Switch
        label="By Me"
        defaultChecked={values.byMe}
        key={form.key("byMe")}
        {...form.getInputProps("byMe")}
      />
    </form>
  );
};
