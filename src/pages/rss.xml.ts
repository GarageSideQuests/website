import rss from "@astrojs/rss";
import { publicLogs } from "../lib/content";
import type { APIContext } from "astro";
export async function GET(context: APIContext) {
  return rss({
    title: "Garage Sidequests — Quest Log",
    description: "Notes from real technical projects in a working garage.",
    site: context.site!,
    items: (await publicLogs()).map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      description: e.data.summary,
      link: `/quest-log/${e.id}/`,
    })),
    customData: "<language>en-us</language>",
  });
}
