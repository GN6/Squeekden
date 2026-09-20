import {NextResponse} from 'next/server';
import {boroughs,type Borough} from '../../../lib/rats';
export const runtime='nodejs';
const jobs=['Director of Strategic Crumb Acquisition','VP of Underground Logistics','Chief Cheese Officer','Head of Dumpster Intelligence','Senior Tunnel Infrastructure Architect','Associate, Alternative Snacks'];
const companies=['Goldman Snacks','McSqueak & Company','Dumpster & Co.','SewerX','The Crumb Group','Ratventure Capital'];
const skills=['Cross-functional Nibbling','Cheese Arbitrage','Agile Scavenging','Stakeholder Squeaking','Urban Foraging','Operational Resilience'];
function fallback(name:string,borough:Borough,neighborhood:string,seed:number){const job=jobs[seed%jobs.length],company=companies[(seed+2)%companies.length];return {name,title:job,company,borough,neighborhood,skills:[skills[seed%skills.length],skills[(seed+2)%skills.length],'Microsoft Excel'],about:`${job} at ${company}. Based in ${neighborhood}, ${borough}. I turn overlooked crumbs into scalable opportunities. Open to networking, mentorship and unattended pizza.`,post:`I’m humbled to announce that I’ve accepted a new role as ${job} at ${company}. The road from basement to boardroom wasn't easy. Huge thanks to everyone who believed in me when I was just a tiny rat with a big dream. 🧀 #OpenToWork #GrowthMindset #Squeekden`,source:'template' as const};}
export async function POST(req:Request){
 let input:Record<string,unknown>;try{input=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const name=String(input.name||'Anonymous Rat').trim().slice(0,60)||'Anonymous Rat';
 const borough=boroughs.find(b=>b===input.borough)||'Allston';
 const neighborhood=String(input.neighborhood||borough).trim().slice(0,65)||borough;
 const seed=[...`${name}${borough}${neighborhood}`].reduce((a,c)=>a+c.charCodeAt(0),0);
 const sample=fallback(name,borough,neighborhood,seed);
 if(!process.env.OPENAI_API_KEY)return NextResponse.json(sample);
 try{
 const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',temperature:.85,response_format:{type:'json_object'},messages:[{role:'system',content:'Generate a hilarious but workplace-safe FICTIONAL rat LinkedIn profile. Output JSON with keys title,company,skills (array of 3 strings),about,post. Never claim a real animal was identified from an address. Keep funny and concise. No real individual impersonation. Avoid markdown.'},{role:'user',content:`Rat name: ${name}. Neighborhood: ${borough}. Neighborhood: ${neighborhood}. Make locality relevant, absurdly earnest LinkedIn voice.`}]}),signal:AbortSignal.timeout(14000)});
 if(!res.ok)throw Error(`AI provider ${res.status}`);
 const json=await res.json();const output=JSON.parse(json.choices?.[0]?.message?.content||'{}');
 const clean=(v:unknown,max:number,defaultValue:string)=>typeof v==='string'&&v.trim()?v.trim().slice(0,max):defaultValue;
 return NextResponse.json({...sample,title:clean(output.title,110,sample.title),company:clean(output.company,80,sample.company),about:clean(output.about,600,sample.about),post:clean(output.post,650,sample.post),skills:Array.isArray(output.skills)?output.skills.filter((s:unknown)=>typeof s==='string').slice(0,3).map((s:string)=>s.slice(0,45)):sample.skills,source:'ai'});
 }catch{return NextResponse.json({...sample,message:'AI unavailable; generated from creative local template.'});}
}
