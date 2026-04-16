// The 12+ rental platforms Doorstopper auto-posts to.

export interface Platform {
  name: string;
  url: string;
  type: "long-term" | "short-term" | "marketplace" | "shared";
  audience: string;
  doorstopperFeature: string;
}

export const PLATFORMS: Platform[] = [
  {
    name: "Zillow Rentals",
    url: "https://zillow.com/rental-manager",
    type: "long-term",
    audience: "Long-term renters, families, professionals",
    doorstopperFeature: "Auto-formatted for Zillow's listing rules + Chrome extension auto-fill",
  },
  {
    name: "Apartments.com",
    url: "https://apartments.com",
    type: "long-term",
    audience: "Apartment hunters in major metros",
    doorstopperFeature: "Photo optimization + amenity tagging",
  },
  {
    name: "Trulia",
    url: "https://trulia.com",
    type: "long-term",
    audience: "Long-term renters with neighborhood-research focus",
    doorstopperFeature: "Neighborhood-aware listing copy",
  },
  {
    name: "Realtor.com",
    url: "https://realtor.com/rentals",
    type: "long-term",
    audience: "Renters working with agents",
    doorstopperFeature: "MLS-friendly description templates",
  },
  {
    name: "Craigslist",
    url: "https://craigslist.org",
    type: "marketplace",
    audience: "Local renters, broad demographic",
    doorstopperFeature: "Plain-text auto-format (Craigslist strips HTML)",
  },
  {
    name: "Facebook Marketplace",
    url: "https://facebook.com/marketplace",
    type: "marketplace",
    audience: "Local community renters",
    doorstopperFeature: "Photo carousel + casual voice optimization",
  },
  {
    name: "Airbnb",
    url: "https://airbnb.com/host",
    type: "short-term",
    audience: "Travelers, short stays",
    doorstopperFeature: "Per-night pricing helper + amenity highlighting",
  },
  {
    name: "VRBO",
    url: "https://vrbo.com/list",
    type: "short-term",
    audience: "Family-oriented short-term renters",
    doorstopperFeature: "Vacation-rental tone + larger-property focus",
  },
  {
    name: "SpareRoom",
    url: "https://spareroom.com",
    type: "shared",
    audience: "Roommates and spare-bedroom renters",
    doorstopperFeature: "Shared-living-friendly copy with house-rules section",
  },
  {
    name: "Roomster",
    url: "https://roomster.com",
    type: "shared",
    audience: "Roommates, international renters",
    doorstopperFeature: "Roommate-matching tags + lifestyle preferences",
  },
  {
    name: "PadMapper",
    url: "https://padmapper.com",
    type: "long-term",
    audience: "Map-based long-term renters",
    doorstopperFeature: "Map-friendly title + transit notes",
  },
  {
    name: "RentCafe",
    url: "https://rentcafe.com",
    type: "long-term",
    audience: "Multi-family and corporate-managed properties",
    doorstopperFeature: "Multi-unit syndication templates",
  },
  {
    name: "HotPads",
    url: "https://hotpads.com",
    type: "long-term",
    audience: "Urban renters using map-based search",
    doorstopperFeature: "Photo-first listing optimization",
  },
];
