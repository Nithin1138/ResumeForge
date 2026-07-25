import { MetadataRoute } from "next";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://atslift.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/result/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
