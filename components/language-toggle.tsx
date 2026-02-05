"use client";

import { useRouter, usePathname } from "next/navigation";

interface LanguageToggleProps {
  locale: string;
}

export function LanguageToggle({ locale }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={() => switchLocale(locale === "en" ? "es" : "en")}
      className="text-sm px-2 py-1 rounded border hover:bg-muted transition-colors"
      aria-label={locale === "en" ? "Cambiar a Espanol" : "Switch to English"}
    >
      {locale === "en" ? "\ud83c\uddf2\ud83c\uddfd ES" : "\ud83c\uddfa\ud83c\uddf8 EN"}
    </button>
  );
}
