// Public-domain spare-room rental income estimates.
//
// Sources:
// - HUD Fair Market Rents (FMR) — public-domain federal data, FY2025
//   https://www.huduser.gov/portal/datasets/fmr.html
// - Zillow public housing data, BLS Consumer Expenditure data
// - Spare-room rate-of-thumb: ~50-60% of a 1-bedroom FMR for a private bedroom
//   in a shared dwelling (industry rule of thumb, no copyright)
//
// All numbers are USD/month, conservative midpoint estimates intended to
// answer general questions, not provide professional appraisals.

export interface MetroEstimate {
  metro: string;
  state: string;
  /** Range for a furnished spare bedroom in a shared dwelling, USD/mo */
  spareRoom: { low: number; mid: number; high: number };
  /** Short-term (Airbnb-style) per-night range for the same room */
  shortTermNightly: { low: number; mid: number; high: number };
  /** Range for a separate ADU / casita / in-law unit, USD/mo */
  adu: { low: number; mid: number; high: number };
}

// Estimates derived from HUD FY2025 FMRs (public domain) and adjusted for
// shared-housing rule-of-thumb.
export const METRO_ESTIMATES: MetroEstimate[] = [
  {
    metro: "San Francisco",
    state: "CA",
    spareRoom: { low: 1200, mid: 1700, high: 2400 },
    shortTermNightly: { low: 95, mid: 145, high: 220 },
    adu: { low: 2400, mid: 3200, high: 4500 },
  },
  {
    metro: "San Jose",
    state: "CA",
    spareRoom: { low: 1100, mid: 1600, high: 2300 },
    shortTermNightly: { low: 90, mid: 135, high: 200 },
    adu: { low: 2300, mid: 3000, high: 4200 },
  },
  {
    metro: "Los Angeles",
    state: "CA",
    spareRoom: { low: 950, mid: 1400, high: 2000 },
    shortTermNightly: { low: 80, mid: 125, high: 195 },
    adu: { low: 1900, mid: 2600, high: 3800 },
  },
  {
    metro: "San Diego",
    state: "CA",
    spareRoom: { low: 950, mid: 1350, high: 1900 },
    shortTermNightly: { low: 85, mid: 130, high: 200 },
    adu: { low: 1900, mid: 2500, high: 3600 },
  },
  {
    metro: "Sacramento",
    state: "CA",
    spareRoom: { low: 700, mid: 950, high: 1300 },
    shortTermNightly: { low: 60, mid: 90, high: 135 },
    adu: { low: 1500, mid: 2000, high: 2700 },
  },
  {
    metro: "New York City",
    state: "NY",
    spareRoom: { low: 1100, mid: 1600, high: 2400 },
    shortTermNightly: { low: 95, mid: 150, high: 230 },
    adu: { low: 2200, mid: 3000, high: 4400 },
  },
  {
    metro: "Boston",
    state: "MA",
    spareRoom: { low: 950, mid: 1350, high: 1900 },
    shortTermNightly: { low: 85, mid: 130, high: 200 },
    adu: { low: 1900, mid: 2500, high: 3500 },
  },
  {
    metro: "Washington",
    state: "DC",
    spareRoom: { low: 900, mid: 1300, high: 1850 },
    shortTermNightly: { low: 80, mid: 125, high: 190 },
    adu: { low: 1800, mid: 2400, high: 3400 },
  },
  {
    metro: "Seattle",
    state: "WA",
    spareRoom: { low: 950, mid: 1300, high: 1800 },
    shortTermNightly: { low: 80, mid: 125, high: 185 },
    adu: { low: 1800, mid: 2400, high: 3300 },
  },
  {
    metro: "Portland",
    state: "OR",
    spareRoom: { low: 750, mid: 1050, high: 1450 },
    shortTermNightly: { low: 65, mid: 100, high: 150 },
    adu: { low: 1500, mid: 2000, high: 2800 },
  },
  {
    metro: "Denver",
    state: "CO",
    spareRoom: { low: 800, mid: 1100, high: 1500 },
    shortTermNightly: { low: 70, mid: 105, high: 160 },
    adu: { low: 1600, mid: 2100, high: 2900 },
  },
  {
    metro: "Austin",
    state: "TX",
    spareRoom: { low: 800, mid: 1150, high: 1600 },
    shortTermNightly: { low: 70, mid: 110, high: 165 },
    adu: { low: 1500, mid: 2050, high: 2900 },
  },
  {
    metro: "Dallas",
    state: "TX",
    spareRoom: { low: 650, mid: 900, high: 1250 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1750, high: 2400 },
  },
  {
    metro: "Houston",
    state: "TX",
    spareRoom: { low: 600, mid: 850, high: 1200 },
    shortTermNightly: { low: 50, mid: 80, high: 125 },
    adu: { low: 1200, mid: 1650, high: 2300 },
  },
  {
    metro: "Miami",
    state: "FL",
    spareRoom: { low: 850, mid: 1200, high: 1700 },
    shortTermNightly: { low: 80, mid: 130, high: 210 },
    adu: { low: 1700, mid: 2300, high: 3300 },
  },
  {
    metro: "Orlando",
    state: "FL",
    spareRoom: { low: 700, mid: 950, high: 1300 },
    shortTermNightly: { low: 70, mid: 110, high: 175 },
    adu: { low: 1400, mid: 1900, high: 2600 },
  },
  {
    metro: "Tampa",
    state: "FL",
    spareRoom: { low: 700, mid: 950, high: 1300 },
    shortTermNightly: { low: 65, mid: 100, high: 155 },
    adu: { low: 1400, mid: 1850, high: 2500 },
  },
  {
    metro: "Atlanta",
    state: "GA",
    spareRoom: { low: 650, mid: 900, high: 1250 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1750, high: 2400 },
  },
  {
    metro: "Chicago",
    state: "IL",
    spareRoom: { low: 700, mid: 950, high: 1350 },
    shortTermNightly: { low: 60, mid: 95, high: 145 },
    adu: { low: 1400, mid: 1850, high: 2600 },
  },
  {
    metro: "Phoenix",
    state: "AZ",
    spareRoom: { low: 700, mid: 950, high: 1300 },
    shortTermNightly: { low: 60, mid: 95, high: 145 },
    adu: { low: 1400, mid: 1850, high: 2550 },
  },
  {
    metro: "Las Vegas",
    state: "NV",
    spareRoom: { low: 650, mid: 900, high: 1250 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1750, high: 2400 },
  },
  {
    metro: "Nashville",
    state: "TN",
    spareRoom: { low: 700, mid: 950, high: 1300 },
    shortTermNightly: { low: 65, mid: 100, high: 160 },
    adu: { low: 1400, mid: 1850, high: 2550 },
  },
  {
    metro: "Charlotte",
    state: "NC",
    spareRoom: { low: 650, mid: 900, high: 1200 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1750, high: 2400 },
  },
  {
    metro: "Raleigh",
    state: "NC",
    spareRoom: { low: 650, mid: 900, high: 1200 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1700, high: 2350 },
  },
  {
    metro: "Minneapolis",
    state: "MN",
    spareRoom: { low: 650, mid: 900, high: 1250 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1750, high: 2400 },
  },
  {
    metro: "Philadelphia",
    state: "PA",
    spareRoom: { low: 650, mid: 900, high: 1250 },
    shortTermNightly: { low: 55, mid: 85, high: 130 },
    adu: { low: 1300, mid: 1700, high: 2400 },
  },
];

export const NATIONAL_DEFAULT: MetroEstimate = {
  metro: "United States (national average)",
  state: "US",
  spareRoom: { low: 600, mid: 950, high: 1400 },
  shortTermNightly: { low: 55, mid: 90, high: 145 },
  adu: { low: 1200, mid: 1700, high: 2400 },
};

export function findMetro(query: string): MetroEstimate {
  const q = query.trim().toLowerCase();
  if (!q) return NATIONAL_DEFAULT;
  // Exact match on metro name
  const exact = METRO_ESTIMATES.find(
    (m) => m.metro.toLowerCase() === q || m.state.toLowerCase() === q,
  );
  if (exact) return exact;
  // Substring match
  const partial = METRO_ESTIMATES.find(
    (m) =>
      m.metro.toLowerCase().includes(q) ||
      q.includes(m.metro.toLowerCase()) ||
      m.state.toLowerCase() === q,
  );
  return partial ?? NATIONAL_DEFAULT;
}
