import { redirect } from "next/navigation";

// Consolidated single admin page — kept for bookmarks and e2e compatibility.
export default function AdminCoversRedirect() {
  redirect("/admin");
}
