"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export function ItemizePlaceholder() {
  const t = useTranslations("form");

  return (
    <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 p-4 opacity-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t("itemizeTitle")}</span>
        <Badge variant="secondary">{t("comingSoon")}</Badge>
      </div>
    </div>
  );
}
