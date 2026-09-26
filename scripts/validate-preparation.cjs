const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true });
  module._compile(output, filename);
};

const root = path.resolve(__dirname, '..');
const { discoverRecipes } = require(path.join(root, 'app/recipe-data.ts'));
const { getPreparationSteps } = require(path.join(root, 'app/recipe-preparation.ts'));
const { generateLocalRecipe } = require(path.join(root, 'lib/local-recipe-generator.ts'));
const vague = /^(prepare|build flavor|add ingredients|cook|finish|serve)$|^cooking step\b/i;
const placeholder = /\b(cook as needed|add ingredients|cook until done|continue cooking|serve when ready|prepare according to taste)\b/i;

let checked = 0;
for (const recipe of discoverRecipes) {
  const steps = getPreparationSteps(recipe);
  assert.ok(steps.length >= 4 && steps.length <= 14, `${recipe.title}: expected 4–14 steps, got ${steps.length}`);
  const ingredientNames = new Set(recipe.ingredients.map(name => name.toLocaleLowerCase()));
  let elapsed = 0;
  steps.forEach((step, index) => {
    assert.equal(step.stepNumber, index + 1, `${recipe.title}: step numbering is not sequential`);
    assert.ok(step.title.trim().length >= 8 && !vague.test(step.title.trim()), `${recipe.title}: vague step title “${step.title}”`);
    assert.ok(step.description.trim().length >= 35 && !placeholder.test(step.description), `${recipe.title}: vague/short instruction at step ${index + 1}`);
    assert.ok(Number.isInteger(step.durationMinutes) && step.durationMinutes > 0, `${recipe.title}: invalid duration`);
    for (const name of step.ingredients) assert.ok(ingredientNames.has(name.toLocaleLowerCase()), `${recipe.title}: step references unlisted ingredient ${name}`);
    const used = new Set(step.ingredients.map(name => name.toLocaleLowerCase()));
    for (const name of recipe.ingredients) {
      const lower = name.toLocaleLowerCase();
      if (lower.length >= 4 && step.description.toLocaleLowerCase().includes(lower)) assert.ok(used.has(lower), `${recipe.title}: instruction mentions ${name} without listing it as used in step ${index + 1}`);
    }
    elapsed += step.durationMinutes;
  });
  assert.ok(Math.abs(elapsed - recipe.minutes) <= Math.max(steps.length, recipe.minutes * 0.1), `${recipe.title}: step timing (${elapsed} min) conflicts with recipe total (${recipe.minutes} min)`);
  checked++;
}
assert.ok(checked >= 20, `Expected to check at least 20 recipes, checked ${checked}`);

const localCases = [
  ['rice', ['Rice', 'Carrot', 'Peas']], ['noodles', ['Noodles', 'Bell pepper', 'Tofu']],
  ['pasta', ['Pasta', 'Tomato', 'Mushrooms']], ['wrap', ['Tortillas', 'Chicken', 'Lettuce']],
  ['curry', ['Chickpeas', 'Tomato', 'Onion']], ['stir-fry', ['Tofu', 'Broccoli', 'Carrot']],
  ['breakfast', ['Eggs', 'Spinach', 'Potato']], ['salad', ['Cucumber', 'Tomato', 'Feta']],
  ['soup', ['Chicken', 'Carrot', 'Stock']], ['skillet', ['Zucchini', 'Mushrooms', 'Garlic']],
];
for (const [kind, names] of localCases) {
  const result = generateLocalRecipe({ ingredients: names.map(name => ({ name, quantity: null, unit: '', have: true })), servings: 2, cuisine: 'Home-style', preferences: [], mealType: kind === 'breakfast' ? 'Breakfast' : kind === 'salad' ? 'Salad' : kind === 'soup' ? 'Soup' : 'Dinner' });
  assert.ok('recipe' in result, `${kind}: local generator failed`);
  assert.ok(result.recipe.steps.length >= 4 && result.recipe.steps.length <= 6, `${kind}: unexpected local step count`);
  for (const [index, step] of result.recipe.steps.entries()) {
    assert.equal(step.stepNumber, index + 1, `${kind}: step numbering is not sequential`);
    assert.ok(step.title.length >= 8 && !vague.test(step.title), `${kind}: vague title ${step.title}`);
    assert.ok(step.description.length >= 35 && !placeholder.test(step.description), `${kind}: vague local instruction`);
    assert.ok(!/\b(?:add|cook|cut|rinse|stir|season)\s{2,}/i.test(step.description), `${kind}: a step contains a missing ingredient/action phrase`);
    for (const name of step.ingredients) assert.ok(names.some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase()), `${kind}: unlisted ingredient ${name}`);
  }
}

console.log(`Validated structured steps for ${checked} discover recipes and ${localCases.length} local generation templates.`);
