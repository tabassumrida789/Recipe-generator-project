import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { discoverRecipes, type Recipe } from '../../../recipe-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE_DEFAULT = 24;
const PAGE_SIZE_MAX = 30;
const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

async function loadCatalog(): Promise<Recipe[]> {
  try {
    const source = await readFile(join(process.cwd(), 'data', 'recipes.json'), 'utf8');
    const parsed: unknown = JSON.parse(source);
    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.title === 'string' && Array.isArray(item.ingredients) && Array.isArray(item.steps))) {
      return parsed as Recipe[];
    }
    if (process.env.NODE_ENV === 'development') console.warn('Recipe seed file is invalid; using bundled starter catalog.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && process.env.NODE_ENV === 'development') console.warn('Recipe seed file could not be read; using bundled starter catalog.');
  }
  return discoverRecipes;
}

function recipeSlug(recipe: Recipe) {
  return recipe.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function methodText(recipe: Recipe) {
  return normalize(`${recipe.category} ${recipe.steps.join(' ')} ${recipe.preparationSteps?.map(step => step.title).join(' ') || ''}`);
}

function hasTag(recipe: Recipe, expression: RegExp) {
  return recipe.tags.some(tag => expression.test(tag));
}

function toCatalogEntry(recipe: Recipe) {
  return {
    ...recipe,
    slug: recipeSlug(recipe),
    region: recipe.cuisine,
    prepTime: recipe.prepMinutes ?? Math.max(0, Math.round(recipe.minutes * 0.25)),
    cookTime: recipe.cookMinutes ?? Math.max(0, recipe.minutes - Math.round(recipe.minutes * 0.25)),
    totalTime: recipe.minutes,
    dietaryTags: recipe.tags.filter(tag => /vegetarian|vegan|gluten.?free|dairy.?free|eggless|high protein/i.test(tag)),
    allergens: recipe.allergens ?? [],
    cookingMethods: [recipe.category],
    equipment: [] as string[],
    substitutions: recipe.ingredientDetails?.flatMap(item => item.substitution ? [{ ingredient: item.name, substitute: item.substitution }] : []) ?? [],
    searchTerms: [...recipe.ingredients, recipe.cuisine, recipe.category, recipe.mealType || ''].filter(Boolean),
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26',
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Math.min(10_000, Number.parseInt(params.get('page') || '1', 10) || 1));
    const pageSize = Math.max(1, Math.min(PAGE_SIZE_MAX, Number.parseInt(params.get('pageSize') || String(PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT));
    const query = normalize(params.get('search') || '');
    const filter = params.get('filter') || 'All';
    const cuisine = normalize(params.get('cuisine') || '');
    const mealType = normalize(params.get('mealType') || '');
    const diet = normalize(params.get('diet') || '');
    const difficulty = normalize(params.get('difficulty') || '');
    const method = normalize(params.get('method') || '');
    const maxMinutes = Number.parseInt(params.get('maxMinutes') || '', 10);
    const wantedIngredients = (params.get('ingredients') || '').split(',').map(normalize).filter(Boolean).slice(0, 30);

    const catalog = await loadCatalog();
    const filtered = catalog.map(toCatalogEntry).map(recipe => {
      const searchCorpus = normalize([
        recipe.title, recipe.description, recipe.cuisine, recipe.region, recipe.mealType, recipe.category,
        recipe.difficulty, ...recipe.tags, ...recipe.ingredients, ...recipe.searchTerms, ...recipe.steps,
      ].join(' '));
      const queryMatch = !query || query.split(' ').every(term => searchCorpus.includes(term));
      const methodCorpus = methodText(recipe);
      const filterMatch = filter === 'All'
        || (filter === 'Quick' && recipe.minutes <= 30)
        || (filter === 'Vegetarian' && hasTag(recipe, /vegetarian|vegan/i))
        || (filter === 'High protein' && hasTag(recipe, /high protein/i))
        || (filter === 'One pan' && hasTag(recipe, /one pan/i))
        || (filter === 'Asian' && /asian|thai|korean|chinese/i.test(recipe.cuisine))
        || normalize(recipe.cuisine) === normalize(filter)
        || normalize(recipe.category) === normalize(filter)
        || normalize(recipe.mealType || '') === normalize(filter);
      const cuisineMatch = !cuisine || normalize(recipe.cuisine) === cuisine || normalize(recipe.region) === cuisine;
      const mealMatch = !mealType || normalize(recipe.mealType || '').includes(mealType);
      const dietMatch = !diet || recipe.dietaryTags.some(tag => normalize(tag).includes(diet)) || recipe.tags.some(tag => normalize(tag).includes(diet));
      const difficultyMatch = !difficulty || normalize(recipe.difficulty) === difficulty;
      const methodMatch = !method || methodCorpus.includes(method);
      const timeMatch = !Number.isFinite(maxMinutes) || recipe.minutes <= maxMinutes;
      const normalizedIngredients = recipe.ingredients.map(normalize);
      const matchedIngredients = wantedIngredients.filter(ingredient => normalizedIngredients.some(item => item === ingredient || item.includes(ingredient) || ingredient.includes(item)));
      const ingredientScore = wantedIngredients.length ? matchedIngredients.length / wantedIngredients.length : 0;
      return { recipe, queryMatch, filterMatch, cuisineMatch, mealMatch, dietMatch, difficultyMatch, methodMatch, timeMatch, matchedIngredients, ingredientScore };
    }).filter(row => row.queryMatch && row.filterMatch && row.cuisineMatch && row.mealMatch && row.dietMatch && row.difficultyMatch && row.methodMatch && row.timeMatch);

    if (wantedIngredients.length) filtered.sort((a, b) => b.ingredientScore - a.ingredientScore || a.recipe.title.localeCompare(b.recipe.title));
    else if (query) filtered.sort((a, b) => Number(b.recipe.title.toLowerCase().startsWith(query)) - Number(a.recipe.title.toLowerCase().startsWith(query)) || a.recipe.title.localeCompare(b.recipe.title));

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const recipes = filtered.slice(start, start + pageSize).map(({ recipe, matchedIngredients, ingredientScore }) => ({
      ...recipe,
      match: wantedIngredients.length ? { matched: matchedIngredients, total: wantedIngredients.length, score: Math.round(ingredientScore * 100) } : undefined,
    }));
    return NextResponse.json({ recipes, page, pageSize, total, totalPages, hasMore: page < totalPages }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Recipe catalog query failed:', error instanceof Error ? error.message.slice(0, 180) : 'Unknown catalog error');
    return NextResponse.json({ error: 'The recipe catalog could not be loaded. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
