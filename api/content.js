const crypto = require("crypto");
const fsSync = require("fs");
const fs = require("fs/promises");
const path = require("path");

const repo = process.env.GITHUB_REPO || "HanneZED/baitao";
const branch = process.env.GITHUB_BRANCH || "main";
const adminKey = process.env.SITE_ADMIN_KEY || process.env.ADMIN_KEY || "";
const token = process.env.GITHUB_TOKEN || "";
const nestedDataFile = "kawaii-atelier/data/site-content.json";
const dataFile =
  process.env.SITE_CONTENT_FILE ||
  (fsSync.existsSync(path.join(process.cwd(), nestedDataFile)) ? nestedDataFile : "data/site-content.json");
const uploadFilePrefix = dataFile.startsWith("kawaii-atelier/") ? "kawaii-atelier/" : "";

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function github(endpoint, options = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "kawaii-atelier-cms",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `GitHub API failed: ${response.status}`);
  }

  return response.json();
}

function decodeDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || "");
  if (!match) return null;
  return {
    mime: match[1].toLowerCase(),
    content: match[2],
  };
}

function extensionForMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "webp";
}

function normalizeString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeMediaItem(item) {
  return {
    id: normalizeString(item.id, crypto.randomUUID()) || crypto.randomUUID(),
    type: ["video", "guide", "article", "link"].includes(item.type) ? item.type : "article",
    category: normalizeString(item.category, item.type || "article") || "article",
    title: normalizeString(item.title, "新内容") || "新内容",
    description: normalizeString(item.description),
    url: normalizeString(item.url),
    cover: normalizeString(item.cover),
    tags: normalizeString(item.tags),
    body: normalizeString(item.body),
  };
}

function normalizeCollectionItem(item) {
  return {
    src: normalizeString(item.src),
    title: normalizeString(item.title, "图片"),
    description: normalizeString(item.description),
  };
}

function normalizeCollection(collection) {
  return {
    id: normalizeString(collection.id, crypto.randomUUID()) || crypto.randomUUID(),
    title: normalizeString(collection.title, "新合集") || "新合集",
    description: normalizeString(collection.description),
    cover: normalizeString(collection.cover),
    items: Array.isArray(collection.items) ? collection.items.map(normalizeCollectionItem).filter((item) => item.src) : [],
  };
}

function normalizePictureItem(item) {
  return {
    id: normalizeString(item.id, crypto.randomUUID()) || crypto.randomUUID(),
    src: normalizeString(item.src),
    title: normalizeString(item.title, "新图片") || "新图片",
    description: normalizeString(item.description),
    x: Number.isFinite(Number(item.x)) ? Number(item.x) : 50,
    y: Number.isFinite(Number(item.y)) ? Number(item.y) : 35,
    rotation: Number.isFinite(Number(item.rotation)) ? Number(item.rotation) : 0,
    size: item.size === "large" ? "large" : undefined,
  };
}

function normalizeSiteObject(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeSiteObject(item)).filter((item) => item !== "");
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, item] of Object.entries(value)) next[key] = normalizeSiteObject(item);
    if (Array.isArray(next.showcaseImages)) next.showcaseImages = next.showcaseImages.map((item) => normalizeString(item)).filter(Boolean).slice(0, 6);
    return next;
  }
  return normalizeString(value);
}

function normalizeBgmTrack(track) {
  return {
    title: normalizeString(track.title, "新 BGM") || "新 BGM",
    src: normalizeString(track.src),
  };
}

function normalizeContent(payload) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    site: normalizeSiteObject(payload.site || {}),
    bgm: Array.isArray(payload.bgm) ? payload.bgm.map(normalizeBgmTrack).filter((track) => track.src) : [],
    media: Array.isArray(payload.media) ? payload.media.map(normalizeMediaItem) : [],
    collections: Array.isArray(payload.collections) ? payload.collections.map(normalizeCollection) : [],
    pictures: Array.isArray(payload.pictures) ? payload.pictures.map(normalizePictureItem).filter((item) => item.src) : [],
  };
}

async function replaceInlineImages(value, tree) {
  if (typeof value === "string") {
    const decoded = decodeDataUrl(value);
    if (!decoded) return value;

    const extension = extensionForMime(decoded.mime);
    const publicPath = `img/uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const filePath = `${uploadFilePrefix}${publicPath}`;
    const blob = await github(`/repos/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: decoded.content,
        encoding: "base64",
      }),
    });

    tree.push({
      path: filePath,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });

    return `./${publicPath}`;
  }

  if (Array.isArray(value)) {
    const next = [];
    for (const item of value) next.push(await replaceInlineImages(item, tree));
    return next;
  }

  if (value && typeof value === "object") {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = await replaceInlineImages(item, tree);
    }
    return next;
  }

  return value;
}

async function commitToGithub(payload) {
  if (!token) throw new Error("Missing GITHUB_TOKEN");

  const ref = await github(`/repos/${repo}/git/ref/heads/${branch}`);
  const baseCommitSha = ref.object.sha;
  const baseCommit = await github(`/repos/${repo}/git/commits/${baseCommitSha}`);
  const tree = [];
  const contentWithUploads = await replaceInlineImages(normalizeContent(payload), tree);
  const siteContent = normalizeContent(contentWithUploads);

  const dataBlob = await github(`/repos/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content: JSON.stringify(siteContent, null, 2),
      encoding: "utf-8",
    }),
  });

  tree.push({
    path: dataFile,
    mode: "100644",
    type: "blob",
    sha: dataBlob.sha,
  });

  const nextTree = await github(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree,
    }),
  });

  const nextCommit = await github(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: "Update site content",
      tree: nextTree.sha,
      parents: [baseCommitSha],
    }),
  });

  await github(`/repos/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: nextCommit.sha }),
  });

  return siteContent;
}

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const localPath = path.join(process.cwd(), dataFile);
      const content = await fs.readFile(localPath, "utf8");
      send(res, 200, JSON.parse(content));
      return;
    }

    if (req.method !== "POST") {
      send(res, 405, { error: "Method not allowed" });
      return;
    }

    const body = await readBody(req);
    if (!safeEqual(body.key, adminKey)) {
      send(res, 401, { error: "管理密钥不正确" });
      return;
    }

    const data = await commitToGithub(body.content || body);
    send(res, 200, data);
  } catch (error) {
    send(res, 500, { error: error.message || "Content update failed" });
  }
};
