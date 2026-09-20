import {boroughs,demoCounts,type Borough} from './rats';
export const DATASET='https://311.boston.gov/open311/v2/requests.json';
export const DATASET_PAGE='https://data.boston.gov/dataset/311-service-requests';
export type Sighting={latitude:number;longitude:number;borough:Borough;date:string;zip:string};
export type Month={month:string;count:number};
export type RatData={counts:Record<Borough,number>;source:'live'|'demo';updatedAt:string|null;periodStart:string;periodEnd:string;points:Sighting[];monthly:Month[];message?:string;truncated?:boolean};
export const samplePoints:Sighting[]=[
[42.354,-71.132,'Allston'],[42.35,-71.085,'Back Bay'],[42.359,-71.067,'Beacon Hill'],[42.299,-71.067,'Dorchester'],[42.375,-71.039,'East Boston'],[42.309,-71.111,'Jamaica Plain'],[42.33,-71.084,'Roxbury'],[42.336,-71.047,'South Boston']
].map(([latitude,longitude,borough],i)=>({latitude:Number(latitude),longitude:Number(longitude),borough:borough as Borough,zip:'',date:`2025-0${i+1}-15`}));
export const emptyMonthly:Month[]=[{month:'2025-04',count:174},{month:'2025-05',count:199},{month:'2025-06',count:233}];
export const fallback:RatData={counts:demoCounts,source:'demo',updatedAt:null,periodStart:'2025-04-01',periodEnd:'2025-06-30',points:samplePoints,monthly:emptyMonthly,message:'Boston Open311 unavailable; ALL sample counts, months and dots are fictional demo data.'};
// Neighborhood groups are an intentionally limited set of Boston areas, NOT all city neighborhoods.
const centers:Record<Borough,[number,number]>={Allston:[42.353,-71.132],'Back Bay':[42.350,-71.083],'Beacon Hill':[42.358,-71.069],Dorchester:[42.300,-71.067],'East Boston':[42.375,-71.035],'Jamaica Plain':[42.309,-71.112],Roxbury:[42.326,-71.088],'South Boston':[42.335,-71.045]};
export function normalizedBorough(address:string|undefined,lat:number,lon:number):Borough|null{
 const s=(address||'').toLowerCase();
 for(const b of boroughs)if(s.includes(b.toLowerCase()))return b;
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<42.22||lat>42.42||lon< -71.20||lon> -70.97)return null;
 const candidate=boroughs.map(b=>({b,d:Math.hypot((lat-centers[b][0])*69,(lon-centers[b][1])*51)})).sort((a,c)=>a.d-c.d)[0];
 // Nearest-center approximations only close to one of our selected neighborhoods.
 return candidate.d<1.25?candidate.b:null;
}
export type Forecast={month:string;count:number;lower:number;upper:number};
export function forecast(months:Month[]):Forecast[]{const series=months.filter(m=>/^\d{4}-\d{2}$/.test(m.month)&&Number.isFinite(m.count)).sort((a,b)=>a.month.localeCompare(b.month));if(series.length<2)return [];const last=series.slice(-3);const baseline=last.reduce((a,m)=>a+m.count,0)/last.length;const [y,m]=last[last.length-1].month.split('-').map(Number);return Array.from({length:3},(_,i)=>{const d=new Date(Date.UTC(y,m+i,1));const n=Math.round(baseline);return{month:d.toISOString().slice(0,7),count:n,lower:Math.round(n*.75),upper:Math.round(n*1.25)}})}
