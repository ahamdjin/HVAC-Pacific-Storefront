module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScaffoldPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.8_@types+node@25.9.6_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.8_@types+node@25.9.6_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$14$2e$9_$40$swc$2b$helpers$40$0$2e$5$2e$23_$40$types$2b$react$40$19$2e$3$2e$0_next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_cf8d94cea27ebbfd2210ec17cd748aa4$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-intl@4.14.9_@swc+helpers@0.5.23_@types+react@19.3.0_next@16.3.8_@types+node@25.9.6_cf8d94cea27ebbfd2210ec17cd748aa4/node_modules/next-intl/dist/esm/development/server/react-server/getTranslations.js [app-rsc] (ecmascript) <export default as getTranslations>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$14$2e$9_$40$swc$2b$helpers$40$0$2e$5$2e$23_$40$types$2b$react$40$19$2e$3$2e$0_next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_cf8d94cea27ebbfd2210ec17cd748aa4$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__setCachedRequestLocale__as__setRequestLocale$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-intl@4.14.9_@swc+helpers@0.5.23_@types+react@19.3.0_next@16.3.8_@types+node@25.9.6_cf8d94cea27ebbfd2210ec17cd748aa4/node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js [app-rsc] (ecmascript) <export setCachedRequestLocale as setRequestLocale>");
var __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/artifacts/hvac-pacific/config/site.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/artifacts/hvac-pacific/components/paths.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function generateMetadata({ params }) {
    const { locale, slug } = await params;
    const t = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$14$2e$9_$40$swc$2b$helpers$40$0$2e$5$2e$23_$40$types$2b$react$40$19$2e$3$2e$0_next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_cf8d94cea27ebbfd2210ec17cd748aa4$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])({
        locale,
        namespace: "Scaffold"
    });
    const path = `/${slug.join("/")}`;
    return {
        title: t("title"),
        robots: {
            index: false,
            follow: true
        },
        alternates: {
            canonical: (0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])(locale, path),
            languages: {
                "en-US": path,
                "zh-Hans": (0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])("zh", path),
                "x-default": path
            }
        }
    };
}
async function ScaffoldPage({ params }) {
    const { locale, slug } = await params;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$14$2e$9_$40$swc$2b$helpers$40$0$2e$5$2e$23_$40$types$2b$react$40$19$2e$3$2e$0_next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_cf8d94cea27ebbfd2210ec17cd748aa4$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__setCachedRequestLocale__as__setRequestLocale$3e$__["setRequestLocale"])(locale);
    const t = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$14$2e$9_$40$swc$2b$helpers$40$0$2e$5$2e$23_$40$types$2b$react$40$19$2e$3$2e$0_next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_cf8d94cea27ebbfd2210ec17cd748aa4$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])({
        locale,
        namespace: "Scaffold"
    });
    const top = slug[0];
    const title = top === "search" ? t("searchTitle") : top === "cart" ? t("cartTitle") : t("title");
    const desc = top === "cart" ? t("cartDescription") : t("description");
    const pageUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].domain}${(0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])(locale, `/${slug.join("/")}`)}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        id: "main",
        className: "wrap scaffold",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                "aria-label": t("breadcrumb"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: (0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])(locale, "/"),
                        children: t("back")
                    }, void 0, false, {
                        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    " / ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-current": "page",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                type: "application/ld+json",
                dangerouslySetInnerHTML: {
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].displayName,
                                item: `${__TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].domain}${(0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])(locale, "/")}`
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: title,
                                item: pageUrl
                            }
                        ]
                    }).replace(/</g, "\\u003c")
                }
            }, void 0, false, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].displayName
            }, void 0, false, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: title
            }, void 0, false, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: desc
            }, void 0, false, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "btn primary",
                        href: `tel:${__TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].phoneE164}`,
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].phone
                    }, void 0, false, {
                        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "btn ghost",
                        href: `mailto:${__TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].email}`,
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$config$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE"].email
                    }, void 0, false, {
                        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$8_$40$types$2b$node$40$25$2e$9$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        className: "btn ghost",
                        href: (0, __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$hvac$2d$pacific$2f$components$2f$paths$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hrefFor"])(locale, "/"),
                        children: t("back")
                    }, void 0, false, {
                        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
}),
"[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/artifacts/hvac-pacific/app/[locale]/[...slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0rd8vfd._.js.map