import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

function validHmac(raw:string,received:string|null,secret:string){
  if(!received)return false;
  const expected=createHmac("sha256",secret).update(raw,"utf8").digest("base64");
  const a=Buffer.from(expected);const b=Buffer.from(received);
  return a.length===b.length&&timingSafeEqual(a,b);
}

function refresh(path:string){revalidatePath(path);revalidatePath("/zh"+(path==="/"?"":path));}

export async function POST(request:NextRequest){
  const secret=process.env.SHOPIFY_WEBHOOK_SECRET;
  if(!secret)return NextResponse.json({error:"Webhook secret is not configured."},{status:503});
  const raw=await request.text();
  if(!validHmac(raw,request.headers.get("x-shopify-hmac-sha256"),secret))return NextResponse.json({error:"Invalid signature."},{status:401});
  const topic=request.headers.get("x-shopify-topic")||"";
  const payload=JSON.parse(raw||"{}");
  refresh("/");
  if(topic.startsWith("products/")){
    if(payload.handle)refresh("/products/"+payload.handle);
    ["/units","/parts","/brands"].forEach(refresh);
  }else if(topic.startsWith("collections/")){
    ["/units","/parts"].forEach(refresh);
  }else if(topic.startsWith("articles/")||topic.startsWith("blogs/")){
    refresh("/guides");
    if(payload.handle)refresh("/guides/"+payload.handle);
  }
  return NextResponse.json({ok:true});
}