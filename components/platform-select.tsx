"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PLATFORMS = [
  { id: "doordash", label: "DoorDash" },
  { id: "ubereats", label: "Uber Eats" },
  { id: "instacart", label: "Instacart" },
  { id: "amazonflex", label: "Amazon Flex" },
  { id: "other", label: "Other" },
];

interface PlatformSelectProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

export function PlatformSelect({ selected, onChange }: PlatformSelectProps) {
  const t = useTranslations("form");

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">{t("platforms")}</legend>
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <label key={p.id} className="flex items-center gap-1.5 text-sm">
            <Checkbox
              checked={selected.includes(p.id)}
              onCheckedChange={() => toggle(p.id)}
            />
            {p.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
