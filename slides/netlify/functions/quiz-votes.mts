import { getStore } from "@netlify/blobs";
import { jsonResponse } from "./shared.mts";

// GET ?quizGroupId=… → every saved vote in the group, as the answer messages the deck counts live.
export default async (req: Request) => {
  const quizGroupId = new URL(req.url).searchParams.get("quizGroupId");
  if (!quizGroupId) return jsonResponse({ error: "quizGroupId is required" }, 400);
  const store = getStore({ name: "votes", consistency: "strong" });
  const prefix = `${quizGroupId}/`;
  const { blobs } = await store.list({ prefix });
  const votes = await Promise.all(blobs.map(async ({ key }) => {
    const [quizId, sessionId] = key.slice(prefix.length).split("/");
    const saved = await store.get(key, { type: "json" });
    return saved && { quizId, sessionId, answer: saved.answer };
  }));
  return jsonResponse({ votes: votes.filter(Boolean) });
};
