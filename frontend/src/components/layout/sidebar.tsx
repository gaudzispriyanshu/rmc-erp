"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/nav";
import { site } from "@/config/site";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href={site.routes.home} className="sidebar-brand">
        {site.name}
      </Link>

      {navigation.map((section) => (
        <div key={section.title ?? "root"}>
          {section.title ? <p className="sidebar-section">{section.title}</p> : null}
          {section.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-link"
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="sidebar-link-icon" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
