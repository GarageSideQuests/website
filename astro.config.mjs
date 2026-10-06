import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://garagesidequests.com",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
