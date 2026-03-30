import { serve } from "bun";
import { conversationActors, getConversationApiPath } from "./features/conversations/registry";
import index from "./index.html";

async function loadConversation(name: string) {
  const source = await Bun.file(new URL(`./conversations/${name}.yaml`, import.meta.url)).text();
  return Bun.YAML.parse(source);
}

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    ...Object.fromEntries(
      conversationActors.map((actor) => [getConversationApiPath(actor), async () => Response.json(await loadConversation(actor))]),
    ),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
