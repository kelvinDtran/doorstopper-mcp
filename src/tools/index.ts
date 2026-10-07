import { draftOwnerUpdateTool } from "./draft-owner-update.js";
import { estimateTurnoverCostTool } from "./estimate-turnover-cost.js";
import { getPortfolioReviewTool } from "./get-portfolio-review.js";
import { planTenantTransitionTool } from "./plan-tenant-transition.js";
import type { ToolDef } from "./types.js";

export const tools: ToolDef[] = [
  estimateTurnoverCostTool,
  planTenantTransitionTool,
  draftOwnerUpdateTool,
  getPortfolioReviewTool,
];
