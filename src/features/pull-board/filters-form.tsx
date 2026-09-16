"use client";

import { Toggle } from "@/components/ui/toggle";
import { BoardFilters } from "./schema";

const filters: {
  key: keyof BoardFilters;
  label: string;
  dot: string;
}[] = [
  { key: "empty", label: "Empty", dot: "bg-zinc-400" },
  { key: "starred", label: "Starred", dot: "bg-amber-400" },
  { key: "byMe", label: "By Me", dot: "bg-cyan-400" },
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
    <div className="flex flex-wrap gap-2">
      {filters.map(({ key, label, dot }) => (
        <Toggle
          key={key}
          variant="outline"
          size="sm"
          className="rounded-full"
          pressed={values[key]}
          onPressedChange={(pressed) => onChange({ ...values, [key]: pressed })}
        >
          <span className={`size-2 rounded-full ${dot}`} />
          {label}
        </Toggle>
      ))}
    </div>
  );
};
