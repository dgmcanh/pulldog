"use client";

import { Frame, FramePanel } from "@/components/reui/frame";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Fragment } from "react";
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
    <Frame spacing="sm">
      <FramePanel className="overflow-hidden p-0!">
        <FieldGroup className="gap-0">
          {keys.map((key, i) => (
            <Fragment key={key}>
              {i > 0 && <Separator />}
              <Field>
                <FieldLabel className="justify-between p-3">
                  <FieldTitle>{labels[key]}</FieldTitle>
                  <Switch
                    checked={values[key]}
                    onCheckedChange={(checked) =>
                      onChange({ ...values, [key]: checked })
                    }
                  />
                </FieldLabel>
              </Field>
            </Fragment>
          ))}
        </FieldGroup>
      </FramePanel>
    </Frame>
  );
};
