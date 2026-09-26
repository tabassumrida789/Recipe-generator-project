# FridgeChef

FridgeChef is a responsive recipe generator and cooking companion built with Next.js, React, TypeScript, Tailwind CSS v4, Framer Motion, and Lucide icons.

## Start the app

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Next.js (usually `http://localhost:3000`). Production build and start:

```bash
npm run typecheck
npm run build
npm run start
```

## Recipe search setup

Recipe Search uses the server-side route `/api/recipes/search`. For broad recipe results from the web, copy `.env.example` to `.env.local` and add a Brave Search API key:

```dotenv
BRAVE_SEARCH_API_KEY=your_private_key
```

The key stays on the server; do not use a `NEXT_PUBLIC_` prefix. The route validates publisher HTTPS URLs and never invents recipe links. Without a Brave key it falls back to TheMealDB’s smaller public catalogue (key `1`), so some searches may return no results. Read the [Brave Web Search API docs](https://api-dashboard.search.brave.com/app/documentation/web-search) and [TheMealDB terms](https://themealdb.com/terms_of_use.php) before deploying.

## Free local recipe generation

Recipe generation works without OpenAI credits or an API key. Local generation is the default unless you explicitly set `LOCAL_DEMO_MODE=false`:

```dotenv
LOCAL_DEMO_MODE=true
```

Restart Next.js after changing environment variables. The server creates a recipe locally from the submitted ingredients, cuisine, dietary preferences and serving count, selecting a suitable recipe method (such as rice, pasta, noodles, wraps, curries, stir-fries, breakfast, salads or soups). It returns the same recipe envelope used by the current recipe detail and Cook Mode UI. Nutrition stays unavailable rather than being guessed. No paid service is used for generation.

## Local recipe catalog and seed tooling

Discover reads recipes through `/api/recipes/catalog`, which supports server-side search, cuisine/category/diet/method/time filters, ingredient ranking and pagination. The current curated starter source contains **36 recipes**. This repository does not yet contain the requested 1,000+ recipe collection; the import tooling is ready for an appropriately licensed, quality-reviewed local dataset.

To import a normalized local JSON recipe collection:

1. Copy `data/recipes.import.example.json` to `data/recipes.import.json` and replace the example record with your recipe records. `data/recipe.schema.json` documents the accepted format. Prefer structured steps with a title, detailed description, duration and relevant ingredients.
2. Validate without changing files:

   ```bash
   npm run recipes:validate
   ```

3. Seed the active local catalog:

   ```bash
   npm run recipes:seed
   ```

The seeder validates required fields and duplicate IDs/titles, sorts records deterministically and writes `data/recipes.json`. The catalog API reads the file on the server; if it is absent or invalid, the app falls back to the 36 bundled starter recipes. Recipe JSON is not imported into the client bundle. Keep the dataset's source and license/attribution alongside it before redistribution.

Discovery search and filters operate across the active catalog, and Pantry “Use these first” requests a short list ranked against soon-to-expire ingredients.

## Optional OpenAI recipe generation

To switch to live generation, set `LOCAL_DEMO_MODE=false` in `.env.local`, then add an API key in your [OpenAI API Platform project](https://platform.openai.com/api-keys):

```dotenv
LOCAL_DEMO_MODE=false
OPENAI_API_KEY=your_private_api_key
OPENAI_MODEL=gpt-5-mini
```

Restart the Next.js server after changing environment variables. The key is read only by the server route; never use a `NEXT_PUBLIC_` prefix, paste it into source code, or commit `.env.local` (it is Git-ignored). The route validates inputs and uses strict structured output. OpenAI API use may incur charges and requires a funded API account. `LOCAL_DEMO_MODE=true` takes precedence and never initializes or calls OpenAI. See the [OpenAI API quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request) and [API billing help](https://help.openai.com/en/articles/9039756).

## Authentication and private data setup

Authentication and account-owned data use Supabase Auth and Postgres row-level security. Create a Supabase project, copy `.env.example` to `.env.local`, and add:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Run `supabase/schema.sql` in the Supabase SQL Editor. It creates profiles, saved recipes, favorites and pantry items, with policies restricting each row to its signed-in owner. The publishable key is intended for browser use; security comes from Supabase Auth and RLS. Never put a service-role key in the browser. Configure Supabase Auth email confirmation and password-reset redirect URLs for your app origin and `/auth/callback`. Restart Next.js after changing `.env.local`.

Login and signup are available at `/login` and `/signup`; password reset uses `/forgot-password`. Until Supabase is configured and the schema is applied, the app remains browsable but account-only features ask the visitor to sign in and show the setup location.

## Included journeys

- Enter ingredients, quantities, units, availability, servings, cuisine and dietary preferences to generate a recipe with OpenAI without reloading.
- Review scaled ingredient quantities, substitutions, visual cooking steps, and use Cook Mode with step navigation and timers.
- Search and filter the server-paginated Discover catalog (36 curated starter recipes until a larger collection is seeded) across Indian, Asian, Italian, Mexican, Mediterranean, and American cuisines.
- Search real recipe pages by name and open the original publisher link.
- Sign up, log in, reset passwords and keep a cookie-backed Supabase session.
- Keep saved recipes, favorites and pantry inventory in Supabase with row-level security.
- Track pantry purchase/expiry dates, classify expiry risk dynamically, and get recipe suggestions for ingredients to use first.
- Generate detailed recipe steps and transparent estimated nutrition through the secured OpenAI route when configured; unknown nutrition stays unavailable rather than guessed.

Food photography loads from Unsplash and requires an internet connection. Nutrition is only displayed when an estimate can be returned from measured ingredients and is labeled as an estimate; otherwise FridgeChef says the value is unavailable.
