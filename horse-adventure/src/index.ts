import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/api/conversations/rabbit": async () => {
      const source = await Bun.file(new URL("./conversations/rabbit.yaml", import.meta.url)).text();
      const conversation = Bun.YAML.parse(source);
      return Response.json(conversation);
    },
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
