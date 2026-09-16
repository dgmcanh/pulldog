"use client";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { BoardFilters } from "./schema";

const filters: {
  key: keyof BoardFilters;
  label: string;
  description: string;
}[] = [
  {
    key: "empty",
    label: "Empty",
    description: "Keep repos with nothing open",
  },
  {
    key: "starred",
    label: "Starred",
    description: "Only repos you starred",
  },
  {
    key: "byMe",
    label: "By Me",
    description: "Only pulls you opened",
  },
];

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
        {filters.map(({ key, label, description }) => (
          <label
            key={key}
            htmlFor={key}
            className="flex cursor-pointer items-center justify-between gap-2 border-b py-3 last:border-b-0"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-muted-foreground text-xs">
                {description}
              </span>
            </div>
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
