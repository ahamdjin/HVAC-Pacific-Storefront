import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string,{count:number;reset:number}>();
const WINDOW=60_000;
const LIMIT=6;

function clean(value:unknown,max=500){return typeof value==="string"?value.trim().slice(0,max):"";}
function validEmail(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}

export async function POST(request:NextRequest){
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now=Date.now();const current=hits.get(forwarded);
  if(current&&current.reset>now&&current.count>=LIMIT)return NextResponse.json({error:"Too many requests. Please call us if you need immediate help."},{status:429});
  hits.set(forwarded,current&&current.reset>now?{...current,count:current.count+1}:{count:1,reset:now+WINDOW});

  const body=await request.json().catch(()=>null);
  if(!body||clean(body.company_website))return NextResponse.json({ok:true});
  const type=body.type==="installer"?"installer":"contact";
  const name=clean(body.name,120),phone=clean(body.phone,40),email=clean(body.email,180),zip=clean(body.zip,10),message=clean(body.message,2000),language=clean(body.language,30),product=clean(body.product,300);
  if(!name||!phone||!validEmail(email)||body.consent!=="yes")return NextResponse.json({error:"Please complete the required contact fields."},{status:400});
  if(type==="installer"&&!/^\d{5}$/.test(zip))return NextResponse.json({error:"Enter a valid 5-digit ZIP code."},{status:400});

  const webhook=process.env.LEAD_WEBHOOK_URL;
  if(!webhook)return NextResponse.json({error:"Lead delivery is not configured. Please call us instead."},{status:503});

  const response=await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,name,phone,email,zip:zip||undefined,language:language||undefined,product:product||undefined,message:message||undefined,source:"hvacpacific.com",submittedAt:new Date().toISOString()}),signal:AbortSignal.timeout(10_000)});
  if(!response.ok)return NextResponse.json({error:"We could not send your request. Please call us instead."},{status:502});
  return NextResponse.json({ok:true});
}