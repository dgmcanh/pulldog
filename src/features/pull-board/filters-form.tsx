"use client";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { BoardFilters } from "./schema";

const labels: Record<keyof BoardFilters, string> = {
  empty: "Empty",
  starred: "Starred",
  byMe: "By Me",
};

const keys = Object.keys(labels) as (keyof BoardFilters)[];

export const FiltersForm = ({
  values,
  onChange,
}: {
  values: BoardFilters;
  onChange: (values: BoardFilters) => void;
}) => {
  // the board owns the filter state, so this holds none of its own
  return (
    <div className="w-full">
      <Separator />
      <div className="flex flex-col">
        {keys.map((key) => (
          <label
            key={key}
            htmlFor={key}
            className="flex cursor-pointer items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
          >
            <span className="text-sm font-medium">{labels[key]}</span>
            <Switch
              id={key}
              size="sm"
              checked={values[key]}
              onCheckedChange={(checked) =>
                onChange({ ...values, [key]: checked })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
};
