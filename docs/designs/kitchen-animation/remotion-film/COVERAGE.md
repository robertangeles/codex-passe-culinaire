# Feature grounding and illustrative boundaries

28 September 2026. Read-only source inspection of sibling repository `../cc-culinaire-kitchen`. No private user data or product accounts were accessed, and no product changes were made. The source paths below are relative to that repository. Code support is not proof of live deployment or end-to-end runtime behaviour.

| Requested area | What the film shows | Grounding |
| --- | --- | --- |
| Recipe Lab | Ingredients, cuisine, portions, generated recipe structure and refinement | `packages/client/src/pages/RecipeLabPage.tsx`; `components/recipes/RecipeForm.tsx` and `RecipeCard.tsx`; server `controllers/recipeController.ts` request schema |
| Patisserie Lab | Pastry components and make-ahead preparation | Same page's patisserie domain; server `services/recipeService.ts` includes bakerPercentages, makeAheadComponents and criticalTemperatures |
| Cocktail Lab | Gin/flavour brief, drink specification and batch size | Same page's spirits domain; request schema spiritBase/flavourProfile/drinkStyle; output batchSpec and variations |
| Rostering | Shifts, section coverage and team preparation message | Client `pages/RosterPage.tsx` exposes shifts, calendar, demand and coverage; community messaging described in `docs/landing-page-creative-brief.md` |
| Purchasing | Stock target, on-hand amount and purchase order | Client `pages/PurchasingPage.tsx`; product brief describes par-based purchase suggestions and purchase-order lifecycle |
| Receiving | Accepted delivery and recorded shortage | Client `components/purchasing/ReceivingChecklist.tsx` and `ReceiveQueue.tsx`; product brief |
| Inventory | Stock batches, current quantities and older-stock-first withdrawal | Client inventory components; FIFO described in product brief and `components/landing/FeatureShowcase.tsx` |
| Mise en Place | Pantry transfer and preparation tasks | Client `pages/KitchenCopilotPage.tsx`, `components/copilot/PrepDashboard.tsx`; inventory `StockMovementForm.tsx` |
| Production | Prepare, bake, finish and a chef-recorded batch yield | User explicitly supplied Production as a feature; preparation completion is present in PrepDashboard. The film's three-tart yield is illustrative, not a verified dedicated production-module UI |
| Waste Management | Recipe use, return, trim reason and cost | Client `components/waste/WasteLogger.tsx`, `WasteDashboard.tsx`; server `services/wasteService.ts` |
| Sales | File upload and comparison of forecast, prepared and sold | User explicitly described sales upload; menu/sales functionality described in product brief and Menu Intelligence |
| Menu costing | Portion cost, menu price and food-cost percentage | Client `components/menu/MenuItemFormModal.tsx` computes foodCostPct and contributionMargin; `MenuItemList.tsx` displays price/cost/FC%. No claim of automatic Recipe Lab ingredient matching |

The illustrated carrot/lentil recipe, pear tart, cocktail, shifts, notes, quantities, costs and menus are fictional examples. They are not a live AI response, customer evidence or verified recipe specifications. No claim that every lab exercise occurs afresh on every working day is intended: the story joins creative development to preparation and operations.

The user-facing film follows the requested Cocktail Lab naming; the inspected implementation uses CulinAIre Spirits at `/spirits`. No pricing, free-trial, market-leading, savings or deployment claims were copied from the product brief.
