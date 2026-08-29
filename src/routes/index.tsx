import { createFileRoute } from "@tanstack/react-router";
import { AuthGateway } from "../components/auth-gateway";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeSense AI — Home Resource Intelligence" },
      {
        name: "description",
        content:
          "HomeSense AI finds invisible water and electricity waste at home, prices it and recommends automation only once the waste is proven.",
      },
      { property: "og:title", content: "HomeSense AI — Home Resource Intelligence" },
      {
        property: "og:description",
        content: "See waste. Measure impact. Start saving with AI-powered home resource monitoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: Index,
});

function Index() {
  return (
    <AuthGateway
      supabaseUrl={import.meta.env["VITE_SUPABASE_URL"]}
      supabasePublishableKey={import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}
      dataMode={import.meta.env["VITE_DATA_MODE"]}
      authMode={import.meta.env["VITE_AUTH_MODE"]}
    />
  );
}
