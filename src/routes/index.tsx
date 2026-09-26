import { createFileRoute } from "@tanstack/react-router";
import { NexaPage } from "@/components/nexa-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexa — Turn Every Conversation Into Revenue" },
      { name: "description", content: "Nexa brings AI and human support together to resolve conversations, delight customers, and drive revenue." },
      { property: "og:title", content: "Nexa — AI Customer Support That Drives Revenue" },
      { property: "og:description", content: "One intelligent workspace for faster resolutions, stronger relationships, and more revenue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NexaPage,
});
