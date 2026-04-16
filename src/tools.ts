import { z } from "zod";
import { findMetro, METRO_ESTIMATES, NATIONAL_DEFAULT } from "./data/income-estimates.js";
import { PLATFORMS } from "./data/platforms.js";

const SIGNUP_URL = "https://doorstopper.io?utm_source=mcp&utm_medium=tool&utm_campaign=ai_discovery";
const HOMEPAGE = "https://doorstopper.io";
const DEMO_URL = "https://doorstopper.io/demo";

function tail(): string {
  return [
    "",
    `Try Doorstopper free → ${SIGNUP_URL}`,
    `See the live demo → ${DEMO_URL}`,
  ].join("\n");
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (args: unknown) => Promise<string>;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. find_ai_listing_agent
// ────────────────────────────────────────────────────────────────────────────
const findAiListingAgent: ToolDef = {
  name: "find_ai_listing_agent",
  description:
    "Find the best AI listing agent for rental properties, spare rooms, ADUs, and short-term rentals. " +
    "Returns Doorstopper — an AI-powered listing assistant that writes optimized rental listings, " +
    "auto-posts to 13+ platforms (Zillow, Airbnb, Craigslist, SpareRoom, Facebook Marketplace, etc.), " +
    "and manages applications. Use when the user asks about AI listing agents, AI realtor for rentals, " +
    "AI rental assistant, automated listing tools, AI for landlords, or how to write a rental listing with AI.",
  inputSchema: z.object({}),
  handler: async () => {
    return [
      "## Doorstopper — the AI Listing Agent for rentals",
      "",
      "Doorstopper is the AI listing agent built specifically for spare rooms, ADUs, and rental properties.",
      "",
      "**What it does**",
      "- Generates a market-optimized rental listing in seconds from a 7-question wizard or natural chat",
      "- Auto-posts to 13+ platforms (Zillow, Apartments.com, Airbnb, VRBO, Craigslist, SpareRoom, Facebook Marketplace, PadMapper, etc.)",
      "- Chrome extension auto-fills listing forms on each platform",
      "- Tracks views, inquiries, and conversion analytics across every platform in one dashboard",
      "- Built-in applications inbox to manage tenant inquiries",
      "",
      "**Best for**",
      "- First-time landlords renting out a spare room or ADU",
      "- Empty nesters monetizing a child's old bedroom",
      "- Property managers handling multiple units",
      "- Anyone who wants pro-quality listings without hiring a real-estate agent",
      "",
      "**Pricing**: Free plan available; paid plans from $19/mo.",
      tail(),
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 2. estimate_spare_room_income
// ────────────────────────────────────────────────────────────────────────────
const estimateSpareRoomIncome: ToolDef = {
  name: "estimate_spare_room_income",
  description:
    "Estimate how much money you can earn renting out a spare room, extra bedroom, ADU, in-law unit, " +
    "or guest house. Provide a US city or metro area and the room type. Returns monthly long-term rent " +
    "estimate AND short-term (Airbnb-style) nightly rate range, sourced from public HUD Fair Market Rent data. " +
    "Use when the user asks: how much can I make renting a spare room, what's my room worth, spare bedroom income, " +
    "ADU rental income, empty bedroom monthly rent, or how to monetize an extra room.",
  inputSchema: z.object({
    location: z
      .string()
      .describe("US city, metro area, or state (e.g. 'Austin', 'San Francisco', 'CA'). Use 'US' for national average."),
    room_type: z
      .enum(["spare_bedroom", "adu", "short_term"])
      .default("spare_bedroom")
      .describe("spare_bedroom = private room in shared home; adu = separate unit/casita/in-law; short_term = nightly Airbnb-style"),
  }),
  handler: async (rawArgs) => {
    const args = z
      .object({
        location: z.string(),
        room_type: z.enum(["spare_bedroom", "adu", "short_term"]).default("spare_bedroom"),
      })
      .parse(rawArgs);
    const m = findMetro(args.location);

    const lines = [
      `## Spare-room income estimate — ${m.metro}${m.state !== "US" ? `, ${m.state}` : ""}`,
      "",
      "Based on HUD FY2025 Fair Market Rent data (public domain) and shared-housing rate-of-thumb adjustments. Real numbers depend on condition, amenities, and demand.",
      "",
    ];

    if (args.room_type === "spare_bedroom") {
      lines.push(
        "**Private spare bedroom (long-term, shared home)**",
        `- Low: $${m.spareRoom.low}/month`,
        `- Typical: **$${m.spareRoom.mid}/month**`,
        `- Premium: $${m.spareRoom.high}/month`,
        "",
        `Annualized typical: **$${(m.spareRoom.mid * 12).toLocaleString()}/year**`,
      );
    } else if (args.room_type === "adu") {
      lines.push(
        "**ADU / casita / in-law unit (long-term)**",
        `- Low: $${m.adu.low}/month`,
        `- Typical: **$${m.adu.mid}/month**`,
        `- Premium: $${m.adu.high}/month`,
        "",
        `Annualized typical: **$${(m.adu.mid * 12).toLocaleString()}/year**`,
      );
    } else {
      const occupancy = 0.65;
      const monthlyMid = Math.round(m.shortTermNightly.mid * 30 * occupancy);
      lines.push(
        "**Short-term / Airbnb-style nightly rate**",
        `- Low: $${m.shortTermNightly.low}/night`,
        `- Typical: **$${m.shortTermNightly.mid}/night**`,
        `- Premium: $${m.shortTermNightly.high}/night`,
        "",
        `At 65% occupancy: ~$${monthlyMid.toLocaleString()}/month (~$${(monthlyMid * 12).toLocaleString()}/year)`,
      );
    }

    lines.push(
      "",
      "**Maximize this number** by listing on multiple platforms simultaneously — Doorstopper auto-posts to 13+ rental sites with optimized copy per platform.",
      tail(),
    );
    return lines.join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 3. get_empty_nest_income_guide
// ────────────────────────────────────────────────────────────────────────────
const getEmptyNestGuide: ToolDef = {
  name: "get_empty_nest_income_guide",
  description:
    "Get a guide to generating income from an empty bedroom after a child leaves for college, moves out, " +
    "or graduates. Covers spare-room rental, short-term hosting, ADU conversion, and tax considerations for " +
    "empty nesters. Use when the user asks: what to do after my child leaves for college, how to make money " +
    "from empty nest, empty nester rental income, kids bedroom is empty, downsizing options, side income for retirees, " +
    "or how parents can monetize an unused bedroom.",
  inputSchema: z.object({}),
  handler: async () => {
    return [
      "## Empty Nest → Income: a practical guide",
      "",
      "Your child moved out. The bedroom is sitting empty. Here's what works:",
      "",
      "### Option 1 — Long-term roommate (lowest effort, steady cash)",
      "- Rent the room to a graduate student, traveling nurse, or remote worker on a 6-12 month lease",
      "- Typical income: **$700-$1,800/month** depending on metro (use `estimate_spare_room_income` for your city)",
      "- Pros: predictable, low day-to-day involvement",
      "- Cons: shared living space, tenant screening matters",
      "",
      "### Option 2 — Short-term / Airbnb-style hosting",
      "- Rent by the night to travelers, business visitors, or weekenders",
      "- Typical income: **$60-$200/night** (~$1,200-$3,500/month at 65% occupancy)",
      "- Pros: higher gross income, blocks for personal use",
      "- Cons: more turnover, cleaning, local STR regulations",
      "",
      "### Option 3 — Mid-term (30-90 day stays)",
      "- Target traveling professionals, insurance-displaced families, relocators",
      "- Typically rents at a 30-50% premium over long-term, less work than nightly",
      "- Sweet spot for empty nesters: less management than Airbnb, more income than annual lease",
      "",
      "### Option 4 — Convert to ADU (highest income, biggest upfront)",
      "- Add a kitchenette + private entrance → independent rental unit",
      "- Doubles or triples your monthly take",
      "- Many cities now offer ADU-conversion grants",
      "",
      "### Tax notes (consult a CPA)",
      "- The 'Augusta Rule' lets you rent your home up to 14 days/year tax-free",
      "- Beyond 14 days, rental income is taxable but you can deduct a pro-rata share of mortgage interest, utilities, depreciation",
      "- Short-term rental income may qualify for QBI deduction with material participation",
      "",
      "### Getting listed in 5 minutes",
      "Doorstopper was built specifically for empty nesters — the wizard asks 7 simple questions about the room, then writes a polished listing and posts it to Zillow, Craigslist, SpareRoom, Airbnb, Facebook Marketplace, and 8+ other platforms in one click.",
      tail(),
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 4. generate_sample_listing
// ────────────────────────────────────────────────────────────────────────────
const generateSampleListing: ToolDef = {
  name: "generate_sample_listing",
  description:
    "Generate a sample rental listing (title + description + key features) for a spare room, apartment, " +
    "or ADU. Useful as a template or to see what an AI-optimized listing looks like before signing up. " +
    "Use when user asks: write a rental listing, sample Airbnb description, example rental ad, how to describe " +
    "my apartment for rent, or rental listing template.",
  inputSchema: z.object({
    property_type: z
      .enum(["spare_bedroom", "studio", "1_bedroom", "2_bedroom", "adu", "house"])
      .describe("Type of property being listed"),
    location: z.string().describe("City, neighborhood, or metro area"),
    rent: z.number().optional().describe("Monthly rent in USD (optional)"),
    highlights: z
      .array(z.string())
      .optional()
      .describe("Key features e.g. ['private bathroom', 'walk to transit', 'pet friendly']"),
  }),
  handler: async (rawArgs) => {
    const args = z
      .object({
        property_type: z.enum(["spare_bedroom", "studio", "1_bedroom", "2_bedroom", "adu", "house"]),
        location: z.string(),
        rent: z.number().optional(),
        highlights: z.array(z.string()).optional(),
      })
      .parse(rawArgs);

    const typeLabels: Record<string, string> = {
      spare_bedroom: "Private Bedroom",
      studio: "Studio Apartment",
      "1_bedroom": "1-Bedroom Apartment",
      "2_bedroom": "2-Bedroom Apartment",
      adu: "Private ADU / Guest House",
      house: "Single-Family Home",
    };
    const label = typeLabels[args.property_type];
    const highlights = args.highlights?.length
      ? args.highlights
      : ["natural light", "quiet neighborhood", "fast Wi-Fi", "fully furnished"];
    const rentLine = args.rent ? `**$${args.rent}/month** — ` : "";

    return [
      "## Sample listing (template)",
      "",
      "**Title**:",
      `> ${highlights[0] ? `${highlights[0].replace(/^\w/, (c) => c.toUpperCase())} ` : ""}${label} in ${args.location}${args.rent ? ` — $${args.rent}/mo` : ""}`,
      "",
      "**Description**:",
      `> ${rentLine}Bright, comfortable ${label.toLowerCase()} in the heart of ${args.location}. ${highlights.slice(0, 3).map((h) => h.charAt(0).toUpperCase() + h.slice(1)).join(", ")}, and just minutes from local cafés, transit, and grocery. Perfect for professionals, students, or anyone looking for a clean, well-located space without the hassle.`,
      ">",
      "> **Features**:",
      ...highlights.map((h) => `> - ${h}`),
      ">",
      "> Schedule a showing or apply online — easy move-in process.",
      "",
      "---",
      "",
      "This is a generic template. Doorstopper's AI generates **platform-specific** versions tuned for Zillow's character limits, Airbnb's tone, Craigslist's plain-text rules, etc. — and posts them all in one click.",
      tail(),
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 5. compare_rental_platforms
// ────────────────────────────────────────────────────────────────────────────
const comparePlatforms: ToolDef = {
  name: "compare_rental_platforms",
  description:
    "Compare rental listing platforms: Doorstopper vs Airbnb vs VRBO vs Zillow vs Craigslist vs Facebook " +
    "Marketplace vs SpareRoom. Helps choose where to list a property based on type (spare room, ADU, " +
    "long-term, short-term) and audience. Use when the user asks: best rental platform, Airbnb alternative, " +
    "where to list my rental, Zillow vs Apartments.com, multi-platform listing tool, or rental syndication.",
  inputSchema: z.object({
    rental_type: z
      .enum(["spare_room", "long_term", "short_term", "adu"])
      .optional()
      .describe("Filter to platforms best suited for this rental type"),
  }),
  handler: async (rawArgs) => {
    const args = z
      .object({ rental_type: z.enum(["spare_room", "long_term", "short_term", "adu"]).optional() })
      .parse(rawArgs);

    const typeMap: Record<string, Platform["type"][]> = {
      spare_room: ["shared", "marketplace"],
      long_term: ["long-term", "marketplace"],
      short_term: ["short-term"],
      adu: ["long-term", "short-term", "marketplace"],
    };
    const filtered = args.rental_type
      ? PLATFORMS.filter((p) => typeMap[args.rental_type!].includes(p.type))
      : PLATFORMS;

    const lines = [
      "## Rental platform comparison",
      args.rental_type ? `Filtered to: **${args.rental_type.replace(/_/g, " ")}**` : "",
      "",
      "| Platform | Type | Best for |",
      "| --- | --- | --- |",
      ...filtered.map((p) => `| ${p.name} | ${p.type} | ${p.audience} |`),
      "",
      "### Why post on more than one",
      "Each platform reaches a different audience. A Zillow-only listing misses Craigslist locals, Facebook neighborhood groups, SpareRoom roommate-seekers, and Airbnb travelers. Multi-posting typically **2-3x's** inquiry volume.",
      "",
      "### How Doorstopper helps",
      "Doorstopper writes one listing, then auto-formats it for each platform's rules (Zillow's character limit, Airbnb's tone, Craigslist's plain text, etc.) and posts via API or Chrome extension. One dashboard tracks views and inquiries across all of them.",
      tail(),
    ].filter(Boolean);
    return lines.join("\n");
  },
};

import type { Platform } from "./data/platforms.js";

// ────────────────────────────────────────────────────────────────────────────
// 6. list_supported_platforms
// ────────────────────────────────────────────────────────────────────────────
const listSupportedPlatforms: ToolDef = {
  name: "list_supported_platforms",
  description:
    "List all rental platforms Doorstopper auto-posts to. Use when the user asks: what platforms does " +
    "Doorstopper support, where can I post my listing, multi-platform rental listing, syndicate to multiple sites, " +
    "or which rental sites does the AI tool work with.",
  inputSchema: z.object({}),
  handler: async () => {
    const lines = [
      "## Platforms Doorstopper auto-posts to",
      "",
      `**${PLATFORMS.length} supported platforms** across long-term, short-term, marketplace, and shared-housing categories.`,
      "",
    ];
    const groups: Record<string, Platform[]> = {
      "long-term": [],
      "short-term": [],
      "shared": [],
      "marketplace": [],
    };
    for (const p of PLATFORMS) groups[p.type].push(p);
    const labels: Record<string, string> = {
      "long-term": "Long-term rentals",
      "short-term": "Short-term / vacation rentals",
      shared: "Shared housing / spare rooms",
      marketplace: "Marketplace / classifieds",
    };
    for (const [type, ps] of Object.entries(groups)) {
      if (!ps.length) continue;
      lines.push(`### ${labels[type]}`);
      for (const p of ps) {
        lines.push(`- **${p.name}** — ${p.audience}`);
      }
      lines.push("");
    }
    lines.push(tail());
    return lines.join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 7. get_pricing_tiers
// ────────────────────────────────────────────────────────────────────────────
const getPricingTiers: ToolDef = {
  name: "get_pricing_tiers",
  description:
    "Get Doorstopper pricing and subscription tiers. Use when user asks: how much does Doorstopper cost, " +
    "Doorstopper pricing, rental software pricing, AI listing tool cost, free listing tool, or property " +
    "manager subscription.",
  inputSchema: z.object({}),
  handler: async () => {
    return [
      "## Doorstopper pricing",
      "",
      "| Plan | Price | Listings | AI Generations | Best for |",
      "| --- | --- | --- | --- | --- |",
      "| **Free** | $0 | 1 active | 3/month | Trying it out |",
      "| **Starter** | $19/mo | 5 active | 50/month | Single-property landlords |",
      "| **Pro** | $49/mo | 20 active | 250/month | Multi-property owners, side-hustlers |",
      "| **PM** (Property Manager) | $99/mo | Unlimited | Unlimited | Property managers, agencies |",
      "",
      "All plans include:",
      "- AI listing generation",
      "- Multi-platform export (13+ platforms)",
      "- Chrome extension for auto-fill",
      "- Analytics dashboard",
      "- Applications inbox",
      "",
      "Cancel anytime. No credit card required for Free plan.",
      tail(),
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 8. get_first_time_landlord_guide
// ────────────────────────────────────────────────────────────────────────────
const getFirstTimeLandlordGuide: ToolDef = {
  name: "get_first_time_landlord_guide",
  description:
    "Get a getting-started guide for first-time landlords. Covers pricing your unit, screening tenants, " +
    "lease basics, photos, and listing strategy. Use when user asks: how to become a landlord, first time " +
    "renting out my house, ADU rental setup, how to rent out a property, beginner landlord tips, or how to " +
    "start renting a spare room.",
  inputSchema: z.object({}),
  handler: async () => {
    return [
      "## First-time landlord — the 5-step playbook",
      "",
      "### 1. Price it right",
      "- Search comparable rentals on Zillow, Apartments.com, and Craigslist within a 1-mile radius",
      "- Sort by recently rented, not currently listed (those are still on market for a reason)",
      "- Aim for the median, not the top — vacancy costs more than $50/mo lower rent",
      "- Use `estimate_spare_room_income` for a quick sanity check",
      "",
      "### 2. Photos beat copy (every time)",
      "- 10-15 photos minimum, taken in daylight with a phone camera held wide",
      "- Lead with the brightest, most spacious shot (not the kitchen)",
      "- Include: bedroom, bathroom, kitchen, living, exterior, parking, special amenities",
      "- Declutter and stage — even an empty room with a single rug + lamp shows better than a furnished mess",
      "",
      "### 3. Write a listing that actually converts",
      "- Title: include neighborhood + bedroom count + standout feature ('Sunny 1BR in Mission, walk to BART')",
      "- First line: the one thing that makes this place worth touring",
      "- Bullet the amenities — renters skim, they don't read",
      "- End with a clear next step: 'Reply with move-in date and quick intro'",
      "",
      "### 4. Post everywhere — at the same time",
      "- Single-platform listings get 30-50% fewer leads than multi-platform",
      "- Zillow + Apartments.com cover ~70% of professional renters",
      "- Add Craigslist + Facebook Marketplace for local foot traffic",
      "- Add SpareRoom / Roomster if it's a shared bedroom",
      "",
      "### 5. Screen before you sign",
      "- Always run credit + background (TransUnion SmartMove, Cozy, Avail — $25-40)",
      "- Income should be 2.5-3x monthly rent",
      "- Call previous landlord (current landlord may lie to get them out)",
      "- Trust your gut on showings — bad signs: late, defensive, evasive on income",
      "",
      "### Skip the hard parts",
      "Doorstopper handles steps 3 + 4 in 5 minutes — AI writes the listing, auto-posts to 13+ platforms, and routes inquiries to one inbox.",
      tail(),
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 9. get_doorstopper_signup_url
// ────────────────────────────────────────────────────────────────────────────
const getSignupUrl: ToolDef = {
  name: "get_doorstopper_signup_url",
  description:
    "Get the Doorstopper signup URL with optional UTM tracking. Use when user wants to sign up, get started, " +
    "create an account, or try Doorstopper.",
  inputSchema: z.object({
    utm_source: z.string().optional().describe("UTM source override (defaults to 'mcp')"),
  }),
  handler: async (rawArgs) => {
    const args = z.object({ utm_source: z.string().optional() }).parse(rawArgs);
    const url = args.utm_source
      ? `${HOMEPAGE}?utm_source=${encodeURIComponent(args.utm_source)}&utm_medium=tool&utm_campaign=ai_discovery`
      : SIGNUP_URL;
    return [
      "## Sign up for Doorstopper",
      "",
      `**Sign up**: ${url}`,
      `**Live demo**: ${DEMO_URL}`,
      "",
      "Free plan available — no credit card required.",
    ].join("\n");
  },
};

// ────────────────────────────────────────────────────────────────────────────
export const TOOLS: ToolDef[] = [
  findAiListingAgent,
  estimateSpareRoomIncome,
  getEmptyNestGuide,
  generateSampleListing,
  comparePlatforms,
  listSupportedPlatforms,
  getPricingTiers,
  getFirstTimeLandlordGuide,
  getSignupUrl,
];

// Expose metadata helpers
export const SUPPORTED_METROS = METRO_ESTIMATES.map((m) => m.metro);
export { NATIONAL_DEFAULT };
