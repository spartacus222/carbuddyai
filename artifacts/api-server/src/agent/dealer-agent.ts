import type { Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ilike } from "drizzle-orm";
import { db, dealers } from "@workspace/db";
import { searchWeb, fetchPage, TOOL_DEFINITIONS } from "./tools";

export interface AgentInput {
  location: string;
  vehicleQuery: string;
  maxDealers?: number;
}

type SSEEventType =
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "finding"
  | "summary"
  | "saved"
  | "error"
  | "done";

interface SSEEvent {
  type: SSEEventType;
  content?: string;
  tool?: string;
  input?: string;
  result?: string;
  data?: unknown;
}

function sendEvent(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

interface FoundVehicle {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  price?: number;
  mileage?: number;
  stock?: string;
  condition?: string;
}

interface FoundDealer {
  name: string;
  url?: string;
  address?: string;
  phone?: string;
  distance_estimate?: string;
  vehicles?: FoundVehicle[];
}

interface AgentResult {
  dealers: FoundDealer[];
  total_vehicles_found: number;
  search_summary: string;
}

async function saveDealersToDb(
  found: FoundDealer[],
  location: string,
  res: Response
): Promise<void> {
  let saved = 0;
  let updated = 0;

  for (const d of found) {
    if (!d.name) continue;

    try {
      const parts = location.split(",").map((s) => s.trim());
      const city = parts[0] ?? undefined;
      const state = parts[1] ?? undefined;

      const brandSet = new Set<string>();
      for (const v of d.vehicles ?? []) {
        if (v.make) brandSet.add(v.make);
      }
      const brands = [...brandSet];

      const existing = d.url
        ? await db.select().from(dealers).where(ilike(dealers.website, d.url))
        : [];

      if (existing.length > 0) {
        await db
          .update(dealers)
          .set({
            phone: d.phone ?? existing[0].phone ?? undefined,
            brands: brands.length > 0 ? brands : (existing[0].brands ?? []),
            lastScannedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(ilike(dealers.website, d.url ?? ""));
        updated++;
        sendEvent(res, {
          type: "saved",
          content: `Updated existing dealer: ${d.name}`,
        });
      } else {
        await db.insert(dealers).values({
          name: d.name,
          address: d.address ?? undefined,
          city,
          state,
          phone: d.phone ?? undefined,
          website: d.url ?? undefined,
          brands,
          source: "agent_scan",
          lastScannedAt: new Date(),
        });
        saved++;
        sendEvent(res, {
          type: "saved",
          content: `Saved new dealer: ${d.name}`,
        });
      }
    } catch (err) {
      console.error(`[dealer-agent] Failed to save dealer "${d.name}":`, err);
    }
  }

  sendEvent(res, {
    type: "saved",
    content: `Database updated: ${saved} new dealers added, ${updated} existing dealers refreshed`,
  });
}

const AGENT_SYSTEM_PROMPT = `You are an expert car dealer inventory research agent. Your job is to find car dealerships near a given location and scan their websites for available vehicle inventory.

STRATEGY:
1. Start with a web search for dealerships matching the vehicle type near the location
2. From search results, identify 3-4 promising dealer websites
3. Visit each dealer's website and look for their inventory/vehicles page
4. Extract vehicle listings: make, model, year, trim, price, mileage, stock number if available
5. Try different URL patterns if the first inventory page doesn't have detailed data (e.g. /inventory, /new-vehicles, /used-cars, /search)

OUTPUT FORMAT:
When you have collected enough data, summarize your findings as a JSON block in this exact format:
\`\`\`json
{
  "dealers": [
    {
      "name": "Dealer Name",
      "url": "https://dealer.com",
      "address": "123 Main St, City, ST",
      "phone": "(555) 123-4567",
      "distance_estimate": "~5 miles",
      "vehicles": [
        {
          "year": 2024,
          "make": "Toyota",
          "model": "RAV4",
          "trim": "XLE",
          "price": 32500,
          "mileage": 12000,
          "stock": "T12345",
          "condition": "Used"
        }
      ]
    }
  ],
  "total_vehicles_found": 15,
  "search_summary": "Found 3 dealers with 15 matching vehicles in the Austin, TX area"
}
\`\`\`

Be thorough but efficient. Prioritize finding actual vehicle prices and inventory counts over dealer general info. If a dealer's inventory page is JavaScript-heavy and returns no vehicles, note that and move to the next dealer.`;

export async function runDealerAgent(input: AgentInput, res: Response) {
  const { location, vehicleQuery, maxDealers = 3 } = input;

  sendEvent(res, {
    type: "thinking",
    content: `Starting dealer research for "${vehicleQuery}" near ${location}...`,
  });

  const messages: {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: unknown[];
  }[] = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Find ${vehicleQuery} dealerships near ${location}. I want to see their actual inventory with prices. Check up to ${maxDealers} dealers.`,
    },
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 12;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`[dealer-agent] Iteration ${iterations}`);

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: messages as never,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const message = choice.message;

    if (choice.finish_reason === "stop" || !message.tool_calls?.length) {
      const finalContent = message.content ?? "";
      sendEvent(res, { type: "summary", content: finalContent });

      const jsonMatch = finalContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const data: AgentResult = JSON.parse(jsonMatch[1]);
          sendEvent(res, { type: "finding", data });

          sendEvent(res, {
            type: "thinking",
            content: `Saving ${data.dealers.length} dealers to the database...`,
          });
          await saveDealersToDb(data.dealers, location, res);
        } catch (err) {
          console.error("[dealer-agent] Failed to parse/save final JSON:", err);
        }
      }

      sendEvent(res, {
        type: "done",
        content: `Research complete after ${iterations} steps`,
      });
      return;
    }

    messages.push({
      role: "assistant",
      content: message.content ?? "",
      tool_calls: message.tool_calls,
    });

    for (const toolCall of message.tool_calls) {
      const fnName = toolCall.function.name;
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {}

      sendEvent(res, {
        type: "tool_call",
        tool: fnName,
        input: fnName === "search_web" ? args.query : args.url,
      });

      let toolResult = "";

      if (fnName === "search_web") {
        const results = await searchWeb(args.query ?? "");
        if (results.length === 0) {
          toolResult = "No results found.";
        } else {
          toolResult = results
            .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
            .join("\n\n");
        }
        sendEvent(res, {
          type: "tool_result",
          tool: "search_web",
          result: `Found ${results.length} results`,
        });
      } else if (fnName === "fetch_page") {
        const page = await fetchPage(args.url ?? "");
        toolResult = `Title: ${page.title}\nURL: ${page.url}\n\nContent:\n${page.text}\n\nLinks found:\n${page.links
          .slice(0, 10)
          .map((l) => `- ${l.text}: ${l.href}`)
          .join("\n")}`;
        const vehicleCount = (page.text.match(/\$[\d,]+/g) ?? []).length;
        sendEvent(res, {
          type: "tool_result",
          tool: "fetch_page",
          result:
            vehicleCount > 0
              ? `Fetched page, found ~${vehicleCount} price references`
              : `Fetched page (${page.text.length} chars)`,
        });
      }

      messages.push({
        role: "tool",
        content: toolResult,
        tool_call_id: toolCall.id,
      });
    }
  }

  sendEvent(res, {
    type: "error",
    content: "Agent reached maximum iterations without completing.",
  });
  sendEvent(res, { type: "done", content: "Research timed out" });
}
