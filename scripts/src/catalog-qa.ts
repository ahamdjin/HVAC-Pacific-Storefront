export {};

type Metafield = { key: string; value: string } | null;
type Product = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { nodes: Array<{ id: string; sku: string | null }> };
  metafields: Metafield[];
};

type Result = { level: "PASS" | "FAIL" | "WARN"; product?: string; check: string; detail: string };

const UNIT_CATEGORIES = new Set(["AC + Furnace Systems","Heat Pump Systems","Packaged Units","Ductless Mini Splits","Mini Split Systems"]);

function config() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//,"").replace(/\/$/,"");
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) throw new Error("SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN are required.");
  return { domain, token };
}

async function storefrontRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const {domain,token}=config();
  const response=await fetch(`https://${domain}/api/2026-10/graphql.json`,{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":token},
    body:JSON.stringify({query,variables}),
    signal:AbortSignal.timeout(30_000),
  });
  const payload=await response.json() as {data?:T;errors?:Array<{message:string}>};
  if(!response.ok||payload.errors?.length||!payload.data)throw new Error(`Storefront API error: ${JSON.stringify(payload.errors??payload)}`);
  return payload.data;
}

function mapMeta(product:Product){
  return Object.fromEntries(product.metafields.filter((x):x is NonNullable<Metafield>=>Boolean(x)).map(x=>[x.key,x.value]));
}
function truthy(v?:string){return v==="true"||v==="1";}
function normalize(v:string){return v.toLowerCase().replace(/[^a-z0-9]+/g,"");}
function add(results:Result[],level:Result["level"],product:string|undefined,check:string,detail:string){results.push({level,product,check,detail});}

async function fetchProducts(){
  const query=`
    query QA {
      products(first:250,sortKey:TITLE){
        nodes{
          id handle title vendor availableForSale
          featuredImage{url}
          priceRange{minVariantPrice{amount currencyCode}}
          variants(first:20){nodes{id sku}}
          metafields(identifiers:[
            {namespace:"specs",key:"site_status"},
            {namespace:"specs",key:"site_category"},
            {namespace:"specs",key:"outdoor_model"},
            {namespace:"specs",key:"indoor_model"},
            {namespace:"specs",key:"furnace_model"},
            {namespace:"specs",key:"requires_epa608"},
            {namespace:"specs",key:"requires_licensed_install"},
            {namespace:"specs",key:"three_phase"},
            {namespace:"specs",key:"prop65"}
          ]){key value}
        }
      }
    }`;
  return (await storefrontRequest<{products:{nodes:Product[]}}>(query)).products.nodes;
}

function jsonLdBlocks(html:string){
  const blocks:unknown[]=[];
  const pattern=/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for(const match of html.matchAll(pattern)){
    try{blocks.push(JSON.parse(match[1]));}catch{}
  }
  return blocks;
}
function findType(value:unknown,type:string):Record<string,unknown>|null{
  if(!value||typeof value!=="object")return null;
  const object=value as Record<string,unknown>;
  if(object["@type"]===type)return object;
  const graph=object["@graph"];
  if(Array.isArray(graph)){
    for(const item of graph){const found=findType(item,type);if(found)return found;}
  }
  return null;
}
function visibleText(html:string){
  return html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
}

async function checkRenderedPage(base:string,product:Product,results:Result[]){
  const path=`/products/${product.handle}`;
  const response=await fetch(base+path,{redirect:"manual",signal:AbortSignal.timeout(20_000)});
  const meta=mapMeta(product);
  const blocked=["HOLD","NEEDS DATA"].includes((meta.site_status||"").trim().toUpperCase());
  if(blocked){
    if(response.status===404)add(results,"PASS",product.title,"Blocked PDP","HOLD / NEEDS DATA product returns 404.");
    else add(results,"FAIL",product.title,"Blocked PDP",`Blocked product returned HTTP ${response.status} instead of 404.`);
    return;
  }
  if(!response.ok){add(results,"FAIL",product.title,"Rendered PDP",`${path} returned HTTP ${response.status}`);return;}
  const html=await response.text();
  const canonical=`<link rel="canonical" href="${base}${path}"`;
  if(!html.includes(canonical)&&!html.includes(`href="${path}" rel="canonical"`))add(results,"FAIL",product.title,"Canonical","Canonical link is missing or unexpected.");
  else add(results,"PASS",product.title,"Canonical","Self-referencing canonical present.");

  const blocks=jsonLdBlocks(html);
  const schema=blocks.map((block)=>findType(block,"Product")).find(Boolean);
  if(!schema){
    add(results,"FAIL",product.title,"Product schema","Product JSON-LD not found.");
  }else{
    const offer=typeof schema.offers==="object"&&schema.offers?schema.offers as Record<string,unknown>:null;
    const required=[
      ["name",schema.name],["url",schema.url],["offers.price",offer?.price],["offers.priceCurrency",offer?.priceCurrency],
      ["offers.availability",offer?.availability],["offers.itemCondition",offer?.itemCondition],["offers.seller",offer?.seller],
    ];
    const missing=required.filter(([,value])=>!value).map(([key])=>key);
    if(missing.length)add(results,"FAIL",product.title,"Product schema",`Missing required fields: ${missing.join(", ")}`);
    else add(results,"PASS",product.title,"Product schema","Product/Offer JSON-LD contains the required commerce fields.");
    if(JSON.stringify(schema).includes('"AggregateRating"')||JSON.stringify(schema).includes('"Review"')){
      add(results,"FAIL",product.title,"Trust signals","Unexpected review/rating schema found.");
    }
  }

  const modelCandidates=[meta.outdoor_model,meta.indoor_model,meta.furnace_model,...product.variants.nodes.map((variant)=>variant.sku||"")].filter(Boolean);
  const meaningful=modelCandidates.find((value)=>normalize(value).length>=4);
  const h1Match=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1=visibleText(h1Match?.[1]||"");
  if(!h1)add(results,"FAIL",product.title,"H1","No H1 found in server-rendered HTML.");
  else if(meaningful&&!normalize(h1).includes(normalize(meaningful)))add(results,"FAIL",product.title,"H1 model",`H1 does not include model/SKU ${meaningful}.`);
  else add(results,"PASS",product.title,"H1","Server-rendered product H1 includes the expected model/SKU.");

  const text=visibleText(html).toLowerCase();
  const banned=["best price guaranteed","authorized dealer","#1 hvac","countdown timer"];
  const found=banned.find((phrase)=>text.includes(phrase));
  if(found)add(results,"FAIL",product.title,"Trust signals",`Prohibited claim found: ${found}`);
}

async function main(){
  const products=await fetchProducts();
  const results:Result[]=[];
  if(!products.length)add(results,"WARN",undefined,"Catalog","No products are currently published through the Storefront API.");

  for(const product of products){
    const m=mapMeta(product);
    const status=(m.site_status||"").toUpperCase();
    const price=Number(product.priceRange.minVariantPrice.amount);
    const category=m.site_category||"";

    if(!product.featuredImage)add(results,"FAIL",product.title,"Image","Published product has no featured image.");
    else add(results,"PASS",product.title,"Image","Featured image present.");

    if(!Number.isFinite(price)||price<=0)add(results,"FAIL",product.title,"Price",`Invalid published price: ${product.priceRange.minVariantPrice.amount}`);
    else add(results,"PASS",product.title,"Price",`${price.toFixed(2)} ${product.priceRange.minVariantPrice.currencyCode}`);

    if(["HOLD","NEEDS DATA"].includes(status))add(results,"FAIL",product.title,"Publication status",`Published product has specs.site_status=${status}`);
    else add(results,"PASS",product.title,"Publication status",status||"No blocking status.");

    if(UNIT_CATEGORIES.has(category)&&!truthy(m.requires_licensed_install))add(results,"FAIL",product.title,"Installer gate","Unit is missing requires_licensed_install=true.");
    if(/refrigerant/i.test(category)&&!truthy(m.requires_epa608))add(results,"FAIL",product.title,"EPA 608 gate","Refrigerant product is missing requires_epa608=true.");

    const modelCandidates=[m.outdoor_model,m.indoor_model,m.furnace_model,...product.variants.nodes.map(v=>v.sku||"")].filter(Boolean);
    const meaningful=modelCandidates.find(v=>normalize(v).length>=4);
    if(meaningful&&!normalize(product.title).includes(normalize(meaningful)))add(results,"FAIL",product.title,"Model in title",`Title does not include model/SKU ${meaningful}.`);
    else if(meaningful)add(results,"PASS",product.title,"Model in title",`Title includes ${meaningful}.`);
    else add(results,"FAIL",product.title,"Model in title","No model number or SKU is available to verify against the title.");
  }

  const base=(process.env.QA_SITE_URL||"").replace(/\/$/,"");
  if(base){
    for(const product of products)await checkRenderedPage(base,product,results);
    const filtered=await fetch(base+"/units?brand=qa-test",{signal:AbortSignal.timeout(20_000)});
    if(filtered.ok){
      const html=await filtered.text();
      if(/<meta[^>]+name="robots"[^>]+content="noindex,follow"/i.test(html)||/<meta[^>]+content="noindex,follow"[^>]+name="robots"/i.test(html))add(results,"PASS",undefined,"Filtered URL robots","Filtered category URL is noindex,follow.");
      else add(results,"FAIL",undefined,"Filtered URL robots","Filtered category URL did not expose noindex,follow.");
    }else add(results,"WARN",undefined,"Filtered URL robots",`Unable to verify; HTTP ${filtered.status}`);
  } else {
    add(results,"WARN",undefined,"Rendered-page QA","Set QA_SITE_URL to verify PDP canonical, H1, schema, and filtered URL robots.");
  }

  const fails=results.filter(r=>r.level==="FAIL");
  const warnings=results.filter(r=>r.level==="WARN");
  for(const result of results){
    console.log(`[${result.level}] ${result.product?result.product+" — ":""}${result.check}: ${result.detail}`);
  }
  console.log(`\nCatalog QA: ${products.length} published products · ${fails.length} failures · ${warnings.length} warnings`);
  if(fails.length)process.exitCode=1;
}

await main();
