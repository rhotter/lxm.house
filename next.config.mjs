import createMDX from "@next/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  // REASON: These replace the old `*.lxm.house` subdomain redirects. The homepage
  // used to link to `http://zinenight.lxm.house` etc., which (a) are plain http so
  // browsers throw a mixed-content/insecure-link warning ("popup blocker"), and
  // (b) hop through an extra 301 at the DNS host. Serving them as first-party
  // path redirects from the https site means a single clean server-side 308 with
  // no insecure hop and no popup. Destinations were captured from the live
  // subdomain redirects on 2026-06-19.
  async redirects() {
    return [
      {
        source: "/zinenight",
        destination: "https://mangotango.mmm.page/zine-night-6-15-23",
        permanent: true,
      },
      {
        source: "/art",
        destination:
          "https://www.notion.so/lxmhouse/Art-Brainstorm-136eebaa9e514e2db5a7d14a0c472e57",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeKatex],
  },
});

export default withMDX(nextConfig);
