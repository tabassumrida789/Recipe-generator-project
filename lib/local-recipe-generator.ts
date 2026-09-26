export type LocalIngredient = { name: string; quantity: number | null; unit: string; have: boolean };
export type LocalRecipeStep = { stepNumber: number; title: string; description: string; duration: string; ingredients: string[]; tip: string };
export type LocalRecipe = {
  title: string; description: string; cuisine: string; category: string; mealType: string; difficulty: 'Easy' | 'Medium';
  prepTime: number; cookTime: number; prepMinutes: number; cookMinutes: number; minutes: number; servings: number;
  ingredients: (LocalIngredient & { substitution: string | null })[]; steps: LocalRecipeStep[]; tips: string[]; servingSuggestions: string[]; tags: string[]; nutrition: null;
};

type RecipeKind = 'rice' | 'noodles' | 'pasta' | 'wrap' | 'curry' | 'stir-fry' | 'breakfast' | 'salad' | 'soup' | 'skillet';

const meat=/\b(chicken|beef|pork|lamb|mutton|fish|salmon|tuna|shrimp|prawn|seafood|turkey|bacon|ham|sausage)\b/i;
const dairy=/\b(milk|yogurt| yoghurt|cheese|paneer|butter|cream|ghee|whey)\b/i;
const egg=/\b(egg|eggs|mayonnaise)\b/i;
const gluten=/\b(wheat|barley|rye|bread|flour|semolina|pasta|lasagna|couscous|seitan)\b/i;
const jainAvoid=/\b(onion|garlic|potato|ginger|carrot|radish|beet(?:root)?|turnip|yam)\b/i;

function restrictionConflict(ingredients: LocalIngredient[], preferences: string[]): string | null {
  const names=ingredients.map(item=>item.name).join(', ');
  if(preferences.includes('Vegan')&&(meat.test(names)||dairy.test(names)||egg.test(names)||/\bhoney\b/i.test(names)))return 'These ingredients conflict with Vegan. Remove the animal-based ingredients or change the dietary preferences.';
  if(preferences.includes('Vegetarian')&&meat.test(names))return 'These ingredients conflict with Vegetarian. Remove meat or fish, or change the dietary preference.';
  if(preferences.includes('Eggless')&&egg.test(names))return 'These ingredients conflict with Eggless. Remove egg or mayonnaise, or change the dietary preference.';
  if(preferences.includes('Dairy-Free')&&dairy.test(names))return 'These ingredients conflict with Dairy-Free. Remove dairy ingredients or change the dietary preference.';
  if(preferences.includes('Gluten-Free')&&gluten.test(names))return 'These ingredients may contain gluten and conflict with Gluten-Free. Replace them with verified gluten-free alternatives or change the dietary preference.';
  if(preferences.includes('Jain-friendly')&&(meat.test(names)||egg.test(names)||jainAvoid.test(names)))return 'These ingredients conflict with Jain-friendly preferences. Remove the listed restricted ingredients or change the dietary preference.';
  return null;
}

function inferKind(names: string, mealType: string): RecipeKind {
  const meal=mealType.toLowerCase();
  if(/breakfast/.test(meal))return 'breakfast';
  if(/salad/.test(meal))return 'salad';
  if(/soup/.test(meal))return 'soup';
  if(/rice|poha|risotto/.test(names))return 'rice';
  if(/noodle|ramen/.test(names))return 'noodles';
  if(/pasta|macaroni|spaghetti|lasagna/.test(names))return 'pasta';
  if(/tortilla|wrap|pita|bread|roti/.test(names))return 'wrap';
  if(/stock|broth|soup/.test(names))return 'soup';
  if(/lettuce|cucumber|feta|olives/.test(names))return 'salad';
  if(/curry|lentil|dal|chickpea|bean|paneer/.test(names))return 'curry';
  if(/egg|oat|pancake/.test(names))return 'breakfast';
  if(/pepper|broccoli|zucchini|mushroom|tofu/.test(names))return 'stir-fry';
  return 'skillet';
}

function choose<T>(options: T[]): T { return options[Math.floor(Math.random()*options.length)]; }
function substitutionFor(name:string,kind:RecipeKind,preferences:string[]):string|null{
  const lower=name.toLowerCase();
  if(/yogurt|yoghurt/.test(lower)&&(preferences.includes('Vegan')||preferences.includes('Dairy-Free')))return 'unsweetened coconut yogurt';
  if(/butter|ghee/.test(lower)&&(preferences.includes('Vegan')||preferences.includes('Dairy-Free')))return 'olive oil';
  if(/cream/.test(lower)&&(preferences.includes('Vegan')||preferences.includes('Dairy-Free')))return kind==='curry'?'coconut milk':'unsweetened oat cream';
  if(/paneer/.test(lower)&&preferences.includes('Vegan'))return 'firm tofu';
  if(/basmati rice|white rice/.test(lower)&&kind==='rice')return 'brown rice (add extra cooking time)';
  if(/spinach/.test(lower)&&['curry','stir-fry','skillet'].includes(kind))return 'kale';
  return null;
}
function servingSuggestionsFor(kind:RecipeKind,cuisine:string,preferences:string[]):string[]{
  const dairyFree=preferences.includes('Vegan')||preferences.includes('Dairy-Free');
  if(/mexican/i.test(cuisine))return ['Fresh tomato salsa','Lime wedges','Shredded cabbage'];
  if(/italian/i.test(cuisine))return ['Simple green salad',...(preferences.includes('Gluten-Free')?[]:['Toasted bread'])];
  if(/indian|north indian|south indian/i.test(cuisine))return [dairyFree?'Cucumber and lemon salad':'Cucumber raita','Lemon wedges','Pickle'];
  if(['noodles','stir-fry'].includes(kind))return ['Steamed greens','Lime wedges','Sliced scallions'];
  if(kind==='soup')return ['Simple side salad',...(preferences.includes('Gluten-Free')?[]:['Toasted bread'])];
  if(kind==='breakfast')return ['Fresh seasonal fruit','Coriander chutney'];
  if(kind==='salad')return ['Roasted vegetables',...(preferences.includes('Gluten-Free')?[]:['Warm flatbread'])];
  return ['Fresh seasonal salad','Lemon wedges'];
}
function titleFor(kind: RecipeKind, names: string, cuisine: string): string {
  const suppliedAnchor=names.split(',').find(name=>name.trim())?.trim()||'Vegetable';
  const anchor=suppliedAnchor.replace(/\b(rice|noodles?|pasta|macaroni|spaghetti|wraps?|tortillas?|bread|curry|soup|salad|stir[- ]?fry)\b/ig,'').trim()||'Vegetable';
  const prefix=cuisine&&cuisine.toLowerCase()!=='fusion'?`${cuisine} `:'';
  const titles:Record<RecipeKind,string[]>={
    rice:[`${prefix}${anchor} Rice Bowl`,`${prefix}One-Pot ${anchor} Rice`,`${prefix}Savory ${anchor} Rice`],
    noodles:[`${prefix}${anchor} Noodle Stir-Fry`,`${prefix}Quick Noodles with ${anchor}`,`${prefix}Warm ${anchor} Noodle Bowl`],
    pasta:[`${prefix}Pasta with ${anchor}`,`${prefix}Creamy ${anchor} Pasta`,`${prefix}Skillet Pasta and ${anchor}`],
    wrap:[`${prefix}${anchor} Wraps`,`${prefix}Toasted ${anchor} Sandwich`,`${prefix}Fresh ${anchor} Flatbread`],
    curry:[`${prefix}${anchor} Curry`,`${prefix}Slow-Simmered ${anchor} Bowl`,`${prefix}Spiced ${anchor} Stew`],
    'stir-fry':[`${prefix}Quick ${anchor} Stir-Fry`,`${prefix}Sizzling ${anchor} Skillet`,`${prefix}Crisp ${anchor} Vegetable Toss`],
    breakfast:[`${prefix}Savory ${anchor} Breakfast Skillet`,`${prefix}Warm ${anchor} Breakfast Bowl`,`${prefix}Pan-Cooked ${anchor}`],
    salad:[`${prefix}Fresh ${anchor} Salad`,`${prefix}Chopped ${anchor} Salad Bowl`,`${prefix}Crisp ${anchor} Salad`],
    soup:[`${prefix}Comforting ${anchor} Soup`,`${prefix}Simple ${anchor} Broth Bowl`,`${prefix}Hearty ${anchor} Soup`],
    skillet:[`${prefix}Seasoned ${anchor} Skillet`,`${prefix}Warm ${anchor} Bowl`,`${prefix}Everyday ${anchor} Sauté`],
  };
  return choose(titles[kind]);
}

function stepsFor(kind: RecipeKind, ingredients: LocalIngredient[], requestedTime?: number): LocalRecipeStep[] {
  const names=ingredients.map(item=>item.name.trim()).filter(Boolean);
  const vegetables=names.filter(name=>/vegetable|tomato|onion|pepper|broccoli|carrot|spinach|zucchini|mushroom|cucumber|lettuce|pea|cauliflower|cabbage|garlic|ginger/i.test(name));
  const base=names.filter(name=>/rice|noodle|pasta|bread|tortilla|wrap|potato|oat|egg/i.test(name));
  const protein=names.filter(name=>/chicken|fish|salmon|tofu|paneer|bean|lentil|chickpea|egg/i.test(name));
  const list=(items:string[])=>[...new Set(items)].filter(Boolean).join(', ')||'the listed ingredients';
  const prep=(title:string,description:string,duration:number,used:string[],tip:string)=>({title,description,duration,ingredients:used,tip,phase:'prep' as const});
  const cook=(title:string,description:string,duration:number,used:string[],tip:string)=>({title,description,duration,ingredients:used,tip,phase:'cook' as const});
  const all=names;
  let contents:{title:string;description:string;duration:number;ingredients:string[];tip:string;phase:'prep'|'cook'}[];
  switch(kind){
    case 'rice': contents=[
      prep('Rinse and prepare the ingredients',`Rinse ${list(base)} until loose surface starch washes away. Wash and cut ${list(vegetables)} into similar-sized pieces; keep the ingredients ready beside the stove.`,6,[...base,...vegetables],'Even cuts cook at the same pace; if no rice was supplied, rinse only the listed grains.'),
      cook('Start cooking the rice',`Cook ${list(base)} in water according to its package or recipe directions. Keep the pot at a gentle simmer and check the texture before the final minutes.`,10,base,'Rice should be tender but still hold its shape before it is combined.'),
      cook('Soften the vegetables and protein',`Warm a wide pan over medium heat. Add ${list([...protein,...vegetables])} in a single layer where possible; stir or turn occasionally until the pieces are hot and vegetables begin to soften.`,9,[...protein,...vegetables],'If the pan gets crowded, cook in batches so ingredients brown instead of steaming.'),
      cook('Fold the rice through the pan',`Add the cooked ${list(base)} to the pan and fold gently through ${list([...protein,...vegetables])}. Add only seasonings supplied in the ingredient list and stir until evenly distributed.`,4,all,'Use a broad spoon and lift from the bottom to avoid crushing the grains.'),
      cook('Heat through and serve',`Lower the heat and cook until the whole dish is steaming hot. Taste, adjust only with listed seasonings, then turn off the heat and serve.`,3,all,'If the rice seems dry, add a small splash of water and cover for a minute.'),
    ];break;
    case 'noodles': contents=[
      prep('Slice and set out the ingredients',`Wash and slice ${list(vegetables)} thinly so they cook quickly. Cut ${list(protein)} into even pieces, then measure the noodles and any listed sauce.`,6,[...vegetables,...protein,...base],'Have everything beside the stove before heating the wok; stir-frying moves quickly.'),
      cook('Boil and drain the noodles',`Bring a pot of water to a boil and cook ${list(base)} according to the package timing until tender but still springy. Drain well.`,8,base,'Taste a noodle near the end; it should bend easily but not turn mushy.'),
      cook('Brown the protein',`Heat a wide pan over medium-high heat. Add ${list(protein)} in a single layer and turn until browned or fully hot through, then transfer out if the pan is crowded.`,6,protein,'Do not crowd the pan; raw poultry must reach 74°C/165°F and fish 63°C/145°F.'),
      cook('Stir-fry the vegetables',`Add ${list(vegetables)} and stir continuously over medium-high heat until bright and just tender. Return the protein if you moved it out.`,5,[...vegetables,...protein],'Keep ingredients moving and lower the heat if small pieces begin to scorch.'),
      cook('Toss noodles with the listed sauce',`Add drained noodles and ${list(names.filter(name=>/sauce|soy|tamarind|chili|paste/i.test(name)))}. Toss until every strand is coated and the pan contents are steaming hot.`,5,[...base,...vegetables,...protein],'If the pan looks dry, add a spoonful of water rather than extra unlisted sauce.'),
    ];break;
    case 'pasta': contents=[
      prep('Prepare and measure the ingredients',`Wash and chop ${list(vegetables)} into bite-sized pieces. Measure ${list(base)} and set out ${list(names.filter(name=>!base.includes(name)&&!vegetables.includes(name)&&!protein.includes(name)))}.`,6,all,'Keep measured ingredients separate so each can be added at the right time.'),
      cook('Boil the pasta until just tender',`Bring a large pot of water to a rolling boil, add ${list(base)} and cook to the package timing. Reserve a cup of the cooking water, then drain.`,10,base,'Stop when the pasta has a slight bite; it will finish heating in the pan.'),
      cook('Soften the vegetables or protein',`Warm a wide pan over medium heat and cook ${list([...vegetables,...protein])}, stirring or turning until vegetables soften and any meat or seafood is safely cooked through.`,8,[...vegetables,...protein],'Check poultry at 74°C/165°F and fish at 63°C/145°F with a clean thermometer.'),
      cook('Warm the sauce ingredients',`Add ${list(names.filter(name=>!base.includes(name)&&!vegetables.includes(name)&&!protein.includes(name)))} to the pan. Keep the heat low to medium and stir until the sauce is smooth and hot.`,5,names.filter(name=>!base.includes(name)),'Avoid a vigorous boil if the listed sauce contains dairy.'),
      cook('Toss and finish the pasta',`Add drained pasta and toss until coated. Add reserved pasta water a spoonful at a time if needed; stop when the sauce clings lightly to the pasta.`,4,all,'Taste before adding anything extra; use only seasonings supplied with the recipe.'),
    ];break;
    case 'wrap': contents=[
      prep('Prepare the filling ingredients',`Wash and cut ${list(vegetables)} into small pieces. Portion ${list(protein)} and any listed sauce so the bread can be filled while warm.`,6,[...vegetables,...protein],'Keep raw meat separate from vegetables that will be eaten uncooked.'),
      cook('Cook the filling through',`Heat a skillet over medium heat and cook ${list(protein.length?protein:vegetables)}, turning or stirring until hot and tender. Any poultry should reach 74°C/165°F.`,8,[...protein,...vegetables],'If the filling browns too quickly, lower the heat and let the center cook through.'),
      cook('Warm the bread until flexible',`Warm ${list(base)} in a dry pan over medium-low heat, turning once, until pliable and lightly toasted without becoming crisp.`,3,base,'Stack warmed pieces under a clean towel to keep them soft.'),
      cook('Fill, fold and serve',`Arrange ${list([...protein,...vegetables])} down the center of each bread piece. Add only the listed sauces, fold in the sides and roll firmly without overfilling.`,4,all,'Serve soon after assembling so warm filling does not make the bread soggy.'),
    ];break;
    case 'curry': contents=[
      prep('Prepare and separate the ingredients',`Wash and cut ${list(vegetables)} into similar-sized pieces. Cut ${list(protein)} evenly and measure the remaining listed ingredients before the pan is heated.`,7,all,'Keep raw meat or fish separate from ingredients that will be added later.'),
      cook('Soften the aromatic vegetables',`Heat a heavy pan over medium heat. Add a little oil only if available in your kitchen, then cook ${list(vegetables.filter(name=>/onion|garlic|ginger|pepper/i.test(name)))} until softened, stirring regularly.`,7,vegetables.filter(name=>/onion|garlic|ginger|pepper/i.test(name)),'Lower the heat if the edges brown before the pieces soften.'),
      cook('Coat the main ingredients',`Stir in ${list(protein.length?protein:vegetables)} and any listed dry seasonings. Turn the pieces through the pan until coated and warmed on the outside.`,6,[...protein,...vegetables],'Keep ground spices moving so they become fragrant without scorching.'),
      cook('Add the listed sauce or liquid',`Add ${list(names.filter(name=>/tomato|coconut|milk|cream|stock|broth|yogurt|water|sauce/i.test(name)))} and enough recipe liquid to make a loose sauce. Stir around the pan base.`,4,names.filter(name=>/tomato|coconut|milk|cream|stock|broth|yogurt|sauce/i.test(name)),'If the recipe has no listed sauce ingredient, add only the measured liquid specified there.'),
      cook('Simmer gently until tender',`Bring the curry to a gentle bubble, then lower the heat and cover partly. Stir occasionally until vegetables are tender and protein is safely cooked through.`,14,all,'Poultry should reach 74°C/165°F; fish should reach 63°C/145°F. Add a small splash of water if the pan dries.'),
      cook('Taste, rest and serve',`Turn off the heat and let the curry stand for 2–3 minutes. Taste and adjust only with listed seasonings, then serve with any suitable side you have.`,4,all,'A short rest lets the sauce settle; do not leave cooked food at room temperature for more than 2 hours.'),
    ];break;
    case 'stir-fry': contents=[
      prep('Cut and arrange the ingredients',`Wash and slice ${list(vegetables)} into similarly sized pieces. Pat ${list(protein)} dry and measure any listed sauce; keep everything within reach.`,6,all,'A stir-fry cooks quickly, so finish all cutting before the pan is hot.'),
      cook('Sear the protein or firm vegetables',`Heat a wide skillet or wok over medium-high heat. Cook ${list(protein.length?protein:vegetables)} in a single layer, turning when the first side browns.`,6,protein.length?protein:vegetables,'Work in batches if pieces touch; crowding makes them steam.'),
      cook('Add the quick-cooking vegetables',`Add remaining ${list(vegetables)} and stir continuously until bright and just tender. Return any cooked protein to the pan.`,5,vegetables,'If small pieces are browning too quickly, reduce heat slightly.'),
      cook('Coat with the listed sauce',`Add ${list(names.filter(name=>/sauce|soy|tamarind|chili|paste/i.test(name)))} around the pan and toss so it coats the food evenly.`,3,names.filter(name=>/sauce|soy|tamarind|chili|paste/i.test(name)),'Add sauce gradually; too much liquid can soften the vegetables.'),
      cook('Heat through and serve',`Toss until all ingredients are steaming hot and the vegetables still have a little bite. Turn off the heat and serve promptly.`,2,all,'Check meat or seafood with a thermometer rather than relying on browning alone.'),
    ];break;
    case 'breakfast': contents=[
      prep('Prepare the breakfast ingredients',`Wash and chop ${list(vegetables)}. Measure ${list(base)} and beat ${list(protein.filter(name=>/egg/i.test(name)))} if listed. Set the ingredients beside the stove.`,5,all,'If using eggs, crack them into a separate bowl and wash your hands afterward.'),
      cook('Warm the pan gently',`Set a non-stick skillet over medium heat. Add a little oil or butter only if it is listed or available, then let the pan warm before adding food.`,2,names.filter(name=>/oil|butter/i.test(name)),'A moderate, steady heat helps eggs and grains cook without scorching.'),
      cook('Cook the main breakfast ingredients',`Add ${list([...vegetables,...protein,...base])} in the order that suits their cooking time. Stir or turn until tender and hot through.`,8,all,'Add delicate ingredients later so they do not overcook.'),
      cook('Season and finish the dish',`Add any listed sauce or seasoning gradually. Check that the food is cooked through, taste, then turn off the heat and serve warm.`,3,all,'Use only the ingredients and seasonings listed; adjust their amount gradually.'),
    ];break;
    case 'salad': contents=[
      prep('Wash and dry the produce',`Rinse ${list(names)} under clean running water and dry well. Cut the ingredients into bite-sized pieces so each forkful is easy to eat.`,6,all,'Dry leaves and vegetables help the dressing cling instead of pooling at the bottom.'),
      prep('Mix the listed dressing ingredients',`Whisk ${list(names.filter(name=>/lemon|lime|oil|yogurt|vinegar|salt|pepper|tahini/i.test(name)))} together in a small bowl until combined.`,3,names.filter(name=>/lemon|lime|oil|yogurt|vinegar|salt|pepper|tahini/i.test(name)),'If there are no dressing ingredients in the list, skip this step rather than adding unlisted items.'),
      cook('Combine the salad gently',`Place the prepared produce in a large bowl. Add the dressing gradually and toss lightly until the pieces are coated without being crushed.`,2,all,'Start with half the dressing; you can add more but cannot remove excess.'),
      cook('Taste and serve fresh',`Taste a piece and adjust only with listed seasonings. Serve right away while the vegetables are crisp.`,1,all,'If preparing ahead, keep dressing separate until just before serving.'),
    ];break;
    case 'soup': contents=[
      prep('Cut the soup ingredients evenly',`Wash and cut ${list(vegetables)} into small pieces. Cut ${list(protein)} evenly so they cook through at the same rate.`,6,[...vegetables,...protein],'Smaller pieces soften faster and are easier to eat from a spoon.'),
      cook('Bring the broth to a gentle simmer',`Pour listed stock or broth into a pot with the ingredients that need the longest cooking. Bring it just to a boil, then lower the heat until small bubbles appear.`,5,names.filter(name=>/stock|broth/i.test(name)),'A gentle simmer keeps the broth clear and prevents the bottom from catching.'),
      cook('Cook the protein safely',`Add ${list(protein)} and simmer gently, stirring occasionally, until fully cooked through. Check poultry at 74°C/165°F or fish at 63°C/145°F.`,14,protein,'Use a clean thermometer where possible; do not judge safety by color alone.'),
      cook('Add vegetables and listed grains',`Stir in ${list([...vegetables,...base])} according to how quickly each cooks. Simmer until the vegetables are tender and noodles or grains match their package texture.`,12,[...vegetables,...base],'Add quick-cooking vegetables later so they keep their shape.'),
      cook('Taste and serve the soup',`Turn off the heat, taste the broth and adjust only with listed seasonings. Ladle into bowls while hot.`,3,all,'Let the soup cool before refrigerating leftovers; reheat until steaming hot.'),
    ];break;
    default: contents=[
      prep('Wash, cut and arrange the ingredients',`Wash and cut ${list(vegetables)} into similar-sized pieces. Drain or rinse ${list(names.filter(name=>/bean|chickpea|lentil|can/i.test(name)))} when appropriate and set everything within reach.`,6,all,'Even pieces cook predictably and make the next steps easier to follow.'),
      cook('Heat the pan and start the longest-cooking items',`Warm a skillet over medium heat. Add only listed cooking fat if available, then cook ${list(protein.length?protein:base)} first, stirring or turning until hot and beginning to brown.`,8,[...protein,...base],'If the pan becomes dry, lower the heat and add a small splash of water.'),
      cook('Add vegetables in stages',`Add ${list(vegetables)} and stir occasionally until tender but still holding their shape. Give firm vegetables more time than leafy or soft ingredients.`,7,vegetables,'Add delicate vegetables later; they need less time.'),
      cook('Season, check doneness and serve',`Stir through the listed seasonings and cook until everything is evenly hot. Check meat or seafood for a safe internal temperature, then taste and serve.`,4,all,'Poultry should reach 74°C/165°F and fish 63°C/145°F; use a clean thermometer if available.'),
    ];
  }
  if(requestedTime&&requestedTime>0){
    const current=contents.reduce((sum,step)=>sum+step.duration,0);
    const target=Math.max(contents.length,Math.round(requestedTime));
    let remaining=target;
    contents=contents.map((step,index)=>{const duration=index===contents.length-1?Math.max(1,remaining):Math.max(1,Math.round(step.duration*target/current));remaining-=duration;return {...step,duration}});
  }
  return contents.map((step,index)=>({stepNumber:index+1,title:step.title,description:step.description,duration:`${step.duration} min`,ingredients:[...new Set(step.ingredients.filter(name=>names.some(item=>item.toLocaleLowerCase()===name.toLocaleLowerCase())))],tip:step.tip}));
}

export function generateLocalRecipe(input:{ingredients:LocalIngredient[];servings:number;cuisine:string;preferences:string[];mealType?:string;cookingTime?:number}):{recipe:LocalRecipe;servings:number}|{error:string;status:number}{
  const conflict=restrictionConflict(input.ingredients,input.preferences);
  if(conflict)return {error:conflict,status:422};
  const names=input.ingredients.map(item=>item.name).join(', ');
  const mealType=input.mealType?.trim()||(/breakfast/i.test(names)?'Breakfast':/salad/i.test(names)?'Lunch':'Dinner');
  const kind=inferKind(names.toLowerCase(),mealType);
  const steps=stepsFor(kind,input.ingredients,input.cookingTime);
  const prepTime=steps.filter((_,index)=>index===0).reduce((sum,step)=>sum+Number(step.duration.match(/\d+/)?.[0]||0),0);
  const cookTime=steps.slice(1).reduce((sum,step)=>sum+Number(step.duration.match(/\d+/)?.[0]||0),0);
  const category:Record<RecipeKind,string>={rice:'Rice',noodles:'Noodles',pasta:'Pasta',wrap:'Wrap',curry:'Curry','stir-fry':'Stir-fry',breakfast:'Breakfast',salad:'Salad',soup:'Soup',skillet:'Skillet'};
  const recipe:LocalRecipe={
    title:titleFor(kind,names,input.cuisine),description:`A simple ${input.cuisine||'home-style'} ${category[kind].toLowerCase()} using ${names}. Seasonings and cooking times are flexible—adjust to suit your ingredients.`,
    cuisine:input.cuisine||'Home-style',category:category[kind],mealType,difficulty:kind==='curry'||kind==='wrap'?'Medium':'Easy',
    prepTime, cookTime, prepMinutes:prepTime,cookMinutes:cookTime,minutes:prepTime+cookTime,servings:input.servings,
    ingredients:input.ingredients.map(item=>({...item,substitution:substitutionFor(item.name,kind,input.preferences)})),steps,tips:['Cut ingredients to a similar size so they cook evenly.','Add seasonings gradually and adjust to taste.'],servingSuggestions:servingSuggestionsFor(kind,input.cuisine,input.preferences),tags:input.preferences,nutrition:null,
  };
  return {recipe,servings:input.servings};
}
