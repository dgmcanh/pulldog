"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { BoardFilters } from "./schema";

const labels: Record<keyof BoardFilters, string> = {
  empty: "Empty",
  starred: "Starred",
  byMe: "By Me",
};

export const FiltersForm = ({
  values,
  onChange,
}: {
  values: BoardFilters;
  onChange: (values: BoardFilters) => void;
}) => {
  // the board owns the filter state, so this holds none of its own
  return (
    <div className="space-y-2">
      {(Object.keys(labels) as (keyof BoardFilters)[]).map((key) => (
        <Field key={key} orientation="horizontal">
          <Switch
            id={key}
            checked={values[key]}
            onCheckedChange={(checked) =>
              onChange({ ...values, [key]: checked })
            }
          />
          <FieldLabel htmlFor={key}>{labels[key]}</FieldLabel>
        </Field>
      ))}
    </div>
  );
};
