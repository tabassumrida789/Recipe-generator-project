import { staticRecipeDetails } from './recipe-preparation';

export type PreparationStep = {
  stepNumber?: number;
  title: string;
  description: string;
  durationMinutes: number;
  ingredients: string[];
  tip?: string;
};

export type Recipe = {
  id: string; title: string; cuisine: string; category: string; description: string;
  mealType?: string;
  image: string; minutes: number; servings: number; difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[]; ingredients: string[]; steps: string[];
  preparationSteps?: PreparationStep[];
  ingredientDetails?: { name: string; quantity: number | null; unit: string; substitution: string | null; have?: boolean }[];
  prepMinutes?: number; cookMinutes?: number; tips?: string[]; nutrition?: { calories: number; protein: number; carbohydrates: number; fat: number; fiber: number; sugar?: number; estimated: boolean } | null;
  allergens?: string[];
  servingSuggestions?: string[];
  substitutions?: { ingredient: string; substitute: string }[];
  estimatedCost?: { amount: number; currency: string; forServings: number } | null;
  videoUrl?: string;
};

const raw: Array<[string,string,string,string,string,number,'Easy'|'Medium',string[],string[],string]> = [
  ['Hyderabadi Chicken Biryani','Indian','Rice','Fragrant basmati rice layered with warmly spiced chicken.','https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Cw_300%2Ch_300%2Cc_fit/FOOD_CATALOG/IMAGES/CMS/2024/5/28/7f18ad17-1f01-446e-8c76-3117c1ed7354_ae5f8101-0676-43cc-95e7-1faf85524eb4.jpg',70,'Medium',['High protein','Weekend favorite'],['Chicken','Basmati rice','Yogurt','Onion','Garam masala','Ginger','Garlic'], 'Layer marinated chicken with par-cooked rice and steam until fragrant.'],
  ['Butter Chicken','Indian','Curry','Tender chicken in a silky tomato and butter sauce.','https://spicytude.com/cdn/shop/articles/butter-chicken_1200x1200.png?v=1742198195',45,'Medium',['High protein','Comfort food'],['Chicken','Tomato','Cream','Butter','Garam masala'], 'Simmer seared chicken in a spiced tomato sauce and finish with cream.'],
  ['Paneer Tikka','Indian','Snack','Smoky, yogurt-marinated paneer with charred peppers.','photo-1567188040759-fb8a883dc6d8',35,'Easy',['Vegetarian','High protein'],['Paneer','Bell pepper','Yogurt','Lemon','Tikka masala'], 'Thread marinated paneer and peppers, then grill until lightly charred.'],
  ['Masala Dosa','Indian','Breakfast','Crisp golden dosa wrapped around fragrant potato masala.','https://www.indianhealthyrecipes.com/wp-content/uploads/2021/06/masala-dosa-recipe.jpg',50,'Medium',['Vegetarian','South Indian'],['Rice','Urad dal','Potato','Mustard seeds','Curry leaves'], 'Spread fermented batter thinly on a hot skillet and fill with potato masala.'],
  ['Chole','Indian','Curry','Punjabi chickpeas simmered with ginger and warming spices.','https://ciaotomatoes.com/cdn/shop/articles/Chana-Masala-Web_133058f2-e332-4841-be0d-f692199a3656_1024x1024.jpg?v=1748978617',40,'Easy',['Vegan','High protein'],['Chickpeas','Tomato','Onion','Ginger','Chole masala'], 'Simmer cooked chickpeas in a rich onion-tomato masala until tender.'],
  ['Rajma Chawal','Indian','Rice','Creamy kidney bean curry served with fluffy rice.','https://miro.medium.com/v2/resize:fit:720/0*brb2IpmxdoV94l6s.jpg',55,'Easy',['Vegetarian','Budget friendly'],['Kidney beans','Rice','Tomato','Onion','Cumin'], 'Slow-cook kidney beans in tomato gravy and serve over rice.'],
  ['Palak Paneer','Indian','Curry','Soft paneer in a vibrant spinach and garlic gravy.','https://spicecravings.com/wp-content/uploads/2017/08/Palak-Paneer-5.jpg',35,'Easy',['Vegetarian','High protein'],['Spinach','Paneer','Garlic','Cream','Cumin'], 'Fold paneer cubes through silky spiced spinach puree.'],
  ['Aloo Paratha','Indian','Breakfast','Flaky griddled flatbread stuffed with seasoned potatoes.','https://i.pinimg.com/736x/b5/13/63/b513639881fde5307e6d6345d03008d0.jpg',40,'Medium',['Vegetarian','Comfort food'],['Potato','Whole wheat flour','Coriander','Butter','Green chili'], 'Fill dough with mashed spiced potato and griddle until golden.'],
  ['Poha','Indian','Breakfast','Light flattened rice with curry leaves, peanuts, and lemon.','https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Ch_960%2Cw_960/InstamartAssets/poha.webp?updatedAt=1727154745500',20,'Easy',['Vegan','Quick meal'],['Poha','Peanuts','Onion','Curry leaves','Lemon'], 'Temper mustard seeds and curry leaves, then toss with rinsed poha.'],
  ['Vegetable Pulao','Indian','Rice','One-pot basmati rice with seasonal vegetables and whole spices.','https://media.zoopindia.com/ixigo-outlets-images/i741.webp',35,'Easy',['Vegetarian','One pan'],['Basmati rice','Carrot','Peas','Green beans','Garam masala'], 'Toast whole spices, add vegetables and rice, then simmer until fluffy.'],
  ['Dal Tadka','Indian','Curry','Comforting yellow lentils finished with sizzling garlic tadka.','https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Cw_300%2Ch_300%2Ce_grayscale%2Cc_fit/2f5c8801521ecdba2cce360b93be74e4',35,'Easy',['Vegetarian','High protein'],['Lentils','Tomato','Garlic','Cumin','Turmeric'], 'Cook lentils until soft and pour over a hot garlic and cumin tempering.'],
  ['Chicken Curry','Indian','Curry','A home-style chicken curry with ginger, tomato, and spices.','https://images.squarespace-cdn.com/content/v1/59739d0ed2b857fb9af8f717/1521910013180-8HGP73UDWT315D0H7DRF/chicken-curry.jpg',50,'Medium',['High protein','Gluten free'],['Chicken','Onion','Tomato','Ginger','Coriander'], 'Brown chicken and simmer gently in an onion, tomato, and spice gravy.'],
  ['Goan Fish Curry','Indian','Curry','Tangy coastal fish curry with coconut and tamarind.','https://img.onmanorama.com/content/dam/mm/en/food/around-the-world/images/2019/11/25/goan-fish-curry.jpg?h=583&w=1120',35,'Medium',['High protein','Dairy free'],['White fish','Coconut milk','Tamarind','Chili','Turmeric'], 'Poach fish gently in a coconut-tamarind curry sauce.'],
  ['Egg Curry','Indian','Curry','Boiled eggs nestled in a warmly spiced onion gravy.','https://cdn.tarladalal.com/media/egg_curry.webp',30,'Easy',['High protein','Budget friendly'],['Eggs','Tomato','Onion','Ginger','Garam masala'], 'Simmer halved boiled eggs in a thick, fragrant masala sauce.'],
  ['Mutton Rogan Josh','Indian','Curry','Kashmiri-style slow-braised lamb with aromatic spices.','photo-1544025162-d76694265947',100,'Medium',['High protein','Gluten free'],['Lamb','Yogurt','Kashmiri chili','Fennel','Ginger'], 'Braise lamb slowly with yogurt and spices until fork tender.'],
  ['Chicken 65','Indian','Snack','Crispy, tangy, chili-kissed bites of South Indian chicken.','https://onestophalal.com/cdn/shop/articles/chicken_65_recipe_800x.jpg?v=1728185058',40,'Medium',['High protein','Spicy'],['Chicken','Yogurt','Rice flour','Curry leaves','Chili'], 'Marinate chicken, fry until crisp, then toss with curry leaves and chili.'],
  ['Pav Bhaji','Indian','Street food','Buttery mashed vegetables with toasted rolls and lemon.','photo-1606491956689-2ea866880c84',40,'Easy',['Vegetarian','Street food'],['Potato','Cauliflower','Peas','Tomato','Pav bhaji masala','Pav rolls','Butter'], 'Mash simmered vegetables with spices and serve with buttered rolls.'],
  ['Idli Sambar','Indian','Breakfast','Soft steamed rice cakes with a hearty lentil-vegetable stew.','photo-1589301760014-d929f3979dbc',55,'Medium',['Vegan','South Indian'],['Rice','Urad dal','Lentils','Carrot','Drumstick'], 'Steam fermented idli batter and serve with vegetable sambar.'],
  ['Lemon Rice','Indian','Rice','Bright South Indian rice with lemon, curry leaves, and peanuts.','photo-1512058564366-18510be2db19',25,'Easy',['Vegan','Quick meal'],['Rice','Lemon','Peanuts','Curry leaves','Turmeric'], 'Toss cooked rice through a lemony mustard-seed and peanut tempering.'],
  ['Paneer Butter Masala','Indian','Curry','Paneer cubes in a mellow, creamy tomato-cashew sauce.','https://www.cookwithmanali.com/wp-content/uploads/2019/05/Paneer-Butter-Masala-500x500.jpg',40,'Easy',['Vegetarian','High protein'],['Paneer','Tomato','Cashews','Cream','Butter'], 'Simmer paneer in a smooth tomato-cashew gravy and finish with cream.'],
  ['Margherita Pizza','Italian','Pizza','A simple classic with tomato, mozzarella, and fragrant basil.','photo-1574071318508-1cdbab80d002',30,'Easy',['Vegetarian','Quick meal'],['Pizza dough','Tomato','Mozzarella','Basil','Olive oil'], 'Top stretched dough with tomato and mozzarella, then bake until bubbling.'],
  ['Pasta Alfredo','Italian','Pasta','Silky parmesan cream sauce clinging to tender pasta.','https://cdn.apartmenttherapy.info/image/upload/f_auto%2Cq_auto%3Aeco%2Cw_730/k%2FPhoto%2FRecipes%2F2025-01-fettucini-alfredo%2FFettuccine-Alfredo-0781-1',25,'Easy',['Vegetarian','Quick meal'],['Pasta','Cream','Parmesan','Butter','Black pepper'], 'Toss hot pasta with butter, cream, and parmesan until glossy.'],
  ['Vegetable Lasagna','Italian','Pasta','Layered pasta, roasted vegetables, tomato, and bubbling cheese.','photo-1574894709920-11b28e7367e3',75,'Medium',['Vegetarian','Comfort food'],['Lasagna sheets','Zucchini','Tomato','Ricotta','Mozzarella'], 'Layer pasta sheets with vegetables and sauces, then bake until golden.'],
  ['Chicken Tacos','Mexican','Tacos','Warm tortillas filled with smoky chicken and crunchy salsa.','https://tastesbetterfromscratch.com/wp-content/uploads/2023/05/Grilled-Chicken-Street-Tacos-1.jpg',30,'Easy',['High protein','Quick meal'],['Chicken','Tortillas','Avocado','Lime','Paprika'], 'Season and sear chicken, then tuck into warm tortillas with salsa.'],
  ['Black Bean Enchiladas','Mexican','Casserole','Saucy enchiladas filled with black beans and melted cheese.','photo-1534352956036-cd81e27dd615',50,'Easy',['Vegetarian','High protein'],['Black beans','Tortillas','Tomato sauce','Cheddar','Corn'], 'Roll bean filling into tortillas, cover with sauce, and bake.'],
  ['Veg Fried Rice','Asian','Rice','Fast wok-tossed rice with crisp vegetables and soy.','photo-1603133872878-684f208fb84b',20,'Easy',['Vegetarian','Quick meal','One pan'],['Rice','Carrot','Peas','Eggs','Soy sauce'], 'Stir-fry vegetables and rice over high heat with soy sauce.'],
  ['Pad Thai','Thai','Noodles','Tamarind noodles tossed with tofu, egg, and crunchy peanuts.','photo-1559314809-0d155014e29e',35,'Medium',['Vegetarian','Quick meal'],['Rice noodles','Tofu','Eggs','Tamarind','Peanuts'], 'Toss softened noodles in tangy tamarind sauce with tofu and egg.'],
  ['Bibimbap','Korean','Rice','Colorful rice bowl with vegetables, egg, and gochujang.','photo-1498654896293-37aacf113fd9',40,'Easy',['Vegetarian','High protein'],['Rice','Spinach','Carrot','Eggs','Gochujang'], 'Arrange seasoned vegetables over rice and top with a fried egg.'],
  ['Greek Salad','Mediterranean','Salad','Cucumber, tomato, olives, and feta in a lemony dressing.','photo-1540420773420-3366772f4999',15,'Easy',['Vegetarian','Quick meal','No cook'],['Cucumber','Tomato','Feta','Olives','Lemon'], 'Toss chopped vegetables with olives, feta, and olive oil.'],
  ['Shakshuka','Mediterranean','Breakfast','Eggs poached in a gently spiced pepper and tomato sauce.','photo-1590412200988-a436970781fa',35,'Easy',['Vegetarian','One pan'],['Eggs','Tomato','Bell pepper','Onion','Paprika'], 'Simmer peppers and tomato, make wells, then poach eggs in the sauce.'],
  ['Falafel Bowl','Middle Eastern','Bowl','Crisp herby chickpea falafel with greens and tahini.','https://slimmingviolet.com/wp-content/uploads/2024/07/falafel-hummus-bowl.png',40,'Medium',['Vegan','High protein'],['Chickpeas','Parsley','Cumin','Tahini','Cucumber'], 'Shape seasoned chickpeas into patties and pan-fry until crisp.'],
  ['Mac and Cheese','American','Pasta','Creamy stovetop macaroni with sharp cheddar.','photo-1543339494-b4cd4f7ba686',25,'Easy',['Vegetarian','Comfort food'],['Macaroni','Cheddar','Milk','Butter','Mustard'], 'Fold cooked macaroni into a smooth cheddar sauce.'],
  ['Grilled Salmon','American','Seafood','Lemon-herb salmon with a lightly crisp edge.','photo-1467003909585-2f8a72700288',25,'Easy',['High protein','Gluten free'],['Salmon','Lemon','Dill','Olive oil','Black pepper'], 'Season salmon and grill until just opaque and flaky.'],
  ['Mushroom Risotto','Italian','Rice','Creamy arborio rice with earthy mushrooms and parmesan.','photo-1476124369491-e7addf5db371',45,'Medium',['Vegetarian','Comfort food'],['Arborio rice','Mushrooms','Stock','Parmesan','Butter'], 'Stir warm stock into toasted rice a ladle at a time.'],
  ['Chicken Noodle Soup','American','Soup','Cozy broth with tender chicken, noodles, and vegetables.','https://hips.hearstapps.com/hmg-prod/images/chicken-noodle-soup-lead-644c2bec7f4e6.jpg?crop=1xw%3A1xh%3Bcenter%2Ctop',45,'Easy',['High protein','Comfort food'],['Chicken','Egg noodles','Carrot','Celery','Stock'], 'Simmer chicken and vegetables in broth, then add noodles.'],
  ['Mango Lassi','Indian','Drink','A cool mango-yogurt drink with a touch of cardamom.','https://www.indianhealthyrecipes.com/wp-content/uploads/2022/04/mango-lassi-recipe.jpg',10,'Easy',['Vegetarian','Quick meal'],['Mango','Yogurt','Milk','Cardamom','Honey'], 'Blend ripe mango with yogurt, milk, and cardamom until smooth.'],
 ];

const tagCopy:Record<string,string>={'High protein':'protein-rich','Quick meal':'quick','Vegan':'plant-based','Vegetarian':'meat-free','Comfort food':'comforting','One pan':'easy one-pan','Gluten free':'gluten-free','Budget friendly':'budget-friendly','Weekend favorite':'weekend-worthy','Dairy free':'dairy-free','Healthy':'light and nourishing','Beginner friendly':'beginner-friendly'};
export const discoverRecipes: Recipe[] = raw.map((r, i) => {
  const prep=Math.max(5,Math.min(20,Math.round(r[5]*.25/5)*5));
  const qualities=r[7].map(tag=>tagCopy[tag]).filter(Boolean).slice(0,2);
  const description=`${r[3]} ${qualities.length?`It’s a ${qualities.join(', ')} ${r[2].toLowerCase()}, with ${r[8].slice(0,3).join(', ').toLowerCase()} bringing the main flavors together.`:`A ${r[1]}-inspired ${r[2].toLowerCase()} with ${r[8].slice(0,3).join(', ').toLowerCase()} at its heart.`}`;
  const servings=i===0?4:2;
  const details=staticRecipeDetails(r[0],r[8],servings,r[5]);
  return {
    id:`discover-${i+1}`,title:r[0],cuisine:r[1],category:r[2],mealType:/breakfast|poha|paratha|dosa/i.test(`${r[0]} ${r[2]}`)?'Breakfast':/dessert|cake|sweet|lassi/i.test(`${r[0]} ${r[2]}`)?'Snack / Dessert':/snack|starter/i.test(r[2])?'Snack':'Lunch / Dinner',description,
    image:r[4],minutes:r[5],prepMinutes:prep,cookMinutes:r[5]-prep,difficulty:r[6],tags:r[7],ingredients:r[8],servings,
    ingredientDetails:details.ingredientDetails,preparationSteps:details.preparationSteps,steps:details.preparationSteps.map(step=>step.description),
    nutrition:null,
  };
});
