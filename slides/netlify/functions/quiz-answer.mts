import { getStore } from "@netlify/blobs";
import { broadcastTo, jsonResponse, handle, broadcastFailed, AnswerSchema, resultsStream } from "./shared.mts";

// Not the upstream copy: it also saves each vote, so a deck tab opened late can load them (quiz-votes.mts).
export default handle(
  AnswerSchema,
  async ({ quizId, answer, sessionId, quizGroupId }) => {
    console.log("[quiz-answer]", { quizId, answer, quizGroupId });
    try {
      // One key per voter and question: a changed vote overwrites the old one.
      await getStore({ name: "votes", consistency: "strong" }).setJSON(`${quizGroupId}/${quizId}/${sessionId}`, { answer });
    } catch (err) {
      // The live broadcast still counts the vote in open tabs, so don't reject it.
      console.error("[quiz-answer] saving the vote failed:", err);
    }
    try {
      await broadcastTo(resultsStream(quizGroupId), {
        quizId,
        answer,
        sessionId,
      });
      console.log("[quiz-answer] broadcast ok");
    } catch (err) {
      return broadcastFailed("[quiz-answer]", err);
    }

    return jsonResponse({ ok: true });
  },
);
