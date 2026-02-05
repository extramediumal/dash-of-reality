"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { encodeInputs } from "@/lib/sharing";
import type { CalculationInput } from "@/lib/calculate";

interface ShareButtonProps {
  input: CalculationInput;
  locale: string;
}

export function ShareButton({ input, locale }: ShareButtonProps) {
  const t = useTranslations("results");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const encoded = encodeInputs(input);
    const url = `${window.location.origin}/${locale}/shared?d=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      {copied ? t("linkCopied") : t("share")}
    </Button>
  );
}
