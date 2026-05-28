function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function pickMeta(html, names) {
  for (const name of names) {
    const propertyPattern = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
    const contentFirstPattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${name}["'][^>]*>`, "i");
    const match = html.match(propertyPattern) || html.match(contentFirstPattern);
    if (match?.[1]) return match[1].replace(/&amp;/g, "&").trim();
  }
  return "";
}

function pickTitle(html) {
  const metaTitle = pickMeta(html, ["og:title", "twitter:title"]);
  if (metaTitle) return metaTitle;
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() || "";
}

function normalizeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) URLs are supported");
  return url;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      send(res, 405, { error: "Method not allowed" });
      return;
    }

    const targetUrl = normalizeUrl(req.query?.url || "");
    const response = await fetch(targetUrl.href, {
      headers: {
        "user-agent": "Mozilla/5.0 kawaii-atelier-link-preview",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) throw new Error("无法读取这个链接的信息");

    const html = await response.text();
    const title = pickTitle(html);
    const description = pickMeta(html, ["og:description", "twitter:description", "description"]);
    const cover = pickMeta(html, ["og:image", "twitter:image", "image"]);

    send(res, 200, {
      title,
      description,
      cover: cover ? new URL(cover, targetUrl.href).href : "",
      url: targetUrl.href,
    });
  } catch (error) {
    send(res, 500, { error: error.message || "Metadata fetch failed" });
  }
};
