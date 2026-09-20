# 🐀 Squeekden Boston — HackMIT

**A LinkedIn-inspired professional network for Boston rats**, with fictional professional profiles and real *Boston 311 Rodent Activity service request* records when the city's API is reachable.

## Run in VS Code
`npm run dev`

## What's Boston-specific
- Fictional rats work in Allston, Back Bay, Beacon Hill, Dorchester, East Boston, Jamaica Plain, Roxbury and South Boston.
- **Official Boston Open311 API** (`https://311.boston.gov/open311/v2/requests.json`) queried by the server route `app/api/rat-stats/route.ts`; `q=Rodent Activity`, rolling 90-day date window, up to eight 300-record pages.
- Data is filtered to requests whose `service_name` contains `Rodent Activity`, so broad text search does not accidentally include unrelated issue types.
- Geocoded records appear as GPS-based points on a **schematic Boston backdrop**. Up to 450 dots are displayed. Clicking a dot filters fictional professionals in the associated area.
- The eight areas are **selected neighborhood groups, NOT all Boston neighborhoods**. Reports with non-matching neighborhoods or missing locations are excluded from group counts; if the street address has no neighborhood name, the app approximates a group from nearby selected neighborhood centers within 1.25 miles. This is not authoritative GIS boundary analysis.
- Boston Open311 limits the queried date period to 90 days. The app caps fetched results at 2,400, warns when a query may be truncated, and uses an hourly Next.js server cache. Live totals are **sampled/grouped report counts**, never a complete citywide infestation estimate.
- The three-month chart is a simple heuristic (recent average), **not trained ML**. Its ±25% demonstration range is not a calibrated interval. An incomplete last month can bias the forecast.

## Data source
- City of Boston Open311: https://311.boston.gov/open311
- Boston Open311 docs (limits, pagination, dates): https://311.boston.gov/open311/docs
- Boston 311 historical data catalog: https://data.boston.gov/dataset/311-service-requests
