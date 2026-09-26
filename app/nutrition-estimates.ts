import type { Recipe } from './recipe-data';

export type NutritionEstimate = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  estimated: true;
};

type Food = { kcal: number; protein: number; carbohydrates: number; fat: number; fiber: number; sugar: number; gramsPerCup?: number; gramsPerPiece?: number; gramsPerTbsp?: number; gramsPerTsp?: number; gramsPerClove?: number; gramsPerSlice?: number };

// Typical food-composition values per 100 g. Portions/densities are included only
// for common ingredients where a practical household conversion is available.
const foods: Record<string, Food> = {
  chicken:{kcal:165,protein:31,carbohydrates:0,fat:3.6,fiber:0,sugar:0,gramsPerCup:140,gramsPerPiece:150},
  lamb:{kcal:250,protein:25,carbohydrates:0,fat:16,fiber:0,sugar:0,gramsPerCup:135},
  'white fish':{kcal:105,protein:22,carbohydrates:0,fat:2,fiber:0,sugar:0,gramsPerCup:150,gramsPerPiece:150},
  salmon:{kcal:208,protein:20,carbohydrates:0,fat:13,fiber:0,sugar:0,gramsPerCup:150,gramsPerPiece:150},
  paneer:{kcal:265,protein:18,fat:20,carbohydrates:4,fiber:0,sugar:3,gramsPerCup:150,gramsPerPiece:25},
  yogurt:{kcal:61,protein:3.5,carbohydrates:4.7,fat:3.3,fiber:0,sugar:4.7,gramsPerCup:245,gramsPerTbsp:15},
  cream:{kcal:340,protein:2,carbohydrates:3,fat:36,fiber:0,sugar:3,gramsPerCup:238,gramsPerTbsp:15},
  butter:{kcal:717,protein:0.9,carbohydrates:0.1,fat:81,fiber:0,sugar:0.1,gramsPerTbsp:14},
  tomato:{kcal:18,protein:0.9,carbohydrates:3.9,fat:0.2,fiber:1.2,sugar:2.6,gramsPerCup:180,gramsPerPiece:123},
  onion:{kcal:40,protein:1.1,carbohydrates:9.3,fat:0.1,fiber:1.7,sugar:4.2,gramsPerCup:160,gramsPerPiece:110},
  garlic:{kcal:149,protein:6.4,carbohydrates:33,fat:0.5,fiber:2.1,sugar:1,gramsPerCup:136,gramsPerClove:3},
  ginger:{kcal:80,protein:1.8,carbohydrates:18,fat:0.8,fiber:2,sugar:1.7,gramsPerCup:96,gramsPerTbsp:6},
  'coconut milk':{kcal:197,protein:2,carbohydrates:3,fat:21,fiber:0,sugar:2,gramsPerCup:240,gramsPerTbsp:15},
  tamarind:{kcal:239,protein:2.8,carbohydrates:63,fat:0.6,fiber:5.1,sugar:57,gramsPerTbsp:15},
  chili:{kcal:40,protein:2,carbohydrates:9,fat:0.2,fiber:1.5,sugar:5.3,gramsPerPiece:15},
  chickpeas:{kcal:164,protein:8.9,carbohydrates:27.4,fat:2.6,fiber:7.6,sugar:4.8,gramsPerCup:164},
  'kidney beans':{kcal:127,protein:8.7,carbohydrates:22.8,fat:0.5,fiber:6.4,sugar:0.3,gramsPerCup:177},
  peas:{kcal:81,protein:5.4,carbohydrates:14.5,fat:0.4,fiber:5.7,sugar:5.7,gramsPerCup:145},
  carrot:{kcal:41,protein:0.9,carbohydrates:9.6,fat:0.2,fiber:2.8,sugar:4.7,gramsPerCup:128,gramsPerPiece:61},
  spinach:{kcal:23,protein:2.9,carbohydrates:3.6,fat:0.4,fiber:2.2,sugar:0.4,gramsPerCup:30},
  lentils:{kcal:116,protein:9,carbohydrates:20,fat:0.4,fiber:7.9,sugar:1.8,gramsPerCup:198},
  eggs:{kcal:143,protein:12.6,carbohydrates:0.7,fat:9.5,fiber:0,sugar:0.4,gramsPerPiece:50},
  potato:{kcal:77,protein:2,carbohydrates:17.5,fat:0.1,fiber:2.2,sugar:0.8,gramsPerCup:150,gramsPerPiece:173},
  'whole wheat flour':{kcal:340,protein:13.2,carbohydrates:72,fat:2.5,fiber:10.7,sugar:0.4,gramsPerCup:120},
  poha:{kcal:350,protein:6.7,carbohydrates:78,fat:1.2,fiber:2.5,sugar:0.5,gramsPerCup:90},
  peanuts:{kcal:567,protein:25.8,carbohydrates:16.1,fat:49.2,fiber:8.5,sugar:4,gramsPerCup:146,gramsPerTbsp:9},
  lemon:{kcal:29,protein:1.1,carbohydrates:9.3,fat:0.3,fiber:2.8,sugar:2.5,gramsPerPiece:58},
  cauliflower:{kcal:25,protein:1.9,carbohydrates:5,fat:0.3,fiber:2,sugar:1.9,gramsPerCup:107},
  cashews:{kcal:553,protein:18.2,carbohydrates:30.2,fat:43.9,fiber:3.3,sugar:5.9,gramsPerCup:137},
  'pizza dough':{kcal:266,protein:8.9,carbohydrates:49,fat:3.3,fiber:2.5,sugar:5,gramsPerCup:250},
  mozzarella:{kcal:280,protein:28,carbohydrates:3.1,fat:17,fiber:0,sugar:1,gramsPerCup:113},
  pasta:{kcal:371,protein:13,carbohydrates:75,fat:1.5,fiber:3.2,sugar:2.7,gramsPerCup:100},
  parmesan:{kcal:431,protein:38,carbohydrates:4.1,fat:29,fiber:0,sugar:0.9,gramsPerCup:100,gramsPerTbsp:5},
  zucchini:{kcal:17,protein:1.2,carbohydrates:3.1,fat:0.3,fiber:1,sugar:2.5,gramsPerCup:124,gramsPerPiece:196},
  ricotta:{kcal:174,protein:11.3,carbohydrates:3,fat:13,fiber:0,sugar:0.3,gramsPerCup:246},
  tortillas:{kcal:312,protein:8.3,carbohydrates:52,fat:8,fiber:6,sugar:2,gramsPerPiece:40},
  avocado:{kcal:160,protein:2,carbohydrates:8.5,fat:14.7,fiber:6.7,sugar:0.7,gramsPerPiece:150},
  cheddar:{kcal:403,protein:25,carbohydrates:1.3,fat:33,fiber:0,sugar:0.5,gramsPerCup:113},
  tofu:{kcal:76,protein:8,carbohydrates:1.9,fat:4.8,fiber:0.3,sugar:0.6,gramsPerCup:126},
  cucumber:{kcal:15,protein:0.7,carbohydrates:3.6,fat:0.1,fiber:0.5,sugar:1.7,gramsPerCup:104,gramsPerPiece:300},
  feta:{kcal:264,protein:14,carbohydrates:4.1,fat:21,fiber:0,sugar:4.1,gramsPerCup:150},
  macaroni:{kcal:371,protein:13,carbohydrates:75,fat:1.5,fiber:3.2,sugar:2.7,gramsPerCup:100},
  milk:{kcal:61,protein:3.2,carbohydrates:4.8,fat:3.3,fiber:0,sugar:5.1,gramsPerCup:244},
  mushrooms:{kcal:22,protein:3.1,carbohydrates:3.3,fat:0.3,fiber:1,sugar:2,gramsPerCup:70},
  'egg noodles':{kcal:138,protein:4.5,carbohydrates:25,fat:2.1,fiber:1.2,sugar:0.6,gramsPerCup:160},
  celery:{kcal:14,protein:0.7,carbohydrates:3,fat:0.2,fiber:1.6,sugar:1.3,gramsPerCup:101,gramsPerPiece:40},
  mango:{kcal:60,protein:0.8,carbohydrates:15,fat:0.4,fiber:1.6,sugar:13.7,gramsPerCup:165,gramsPerPiece:200},
  honey:{kcal:304,protein:0.3,carbohydrates:82.4,fat:0,fiber:0,sugar:82.1,gramsPerTbsp:21},
  oil:{kcal:884,protein:0,carbohydrates:0,fat:100,fiber:0,sugar:0,gramsPerCup:218,gramsPerTbsp:14,gramsPerTsp:4.5},
  'olive oil':{kcal:884,protein:0,carbohydrates:0,fat:100,fiber:0,sugar:0,gramsPerCup:216,gramsPerTbsp:13.5,gramsPerTsp:4.5},
  salt:{kcal:0,protein:0,carbohydrates:0,fat:0,fiber:0,sugar:0,gramsPerTsp:6},
  turmeric:{kcal:312,protein:9.7,carbohydrates:67,fat:3.3,fiber:22.7,sugar:3.2,gramsPerTsp:3},
  cumin:{kcal:375,protein:18,carbohydrates:44,fat:22,fiber:11,sugar:2.3,gramsPerTsp:2.1},
  'black pepper':{kcal:251,protein:10.4,carbohydrates:64,fat:3.3,fiber:25,sugar:0.6,gramsPerTsp:2.3},
  paprika:{kcal:282,protein:14.1,carbohydrates:54.9,fat:12.9,fiber:34.9,sugar:10.3,gramsPerTsp:2.3},
  'garam masala':{kcal:379,protein:15,carbohydrates:53,fat:15,fiber:20,sugar:3,gramsPerTsp:2},
  'tikka masala':{kcal:379,protein:15,carbohydrates:53,fat:15,fiber:20,sugar:3,gramsPerTbsp:6},
  'chole masala':{kcal:379,protein:15,carbohydrates:53,fat:15,fiber:20,sugar:3,gramsPerTbsp:6},
  'rice flour':{kcal:366,protein:6,carbohydrates:80,fat:1.4,fiber:2.4,sugar:0.1,gramsPerCup:158,gramsPerTbsp:10},
  basil:{kcal:23,protein:3.2,carbohydrates:2.7,fat:0.6,fiber:1.6,sugar:0.3,gramsPerCup:24,gramsPerPiece:2},
  cilantro:{kcal:23,protein:2.1,carbohydrates:3.7,fat:0.5,fiber:2.8,sugar:0.9,gramsPerCup:16,gramsPerTbsp:1},
  parsley:{kcal:36,protein:3,carbohydrates:6.3,fat:0.8,fiber:3.3,sugar:0.9,gramsPerCup:60},
  rice:{kcal:365,protein:7.1,carbohydrates:80,fat:0.7,fiber:1.3,sugar:0.1,gramsPerCup:185},
  'urad dal':{kcal:341,protein:25.2,carbohydrates:58,fat:1.6,fiber:18.3,sugar:2,gramsPerCup:190},
  'mustard seeds':{kcal:508,protein:26,carbohydrates:28,fat:36,fiber:12,sugar:7,gramsPerTsp:2},
  'curry leaves':{kcal:108,protein:6.1,carbohydrates:18.7,fat:1,fiber:6.4,sugar:0,gramsPerPiece:0.2},
  'green beans':{kcal:31,protein:1.8,carbohydrates:7,fat:0.2,fiber:2.7,sugar:3.3,gramsPerCup:125},
  'black beans':{kcal:132,protein:8.9,carbohydrates:23.7,fat:0.5,fiber:8.7,sugar:0.3,gramsPerCup:172},
  'tomato sauce':{kcal:29,protein:1.4,carbohydrates:6.6,fat:0.2,fiber:1.5,sugar:4.5,gramsPerCup:245},
  'rice noodles':{kcal:109,protein:1.8,carbohydrates:24,fat:0.2,fiber:1,sugar:0.1,gramsPerCup:175},
  olives:{kcal:115,protein:0.8,carbohydrates:6.3,fat:10.7,fiber:3.2,sugar:0.5,gramsPerCup:135},
  'arborio rice':{kcal:365,protein:7.1,carbohydrates:80,fat:0.7,fiber:1.3,sugar:0.1,gramsPerCup:190},
  stock:{kcal:6,protein:0.6,carbohydrates:0.4,fat:0.2,fiber:0,sugar:0.2,gramsPerCup:240},
  'green chili':{kcal:40,protein:2,carbohydrates:9,fat:0.2,fiber:1.5,sugar:5.3,gramsPerPiece:15},
  'bell pepper':{kcal:31,protein:1,carbohydrates:6,fat:0.3,fiber:2.1,sugar:4.2,gramsPerCup:149,gramsPerPiece:120},
  'soy sauce':{kcal:53,protein:8,carbohydrates:5,fat:0.6,fiber:0.8,sugar:0.4,gramsPerTbsp:16},
  'lime juice':{kcal:25,protein:0.4,carbohydrates:8.4,fat:0.1,fiber:0.4,sugar:1.7,gramsPerTbsp:15},
  'lemon juice':{kcal:22,protein:0.4,carbohydrates:6.9,fat:0.2,fiber:0.3,sugar:2.5,gramsPerTbsp:15},
  'black peppercorns':{kcal:251,protein:10.4,carbohydrates:64,fat:3.3,fiber:25,sugar:0.6,gramsPerTsp:2.3},
  'pav bhaji masala':{kcal:379,protein:15,carbohydrates:53,fat:15,fiber:20,sugar:3,gramsPerTbsp:6},
  'kashmiri chili':{kcal:282,protein:14.1,carbohydrates:54.9,fat:12.9,fiber:34.9,sugar:10.3,gramsPerTsp:2.3},
  fennel:{kcal:345,protein:15.8,carbohydrates:52,fat:14.9,fiber:39.8,sugar:0,gramsPerTsp:2},
  'chicken stock':{kcal:6,protein:0.6,carbohydrates:0.4,fat:0.2,fiber:0,sugar:0.2,gramsPerCup:240},
  'cooked rice':{kcal:130,protein:2.7,carbohydrates:28.2,fat:0.3,fiber:0.4,sugar:0.1,gramsPerCup:158},
};

const normalize = (value: string) => value.toLowerCase().trim().replace(/\s+/g, ' ');
const aliases: Record<string, string> = { tomatoes:'tomato', 'red onion':'onion', onions:'onion', 'garlic clove':'garlic', 'coconut cream':'cream', 'extra virgin olive oil':'olive oil', 'vegetable oil':'oil', 'canola oil':'oil', 'chicken breast':'chicken', 'chicken thighs':'chicken', 'chicken thigh':'chicken', 'kidney beans (cooked)':'kidney beans', 'cooked kidney beans':'kidney beans', 'cooked chickpeas':'chickpeas', 'ripe mango':'mango', 'large eggs':'eggs', egg:'eggs', potatoes:'potato', 'green peas':'peas', 'frozen peas':'peas', 'bell peppers':'bell pepper', 'fresh spinach':'spinach', 'fresh cilantro':'cilantro', 'fresh parsley':'parsley', 'fresh basil':'basil', 'basmati rice':'rice', 'white rice':'rice', 'coriander leaves':'cilantro' };

function toGrams(name: string, amount: number, unit: string, food: Food): number | null {
  const u=unit.toLowerCase().trim().replace(/s$/, '');
  if (u==='g'||u==='gram') return amount;
  if (u==='kg'||u==='kilogram') return amount*1000;
  if (u==='ml'||u==='milliliter'||u==='l'||u==='liter') {
    if (['milk','yogurt','cream','coconut milk','oil','olive oil'].includes(normalize(name))) return amount*(u==='l'||u==='liter'?1000:1);
    return null;
  }
  if (u==='cup'&&food.gramsPerCup) return amount*food.gramsPerCup;
  if ((u==='tbsp'||u==='tablespoon')&&food.gramsPerTbsp) return amount*food.gramsPerTbsp;
  if ((u==='tsp'||u==='teaspoon')&&food.gramsPerTsp) return amount*food.gramsPerTsp;
  if ((u==='piece'||u==='pc')&&food.gramsPerPiece) return amount*food.gramsPerPiece;
  if (u==='clove'&&food.gramsPerClove) return amount*food.gramsPerClove;
  if (u==='slice'&&food.gramsPerSlice) return amount*food.gramsPerSlice;
  return null;
}

export function estimateNutritionPerServing(recipe: Recipe): NutritionEstimate | null {
  const details=recipe.ingredientDetails;
  if (!details?.length || !Number.isFinite(recipe.servings) || recipe.servings<1) return null;
  const total={calories:0,protein:0,carbohydrates:0,fat:0,fiber:0,sugar:0};
  for(const item of details){
    if(item.quantity===null||!Number.isFinite(item.quantity)||item.quantity<=0) return null;
    const key=normalize(item.name);
    const lookup=aliases[key]||key;
    const food=foods[lookup];
    if(!food) return null;
    const grams=toGrams(item.name,item.quantity,item.unit,food);
    if(grams===null||!Number.isFinite(grams)||grams<=0) return null;
    const factor=grams/100;
    total.calories+=food.kcal*factor;
    total.protein+=food.protein*factor;
    total.carbohydrates+=food.carbohydrates*factor;
    total.fat+=food.fat*factor;
    total.fiber+=food.fiber*factor;
    total.sugar+=food.sugar*factor;
  }
  return {calories:Math.round(total.calories/recipe.servings),protein:Math.round(total.protein/recipe.servings),carbohydrates:Math.round(total.carbohydrates/recipe.servings),fat:Math.round(total.fat/recipe.servings),fiber:Math.round(total.fiber/recipe.servings),sugar:Math.round(total.sugar/recipe.servings),estimated:true};
}

export function getRecipeNutrition(recipe: Recipe): NutritionEstimate | null {
  const stored=recipe.nutrition;
  if(stored&&[stored.calories,stored.protein,stored.carbohydrates,stored.fat].every(value=>Number.isFinite(value)&&value>=0)) return {
    calories:Math.round(stored.calories),protein:Math.round(stored.protein),carbohydrates:Math.round(stored.carbohydrates),fat:Math.round(stored.fat),
    ...(Number.isFinite(stored.fiber)&&stored.fiber>=0?{fiber:Math.round(stored.fiber)}:{}),
    ...(typeof stored.sugar==='number'&&Number.isFinite(stored.sugar)&&stored.sugar>=0?{sugar:Math.round(stored.sugar)}:{}),
    estimated:true,
  };
  return estimateNutritionPerServing(recipe);
}
