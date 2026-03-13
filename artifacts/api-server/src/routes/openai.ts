import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, conversations, messages, vehicles } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are CarBuddy, an expert AI car-buying assistant. You help users find, compare, and purchase vehicles.

You have access to a live inventory database of vehicles. When recommending vehicles, you MUST output a structured JSON block in addition to your prose explanation. Use this exact format:

\`\`\`json
{"vehicles": [{"id": 1, "reason": "Best overall match for your criteria"}]}
\`\`\`

Capabilities:
- Understand natural language car queries ("I need an SUV under $35k for a family of 4")
- Recommend vehicles from the live inventory database
- Compare trims, features, and pricing
- Explain fair market value and whether a listing is a good deal
- Provide reliability and safety information
- Help users understand financing, trade-in values, and negotiation strategies

Personality: Friendly, knowledgeable, and direct. Like talking to a trusted friend who happens to be a car expert. Don't be overly formal.

When the user describes what they want, ALWAYS recommend specific vehicles from the inventory with the JSON block. Include match percentage reasoning.
When discussing a specific vehicle, provide detailed specs, pros/cons, and market pricing context.
Always end responses with a follow-up question to learn more about the user's preferences.`;

async function buildChatMessages(conversationId: number, newContent: string) {
  const allVehicles = await db
    .select()
    .from(vehicles)
    .limit(50);

  const inventorySummary = allVehicles
    .map(v => `ID:${v.id} | ${v.year} ${v.make} ${v.model} ${v.trim} | $${v.price.toLocaleString()} | ${v.mileage.toLocaleString()} mi | ${v.type} | ${v.mpg} MPG | ${v.priceStatus} ($${Math.abs(v.marketPriceDiff)} ${v.marketPriceDiff < 0 ? "below" : "above"} market)`)
    .join("\n");

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nCURRENT LIVE INVENTORY:\n${inventorySummary}`,
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: newContent },
  ];

  return chatMessages;
}

router.get("/openai/conversations", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const [conv] = await db.insert(conversations).values({ title: body.title }).returning();
    res.status(201).json(conv);
  } catch (err) {
    res.status(400).json({ error: "Invalid request body" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return void res.status(404).json({ error: "Not found" });

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    res.json({ ...conv, messages: msgs });
  } catch {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    if (!deleted.length) return void res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(msgs);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return void res.status(404).json({ error: "Conversation not found" });

    const body = SendOpenaiMessageBody.parse(req.body);

    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    const chatMessages = await buildChatMessages(id, body.content);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    if (conv.title === "New Conversation" || conv.title.startsWith("New Conversation")) {
      const titleCompletion = await openai.chat.completions.create({
        model: "gpt-5.2",
        max_completion_tokens: 20,
        messages: [
          { role: "user", content: `Create a short 3-5 word title for a car shopping conversation that started with: "${body.content}". Respond with ONLY the title, no quotes.` }
        ],
      });
      const newTitle = titleCompletion.choices[0]?.message?.content?.trim();
      if (newTitle) {
        await db.update(conversations).set({ title: newTitle }).where(eq(conversations.id, id));
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process message" });
    }
  }
});

export default router;
