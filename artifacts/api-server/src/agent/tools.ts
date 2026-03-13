import * as cheerio from "cheerio";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface PageResult {
  title: string;
  url: string;
  text: string;
  links: { text: string; href: string }[];
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log(`[searchWeb] Query: "${query}"`);
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: FETCH_HEADERS });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();

    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // DuckDuckGo HTML structure uses .result as the container
    // The anchor can be .result__a or .result__title a depending on DDG version
    $(".result, .results_links").each((_i, el) => {
      // Try both selector patterns DDG uses
      let anchorEl = $(el).find(".result__a").first();
      if (!anchorEl.length) anchorEl = $(el).find(".result__title a").first();
      const snippetEl = $(el).find(".result__snippet").first();

      const title = anchorEl.text().trim();
      const rawHref = anchorEl.attr("href") ?? "";
      const snippet = snippetEl.text().trim();

      if (!title || !rawHref) return;

      // DDG redirects through //duckduckgo.com/l/?uddg=<encoded-url>
      let finalUrl = rawHref;
      if (rawHref.includes("duckduckgo.com/l/") || rawHref.startsWith("//")) {
        try {
          const fullHref = rawHref.startsWith("//") ? "https:" + rawHref : rawHref;
          const params = new URL(fullHref).searchParams;
          finalUrl = decodeURIComponent(params.get("uddg") ?? params.get("u") ?? rawHref);
        } catch {
          finalUrl = rawHref;
        }
      }

      if (
        finalUrl.startsWith("http") &&
        !finalUrl.includes("duckduckgo.com") &&
        results.length < 8
      ) {
        results.push({ title, url: finalUrl, snippet });
      }
    });

    console.log(`[searchWeb] Found ${results.length} results`);

    // If DDG returned nothing, try Bing as fallback
    if (results.length === 0) {
      return await searchBingFallback(query);
    }

    return results;
  } catch (err) {
    console.error("[searchWeb] Error:", err);
    return await searchBingFallback(query);
  }
}

async function searchBingFallback(query: string): Promise<SearchResult[]> {
  console.log(`[searchWeb] Falling back to Bing for: "${query}"`);
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&form=QBLH`;
    const resp = await fetch(url, {
      headers: {
        ...FETCH_HEADERS,
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });
    if (!resp.ok) throw new Error(`Bing HTTP ${resp.status}`);
    const html = await resp.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Bing result structure
    $("li.b_algo").each((_i, el) => {
      const anchor = $(el).find("h2 a").first();
      const snippet = $(el).find(".b_caption p").first().text().trim() ||
                      $(el).find("p").first().text().trim();
      const title = anchor.text().trim();
      const href = anchor.attr("href") ?? "";

      if (title && href.startsWith("http") && results.length < 8) {
        results.push({ title, url: href, snippet });
      }
    });

    console.log(`[searchWeb] Bing found ${results.length} results`);
    return results;
  } catch (err) {
    console.error("[searchWeb] Bing fallback error:", err);
    return [];
  }
}

export async function fetchPage(url: string): Promise<PageResult> {
  console.log(`[fetchPage] Fetching: ${url}`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, noscript, svg, iframe, [aria-hidden='true']").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();

    const links: { text: string; href: string }[] = [];
    $("a[href]").each((_i, el) => {
      const href = $(el).attr("href") ?? "";
      const text = $(el).text().trim();
      if (!text || href.startsWith("#") || href.startsWith("javascript:")) return;
      try {
        const absUrl = new URL(href, url).href;
        if (
          absUrl.startsWith("http") &&
          text.length > 2 &&
          text.length < 80 &&
          links.length < 20
        ) {
          links.push({ text, href: absUrl });
        }
      } catch {}
    });

    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const text = bodyText.slice(0, 4000);

    console.log(`[fetchPage] Got ${text.length} chars, ${links.length} links`);
    return { title, url, text, links };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[fetchPage] Error for ${url}:`, message);
    return { title: "", url, text: `Error fetching page: ${message}`, links: [] };
  }
}

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description:
        "Search the web. Use this to find car dealerships, inventory pages, and vehicle listings near a location. Returns up to 8 results with titles, URLs, and snippets.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              'The search query. Be specific, e.g. "Toyota dealerships near Austin TX inventory" or "used Ford F-150 under 30000 Austin TX dealer"',
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fetch_page",
      description:
        "Fetch and read the content of a webpage. Use this to scan a dealer's inventory page, read vehicle listings, or follow inventory links found via search.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full HTTPS URL of the page to fetch",
          },
        },
        required: ["url"],
      },
    },
  },
];
