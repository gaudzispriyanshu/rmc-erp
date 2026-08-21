import {
  Boxes,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Layers,
  Settings,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

export type NavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
  /** role names allowed to see this item; empty = everyone signed in */
  roles?: string[];
};

export type NavSection = {
  /** null renders the group with no heading */
  title: string | null;
  items: NavItem[];
};

/**
 * Grouped by the mental model: the spine first, then master data, then admin.
 */
export const navigation: NavSection[] = [
  {
    title: null,
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ClipboardList },
      { label: "Trips", href: "/trips", icon: Truck },
      { label: "Dispatch", href: "/dispatch", icon: Layers },
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Inventory", href: "/inventory/items", icon: Boxes },
      { label: "Quality", href: "/quality", icon: FlaskConical },
    ],
  },
  {
    title: "Master data",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Mix designs", href: "/mix-designs", icon: FlaskConical },
      { label: "Vehicles", href: "/vehicles", icon: Truck },
      { label: "Drivers", href: "/drivers", icon: UserRound },
    ],
  },
  {
    title: "Admin",
    items: [{ label: "Settings", href: "/settings/profile", icon: Settings }],
  },
];
