// SPDX-License-Identifier: GPL-3.0-only
import { redirect } from "next/navigation";

// Consolidated single admin page — kept for bookmarks and e2e compatibility.
export default function AdminUsersRedirect() {
  redirect("/admin");
}
