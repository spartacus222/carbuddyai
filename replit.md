# CarBuddy Direct

An AI-powered conversational car-buying assistant. Users chat naturally about car needs, get personalized recommendations from live inventory, analyze market pricing, and save vehicles to a personal shortlist.

## Architecture

**Monorepo** — pnpm workspace with path-based proxy routing:
- `/` → CarBuddy React/Vite frontend (`artifacts/carbuddy`)
- `/api` → Express API server (`artifacts/api-server`)

### Packages
- `artifacts/carbuddy` — React + Vite frontend, dark mode glassmorphism UI
- `artifacts/api-server` — Express REST API with SSE streaming
- `lib/api-spec` — OpenAPI spec + codegen (orval → React Query hooks + Zod schemas)
- `lib/api-client-react` — Generated React Query hooks
- `lib/api-zod` — Generated Zod validation schemas
- `lib/db` — Drizzle ORM schema + db client
- `lib/integrations-openai-ai-server` — OpenAI AI Integration client
- `scripts` — Utility scripts (seed data)

## Key Features
- **AI Chat** — Streaming SSE responses from GPT-5.2 via Replit AI Integrations
- **Vehicle Inventory** — 12 seeded vehicles (SUVs, trucks, EVs, sedans) with market pricing
- **Shortlist** — Save and manage favorite vehicles
- **Conversation History** — Persistent chat sessions with auto-generated titles
- **Vehicle Cards** — AI responses containing JSON vehicle blocks render as interactive cards
- **Dealer Scout Agent** — Autonomous tool-using AI agent that searches the web for nearby dealerships and scans their inventory pages
- **Dealer Database** — Persistent dealer records with address, phone, website, star ratings, user reviews, brand list, and last-scanned timestamp. Dealers discovered by the Scout Agent are automatically saved/upserted.

## Database (PostgreSQL via Drizzle ORM)
Tables: `vehicles`, `conversations`, `messages`, `shortlist`, `dealers`, `dealer_reviews`
Run migrations: `pnpm --filter @workspace/db run push`
Seed data: `pnpm --filter @workspace/scripts run seed`

## AI Integration
- Provider: Replit AI Integrations (OpenAI)
- Model: `gpt-5.2`
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
- Use `max_completion_tokens` (NOT `max_tokens`)

## Dealer Scout Agent
- Backend: `artifacts/api-server/src/agent/` — OpenAI function-calling agent loop
- Tools: `search_web` (DuckDuckGo HTML scraping + cheerio) and `fetch_page` (headless page fetch + cheerio HTML extraction)
- Streams SSE events: `thinking`, `tool_call`, `tool_result`, `finding`, `summary`, `saved`, `done`, `error`
- After finishing, automatically upserts all discovered dealers into the `dealers` DB table
- Frontend: `DealerAgentPanel.tsx` component with live activity log, expandable dealer cards, inline vehicle inventory
- Triggered via: Globe icon button in chat header OR "Find dealers near me" quick chip
- Max 12 tool-call iterations per run, 8s per page fetch timeout

## API Endpoints
- `GET /api/healthz` — Health check
- `GET/POST /api/openai/conversations` — List/create conversations
- `GET/DELETE /api/openai/conversations/:id` — Get/delete conversation with messages
- `GET /api/openai/conversations/:id/messages` — List messages
- `POST /api/openai/conversations/:id/messages` — Send message (SSE stream)
- `GET /api/vehicles` — Search vehicles (query: type, maxPrice, maxMileage, query)
- `GET /api/vehicles/:id` — Get vehicle details
- `GET /api/shortlist` — List shortlisted vehicles
- `POST /api/shortlist` — Add vehicle to shortlist
- `DELETE /api/shortlist/:vehicleId` — Remove from shortlist
- `GET /api/dealers` — List/search dealers (query: q, city, state, brand)
- `GET /api/dealers/:id` — Get dealer with reviews
- `POST /api/dealers` — Create or upsert dealer (by website URL)
- `PATCH /api/dealers/:id` — Update dealer fields
- `DELETE /api/dealers/:id` — Delete dealer
- `GET /api/dealers/:id/reviews` — List reviews for a dealer
- `POST /api/dealers/:id/reviews` — Add a review (auto-updates dealer avg rating)

## SSE Streaming Format
```
data: {"content": "token text"}
data: {"done": true}
```
Frontend uses `fetch` + `ReadableStream` (NOT React Query) for the streaming endpoint.

## Design Style
Dark mode premium — deep navy backgrounds (#080b14, #0d1120), indigo/blue accents (#2563eb, #4f46e5), glassmorphism panels, Inter font.
