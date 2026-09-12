// SPDX-License-Identifier: GPL-3.0-only
export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};
