import {NextResponse} from 'next/server';
import {boroughs,type Borough} from '../../../lib/rats';
import {DATASET,fallback,normalizedBorough,type RatData,type Sighting,type Month} from '../../../lib/ratconomy';
export const runtime='nodejs';export const revalidate=3600;
type BostonCase={service_name?:string;service_code?:string;description?:string;address?:string;requested_datetime?:string;lat?:string|number;long?:string|number;latitude?:string|number;longitude?:string|number;zipcode?:string;zip?:string};
export async function GET(){
 const end=new Date();const start=new Date(end.getTime()-89*86400000);
 const startDay=start.toISOString().slice(0,10),endDay=end.toISOString().slice(0,10);
 // Boston's official Open311 supports q, per_page <= 300, page, and <=90-day date windows.
 // This app caps at 8 pages / 2400 cases so it cannot claim to be a citywide census.
 try{
 const records:BostonCase[]=[];let truncated=false;
 for(let page=1;page<=8;page++){
  const params=new URLSearchParams({start_date:startDay,end_date:endDay,q:'Rodent Activity',per_page:'300',page:String(page)});
  const response=await fetch(`${DATASET}?${params}`,{next:{revalidate:3600},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error(`Boston Open311 HTTP ${response.status}`);
  const rows:unknown=await response.json();if(!Array.isArray(rows))throw Error('Unexpected Boston Open311 response');
  records.push(...rows as BostonCase[]);
  if(rows.length<300)break;
  if(page===8)truncated=true;
 }
 const counts=Object.fromEntries(boroughs.map(b=>[b,0])) as Record<Borough,number>;
 const months=new Map<string,number>();const points:Sighting[]=[];let matching=0,ungrouped=0;
 for(const r of records){
  // q performs full-text search; keep ONLY service names that match rodent activity.
  if(!/rodent activity/i.test(r.service_name||''))continue;
  matching++;
  const date=(r.requested_datetime||'').slice(0,10),month=date.slice(0,7);
  if(/^\d{4}-\d{2}$/.test(month))months.set(month,(months.get(month)||0)+1);
  const lat=Number(r.lat??r.latitude),lon=Number(r.long??r.longitude);
  const group=normalizedBorough(r.address,lat,lon);
  if(group)counts[group]++;else ungrouped++;
  if(group&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>42.22&&lat<42.42&&lon> -71.2&&lon< -70.97&&points.length<450)points.push({latitude:lat,longitude:lon,borough:group,date,zip:r.zipcode||r.zip||''});
 }
 if(matching===0)throw Error('No Rodent Activity service requests returned');
 // Drop partial current month from projections, but display it in the monthly history with caveat.
 const monthly:Month[]=[...months].sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count}));
 const message=`Boston Open311 Rodent Activity requests from a rolling 90-day window; ${matching} matched records. ${ungrouped} reports outside the eight selected neighborhood groups or without usable geography are excluded from group totals. Neighborhood assignment may be approximate. ${truncated?'CAUTION: capped at 2,400 fetched search results; counts and trends are incomplete.':''}`;
 const result:RatData={counts,points,monthly,source:'live',updatedAt:new Date().toISOString(),periodStart:startDay,periodEnd:endDay,message,truncated};
 return NextResponse.json(result);
 }catch(err){return NextResponse.json({...fallback,message:`${err instanceof Error?err.message:'Boston API unavailable'}. Illustrative demo data, NOT real sightings.`})}
}
