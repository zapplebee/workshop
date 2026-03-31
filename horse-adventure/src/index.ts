import { mkdir, readdir } from "node:fs/promises";
import { basename } from "node:path";
import { serve } from "bun";
import { conversationActors, getConversationApiPath } from "./features/conversations/registry";
import index from "./index.html";

const uploadDirectory = new URL("../tmp/uploads/", import.meta.url);
const assetDirectory = new URL("./assets/", import.meta.url);

async function ensureUploadDirectory() {
  await mkdir(uploadDirectory, { recursive: true });
}

function sanitizeFilename(name: string) {
  return basename(name).replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function listUploads() {
  await ensureUploadDirectory();
  const entries = await readdir(uploadDirectory, { withFileTypes: true });

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const file = Bun.file(new URL(entry.name, uploadDirectory));
        return {
          name: entry.name,
          size: file.size,
          updatedAt: file.lastModified,
        };
      }),
  );

  return files.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function handleUpload(request: Request) {
  await ensureUploadDirectory();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }

  const safeName = sanitizeFilename(file.name || `upload-${Date.now()}`);
  const destination = new URL(safeName, uploadDirectory);
  await Bun.write(destination, file);

  return Response.json({
    ok: true,
    file: {
      name: safeName,
      size: file.size,
      path: `tmp/uploads/${safeName}`,
    },
  });
}

async function serveAssetFile(request: Request) {
  const url = new URL(request.url);
  const requestedPath = url.pathname.replace("/assets/", "");
  const safePath = requestedPath.split("/").map(sanitizeFilename).join("/");
  const file = Bun.file(new URL(safePath, assetDirectory));

  if (!(await file.exists())) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(file);
}

async function serveUploadedFile(request: Request) {
  await ensureUploadDirectory();
  const url = new URL(request.url);
  const requestedName = url.pathname.replace("/uploads/", "");
  const safeName = sanitizeFilename(requestedName);
  const file = Bun.file(new URL(safeName, uploadDirectory));

  if (!(await file.exists())) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(file);
}

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
    "/api/uploads": {
      GET: async () => Response.json({ files: await listUploads() }),
      POST: handleUpload,
    },
    "/assets/*": serveAssetFile,
    "/uploads/*": serveUploadedFile,
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
