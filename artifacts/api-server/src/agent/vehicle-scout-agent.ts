import type { Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ilike, and } from "drizzle-orm";
import { db, vehicleListings } from "@workspace/db";
import { searchWeb, fetchPage, TOOL_DEFINITIONS } from "./tools";

export interface VehicleScoutInput {
  make: string;
  model: string;
  yearMin?: number;
  yearMax?: number;
  priceMax?: number;
  location: string;
  maxListings?: number;
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

export interface FoundListing {
  make: string;
  model: string;
  year: number;
  trim?: string;
  condition?: string;
  color?: string;
  vin?: string;
  price?: number;
  mileage?: number;
  dealer_name?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_state?: string;
  dealer_phone?: string;
  dealer_website?: string;
  source_url?: string;
  source_site?: string;
  features?: string[];
  description?: string;
}

export interface ScoutResult {
  listings: FoundListing[];
  total_found: number;
  search_summary: string;
}

async function saveListingsToDb(
  found: FoundListing[],
  res: Response
): Promise<void> {
  let saved = 0;
  let updated = 0;

  for (const listing of found) {
    if (!listing.make || !listing.model || !listing.year) continue;

    try {
      if (listing.source_url) {
        const existing = await db
          .select()
          .from(vehicleListings)
          .where(ilike(vehicleListings.sourceUrl, listing.source_url));

        if (existing.length > 0) {
          await db
            .update(vehicleListings)
            .set({
              price: listing.price ?? existing[0].price ?? undefined,
              mileage: listing.mileage ?? existing[0].mileage ?? undefined,
              scannedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(ilike(vehicleListings.sourceUrl, listing.source_url));
          updated++;
          sendEvent(res, {
            type: "saved",
            content: `Updated: ${listing.year} ${listing.make} ${listing.model}${listing.trim ? " " + listing.trim : ""}${listing.price ? " — $" + listing.price.toLocaleString() : ""}`,
          });
          continue;
        }
      }

      await db.insert(vehicleListings).values({
        make: listing.make,
        model: listing.model,
        year: listing.year,
        trim: listing.trim ?? undefined,
        condition: listing.condition ?? "used",
        color: listing.color ?? undefined,
        vin: listing.vin ?? undefined,
        price: listing.price ?? undefined,
        mileage: listing.mileage ?? undefined,
        dealerName: listing.dealer_name ?? undefined,
        dealerAddress: listing.dealer_address ?? undefined,
        dealerCity: listing.dealer_city ?? undefined,
        dealerState: listing.dealer_state ?? undefined,
        dealerPhone: listing.dealer_phone ?? undefined,
        dealerWebsite: listing.dealer_website ?? undefined,
        sourceUrl: listing.source_url ?? undefined,
        sourceSite: listing.source_site ?? undefined,
        features: listing.features ?? [],
        description: listing.description ?? undefined,
        scannedAt: new Date(),
      });
      saved++;

      const label = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? " " + listing.trim : ""}`;
      const priceStr = listing.price ? ` — $${listing.price.toLocaleString()}` : "";
      const miStr = listing.mileage ? `, ${listing.mileage.toLocaleString()} mi` : "";
      const dealer = listing.dealer_name ? ` @ ${listing.dealer_name}` : "";
      sendEvent(res, {
        type: "saved",
        content: `Saved: ${label}${priceStr}${miStr}${dealer}`,
      });
    } catch (err) {
      console.error(`[vehicle-scout] Failed to save listing:`, err);
    }
  }

  sendEvent(res, {
    type: "saved",
    content: `Database updated: ${saved} new listings added, ${updated} listings refreshed`,
  });
}

const AGENT_SYSTEM_PROMPT = `You are an expert vehicle listing research agent. Your job is to find real vehicle listings for sale matching the user's criteria, sourced from car listing websites like Cars.com, AutoTrader, CarGurus, TrueCar, Craigslist, and local dealer websites.

STRATEGY:
1. Search for the specific vehicle on major listing sites (e.g., "2022 Toyota Camry under 25000 Austin TX site:cargurus.com")
2. Also try broader searches: "used Toyota Camry Austin TX for sale under 25000"
3. Visit 2-3 listing result pages and extract individual vehicle listings
4. For each listing, extract: year, make, model, trim, price, mileage, condition, color, VIN if visible, dealer name & address, and the listing URL
5. Try different search angles if initial searches return few results

OUTPUT FORMAT:
When done, output a JSON summary in this exact format:
\`\`\`json
{
  "listings": [
    {
      "year": 2022,
      "make": "Toyota",
      "model": "Camry",
      "trim": "SE",
      "condition": "used",
      "color": "Silver",
      "vin": "4T1G11AK3NU123456",
      "price": 22900,
      "mileage": 28000,
      "dealer_name": "Austin Toyota",
      "dealer_address": "6400 Middle Fiskville Rd",
      "dealer_city": "Austin",
      "dealer_state": "TX",
      "dealer_phone": "(512) 454-1551",
      "dealer_website": "https://www.austintoyota.com",
      "source_url": "https://www.cargurus.com/Cars/...",
      "source_site": "CarGurus",
      "features": ["Apple CarPlay", "Backup Camera", "Bluetooth"],
      "description": "One owner, clean carfax"
    }
  ],
  "total_found": 5,
  "search_summary": "Found 5 Toyota Camry listings in Austin TX area, prices ranging $19,500–$24,800"
}
\`\`\`

Focus on finding REAL, SPECIFIC listings with actual prices. If a page is too JavaScript-heavy to parse, move on. Quality over quantity — 3-4 real listings are better than 10 empty ones.`;

export async function runVehicleScoutAgent(input: VehicleScoutInput, res: Response) {
  const { make, model, yearMin, yearMax, priceMax, location, maxListings = 8 } = input;

  const yearRange = yearMin || yearMax
    ? `${yearMin ?? "any"}–${yearMax ?? "present"}`
    : "any year";

  const priceStr = priceMax ? `under $${priceMax.toLocaleString()}` : "any price";

  sendEvent(res, {
    type: "thinking",
    content: `Starting vehicle search: ${yearRange} ${make} ${model} ${priceStr} near ${location}...`,
  });

  const userPrompt = `Find ${yearRange} ${make} ${model} listings ${priceStr} near ${location}. I want real listings with actual prices, mileage, and dealer info. Find up to ${maxListings} listings from Cars.com, CarGurus, AutoTrader, or local dealer sites.`;

  const messages: {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: unknown[];
  }[] = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 14;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`[vehicle-scout] Iteration ${iterations}`);

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
          const data: ScoutResult = JSON.parse(jsonMatch[1]);
          sendEvent(res, { type: "finding", data });

          sendEvent(res, {
            type: "thinking",
            content: `Saving ${data.listings.length} listings to the database...`,
          });
          await saveListingsToDb(data.listings, res);
        } catch (err) {
          console.error("[vehicle-scout] Failed to parse/save final JSON:", err);
        }
      }

      sendEvent(res, {
        type: "done",
        content: `Search complete after ${iterations} steps`,
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
          toolResult = "No results found. Try a different query.";
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
          .slice(0, 12)
          .map((l) => `- ${l.text}: ${l.href}`)
          .join("\n")}`;
        const priceRefs = (page.text.match(/\$[\d,]+/g) ?? []).length;
        sendEvent(res, {
          type: "tool_result",
          tool: "fetch_page",
          result: priceRefs > 0
            ? `Fetched page, ~${priceRefs} price references found`
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
    content: "Agent reached maximum search steps.",
  });
  sendEvent(res, { type: "done", content: "Search timed out" });
}
