// SPDX-License-Identifier: GPL-3.0-only
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
