"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth/token";
import { site } from "@/config/site";

export function Topbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-spacer" />
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="btn-icon" aria-hidden />
        ) : (
          <Moon className="btn-icon" aria-hidden />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          clearToken();
          router.replace(site.routes.login);
        }}
      >
        <LogOut className="btn-icon" aria-hidden />
        Sign out
      </Button>
    </header>
  );
}
