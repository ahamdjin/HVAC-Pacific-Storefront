import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hrefFor } from "@/components/paths";
import { SITE } from "@/config/site";
import { STATIC_PAGES } from "@/lib/static-pages";

type P={params:Promise<{locale:string;slug:string[]}>};

function keyFrom(slug:string[]){return slug.join("/");}

export async function generateMetadata({params}:P):Promise<Metadata>{
  const {locale,slug}=await params;
  const key=keyFrom(slug);
  const page=STATIC_PAGES[key];
  if(!page)return {};
  const path="/"+key;
  return {
    title:page.title+" | "+SITE.brand,
    description:page.description,
    robots:!page.reviewed||locale==="zh"?{index:false,follow:true}:undefined,
    alternates:{
      canonical:hrefFor(locale,path),
      languages:{"en-US":path,"zh-Hans":hrefFor("zh",path),"x-default":path},
    },
  };
}

export default async function StaticPage({params}:P){
  const {locale,slug}=await params;
  const key=keyFrom(slug);
  const page=STATIC_PAGES[key];
  if(!page)notFound();
  return (
    <main id="main">
      <div className="wrap page-shell narrow">
        <Breadcrumbs locale={locale} items={[{name:page.title,path:"/"+key}]} />
        {process.env.NODE_ENV!=="production"&&!page.reviewed&&<div className="draft-banner">DRAFT – pending review</div>}
        <header className="page-head">
          <p className="eyebrow">HVAC Pacific</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </header>
        <div className="policy-content">
          {page.sections.map((section,i)=><section key={i}>
            {section.heading&&<h2>{section.heading}</h2>}
            {section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}
          </section>)}
        </div>
      </div>
    </main>
  );
}