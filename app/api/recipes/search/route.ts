import { NextRequest, NextResponse } from 'next/server';

type WebItem = { title?:string; url?:string; description?:string; thumbnail?:{src?:string}; profile?:{long_name?:string} };
type Meal = { idMeal?:string; strMeal?:string; strMealThumb?:string; strInstructions?:string; strSource?:string; strArea?:string; strCategory?:string };
type Result = {id:string;title:string;source:string;url:string;snippet:string;image:string;cuisine:string;category:string;canonical:string};
const denied=['instagram.com','pinterest.','youtube.com','youtu.be','tiktok.com','facebook.com'];
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function urlInfo(raw?:string){try{if(!raw)return null;const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||denied.some(host=>u.hostname.toLowerCase().includes(host))||u.pathname==='/')return null;return{url:u.toString(),canonical:`${u.origin}${u.pathname}`.replace(/\/$/,'')}}catch{return null}}
function safeImage(raw?:string){try{const u=new URL(raw||'');return u.protocol==='https:'?u.toString():''}catch{return''}}
function mapWeb(item:WebItem,q:string):Result|null{const info=urlInfo(item.url),title=item.title?.trim(),snippet=item.description?.replace(/\s+/g,' ').trim()||'';if(!info||!title||(!/recipe/i.test(title)&&!/recipe/i.test(snippet)))return null;const terms=normalize(q).split(' ').filter(x=>x.length>2);const text=normalize(`${title} ${snippet}`);if(terms.length&&terms.filter(x=>text.includes(x)).length/terms.length<.5)return null;return{id:info.canonical,title,source:item.profile?.long_name||new URL(info.url).hostname.replace(/^www\./,''),url:info.url,snippet:snippet.slice(0,250),image:safeImage(item.thumbnail?.src),cuisine:'',category:'',canonical:info.canonical}}
function mapMeal(meal:Meal,q:string):Result|null{const info=urlInfo(meal.strSource),title=meal.strMeal?.trim();if(!info||!title)return null;const terms=normalize(q).split(' ').filter(x=>x.length>2),text=normalize(title);if(terms.length&&terms.filter(x=>text.includes(x)).length/terms.length<.5)return null;return{id:meal.idMeal||info.canonical,title,source:new URL(info.url).hostname.replace(/^www\./,''),url:info.url,snippet:(meal.strInstructions||'').replace(/\s+/g,' ').trim().slice(0,230),image:safeImage(meal.strMealThumb),cuisine:meal.strArea||'',category:meal.strCategory||'',canonical:info.canonical}}
function unique(items:Array<Result|null>){const seen=new Set<string>();return items.filter((r):r is Result=>{if(!r||seen.has(r.canonical))return false;seen.add(r.canonical);return true}).slice(0,8).map(({canonical,...r})=>r)}

export async function GET(request:NextRequest){
  const query=request.nextUrl.searchParams.get('q')?.trim().replace(/\s+/g,' ')||'';
  if(!query)return NextResponse.json({error:'Enter a recipe name.'},{status:400});
  if(query.length>120)return NextResponse.json({error:'Search for a shorter recipe name.'},{status:400});
  const braveKey=process.env.BRAVE_SEARCH_API_KEY;
  if(braveKey){
    try{
      const endpoint=new URL('https://api.search.brave.com/res/v1/web/search');endpoint.searchParams.set('q',`${query} recipe -site:instagram.com -site:pinterest.com -site:youtube.com -site:tiktok.com`);endpoint.searchParams.set('count','20');endpoint.searchParams.set('safesearch','moderate');
      const response=await fetch(endpoint,{headers:{Accept:'application/json','X-Subscription-Token':braveKey},next:{revalidate:300},signal:AbortSignal.timeout(9000)});
      if(response.ok){const payload=await response.json() as {web?:{results?:WebItem[]}};const results=unique((payload.web?.results||[]).map(x=>mapWeb(x,query)));if(results.length)return NextResponse.json({results,attribution:'Brave Search'},{headers:{'Cache-Control':'s-maxage=300, stale-while-revalidate=600'}})}
    }catch{/* Fall through to the public recipe catalogue if web search is unavailable. */}
  }
  try{
    const key=process.env.THEMEALDB_API_KEY||'1';const endpoint=`https://www.themealdb.com/api/json/v1/${encodeURIComponent(key)}/search.php?s=${encodeURIComponent(query)}`;
    const response=await fetch(endpoint,{next:{revalidate:300},signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw new Error(`MealDB returned ${response.status}`);
    const payload=await response.json() as {meals?:Meal[]|null};
    return NextResponse.json({results:unique((payload.meals||[]).map(x=>mapMeal(x,query))),attribution:'TheMealDB'},{headers:{'Cache-Control':'s-maxage=300, stale-while-revalidate=600'}})
  }catch(error){
    console.error('Recipe search provider unavailable:',error instanceof Error?error.message:'Unknown provider error');
    return NextResponse.json({error:'Recipe search is temporarily unreachable. Check your internet connection or configure BRAVE_SEARCH_API_KEY in .env.local, then try again.'},{status:502})
  }
}
