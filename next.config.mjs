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

      // Legacy `*.lxm.house` subdomains, folded in to replace the third-party
      // redir301.link service (HTTP-only, no TLS — the original cause of the
      // insecure-link warning). These only fire once each subdomain is added as a
      // domain on this Vercel project and its DNS is repointed
      // (CNAME redir301.link -> cname.vercel-dns.com); until then they're inert.
      // `has` host-matches the subdomain and `/:path*` catches every path on it.
      {
        source: "/:path*",
        has: [{ type: "host", value: "zinenight.lxm.house" }],
        destination: "https://mangotango.mmm.page/zine-night-6-15-23",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "art.lxm.house" }],
        destination:
          "https://www.notion.so/lxmhouse/Art-Brainstorm-136eebaa9e514e2db5a7d14a0c472e57",
        permanent: true,
      },
      {
        // amazon.lxm.house now points at the first-party feed page rather than the
        // old Notion tracker.
        source: "/:path*",
        has: [{ type: "host", value: "amazon.lxm.house" }],
        destination: "https://www.lxm.house/amazon",
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
