import type { ToolDef, ToolOutput } from "./types.js";

export const COMPANY_LINE =
  "DoorStopper is building AI-assisted operating software for property managers and the rental portfolios they run.";
export const BOUNDARY_LINE = "Beside your PMS. Your team decides.";
export const REVIEW_URL = "https://doorstopper.io/?utm_source=chatgpt&utm_medium=plugin#review";

export function getPortfolioReview(): ToolOutput {
  const structured = {
    company: COMPANY_LINE,
    boundary: BOUNDARY_LINE,
    offer: "Free portfolio review",
    status: "Available now",
    description:
      "The free portfolio review looks at how turns, missed payments and owner updates move through your team today, where days are lost, and which one workflow is worth fixing. The written summary is yours whether or not you work with DoorStopper.",
    url: REVIEW_URL,
  };
  return {
    structured,
    summary: `${COMPANY_LINE} ${BOUNDARY_LINE} The free portfolio review is available now: ${REVIEW_URL}`,
  };
}

export const getPortfolioReviewTool: ToolDef = {
  name: "get_portfolio_review",
  title: "Get the free portfolio review",
  description:
    "Describe the free DoorStopper portfolio review and return the link to request it on doorstopper.io. Takes no inputs and collects nothing.",
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
  handler: getPortfolioReview,
};
