import { serve } from "bun";
import index from "./index.html";

async function loadConversation(name: string) {
  const source = await Bun.file(new URL(`./conversations/${name}.yaml`, import.meta.url)).text();
  return Bun.YAML.parse(source);
}

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/api/conversations/rabbit": async () => Response.json(await loadConversation("rabbit")),
    "/api/conversations/snake": async () => Response.json(await loadConversation("snake")),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
