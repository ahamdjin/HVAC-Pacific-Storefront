import { adminRequest, assertNoUserErrors } from "./shopify-admin.js";
import { GUIDE_DRAFTS } from "./guide-drafts.js";

type UserError = { field?: string[] | null; message: string };
type Blog = { id: string; handle: string; title: string };
type ExistingArticle = { id: string; handle: string; title: string; isPublished: boolean; blog: { id: string; handle: string } };

async function getGuidesBlog(): Promise<Blog | null> {
  const query = `
    query Blogs {
      blogs(first:50) { nodes { id handle title } }
    }`;
  const data = await adminRequest<{ blogs: { nodes: Blog[] } }>(query);
  return data.blogs.nodes.find((blog) => blog.handle === "guides") ?? null;
}

async function createGuidesBlog() {
  const mutation = `
    mutation CreateBlog($blog:BlogCreateInput!) {
      blogCreate(blog:$blog) {
        blog { id handle title }
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{
    blogCreate: { blog: Blog | null; userErrors: UserError[] };
  }>(mutation, { blog: { title: "Guides", handle: "guides" } });
  assertNoUserErrors(data.blogCreate.userErrors, "blogCreate guides");
  if (!data.blogCreate.blog) throw new Error("Shopify returned no Guides blog after creation.");
  return data.blogCreate.blog;
}

async function findArticle(handle: string, blogId: string) {
  const query = `
    query Articles($query:String!) {
      articles(first:10, query:$query) {
        nodes { id handle title isPublished blog { id handle } }
      }
    }`;
  const data = await adminRequest<{ articles: { nodes: ExistingArticle[] } }>(
    query,
    { query: `handle:${handle}` },
  );
  return data.articles.nodes.find((article) => article.handle === handle && article.blog.id === blogId) ?? null;
}

async function createArticle(blogId: string, draft: (typeof GUIDE_DRAFTS)[number]) {
  const mutation = `
    mutation CreateArticle($article:ArticleCreateInput!) {
      articleCreate(article:$article) {
        article { id handle title isPublished }
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{
    articleCreate: {
      article: { id: string; handle: string; title: string; isPublished: boolean } | null;
      userErrors: UserError[];
    };
  }>(mutation, {
    article: {
      blogId,
      title: draft.title,
      handle: draft.handle,
      body: draft.body,
      summary: draft.summary,
      tags: draft.tags,
      author: { name: "HVAC Pacific" },
      isPublished: false,
    },
  });
  assertNoUserErrors(data.articleCreate.userErrors, `articleCreate ${draft.handle}`);
  if (!data.articleCreate.article) throw new Error(`No article returned for ${draft.handle}`);
  return data.articleCreate.article;
}

async function updateArticle(articleId: string, draft: (typeof GUIDE_DRAFTS)[number]) {
  const mutation = `
    mutation UpdateArticle($id:ID!,$article:ArticleUpdateInput!) {
      articleUpdate(id:$id,article:$article) {
        article { id handle title isPublished }
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{
    articleUpdate: {
      article: { id: string; handle: string; title: string; isPublished: boolean } | null;
      userErrors: UserError[];
    };
  }>(mutation, {
    id: articleId,
    article: {
      title: draft.title,
      handle: draft.handle,
      body: draft.body,
      summary: draft.summary,
      tags: draft.tags,
      author: { name: "HVAC Pacific" },
      isPublished: false,
    },
  });
  assertNoUserErrors(data.articleUpdate.userErrors, `articleUpdate ${draft.handle}`);
  if (!data.articleUpdate.article) throw new Error(`No article returned for ${draft.handle}`);
  return data.articleUpdate.article;
}

async function main() {
  const apply = process.argv.includes("--apply");

  if (!apply) {
    console.log("DRY RUN — no Shopify writes will be made.\n");
    for (const draft of GUIDE_DRAFTS) {
      console.log(`[DRAFT] ${draft.handle}\n  ${draft.title}\n  ${draft.summary}\n`);
    }
    console.log(`${GUIDE_DRAFTS.length} unpublished guide drafts are ready. Use --apply to sync them to Shopify.`);
    return;
  }

  let blog = await getGuidesBlog();
  if (!blog) {
    blog = await createGuidesBlog();
    console.log(`[CREATED] blog: ${blog.title} (${blog.handle})`);
  }

  let errors = 0;
  for (const draft of GUIDE_DRAFTS) {
    try {
      const existing = await findArticle(draft.handle, blog.id);
      if (existing?.isPublished) {
        console.log(`[PROTECTED] ${draft.handle}: already published; seed script will not overwrite reviewed live content.`);
        continue;
      }
      if (existing) {
        await updateArticle(existing.id, draft);
        console.log(`[UPDATED DRAFT] ${draft.handle}`);
      } else {
        await createArticle(blog.id, draft);
        console.log(`[CREATED DRAFT] ${draft.handle}`);
      }
    } catch (error) {
      errors += 1;
      console.error(`[ERROR] ${draft.handle}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\nAll seeded articles remain unpublished for editorial review.");
  if (errors) process.exitCode = 1;
}

await main();
