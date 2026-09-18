#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const markdownFiles = process.argv.slice(2);
const filesToCheck = markdownFiles.length > 0 ? markdownFiles : ["README.md"];
const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const failures = [];
const checkedTargets = new Set();

function normalizeReference(label) {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseReferenceDefinitions(markdown) {
  const refs = new Map();
  const definitionPattern =
    /^ {0,3}\[([^\]\n]+)\]:\s*(?:<([^>\n]+)>|(\S+))/gm;
  let match;

  while ((match = definitionPattern.exec(markdown)) !== null) {
    refs.set(normalizeReference(match[1]), match[2] || match[3]);
  }

  return refs;
}

function parseMarkdownTargets(markdown, filePath) {
  const refs = parseReferenceDefinitions(markdown);
  const targets = [];
  const inlinePattern = /(!?)\[[^\]\n]*\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g;
  const referencePattern = /(!?)\[([^\]\n]+)\]\[([^\]\n]+)\]/g;
  const autoLinkPattern = /<((?:https?:\/\/|mailto:)[^>\s]+)>/g;
  let match;

  while ((match = inlinePattern.exec(markdown)) !== null) {
    targets.push({
      source: filePath,
      rawTarget: match[2],
      isImage: match[1] === "!",
    });
  }

  while ((match = referencePattern.exec(markdown)) !== null) {
    const reference = normalizeReference(match[3]);
    const rawTarget = refs.get(reference);

    if (!rawTarget) {
      failures.push(`${filePath}: missing reference definition [${match[3]}]`);
      continue;
    }

    targets.push({
      source: filePath,
      rawTarget,
      isImage: match[1] === "!",
    });
  }

  while ((match = autoLinkPattern.exec(markdown)) !== null) {
    targets.push({
      source: filePath,
      rawTarget: match[1],
      isImage: false,
    });
  }

  return targets;
}

function splitFragment(rawTarget) {
  const hashIndex = rawTarget.indexOf("#");
  if (hashIndex === -1) {
    return { targetPath: rawTarget, fragment: "" };
  }

  return {
    targetPath: rawTarget.slice(0, hashIndex),
    fragment: rawTarget.slice(hashIndex + 1),
  };
}

function isExternalUrl(target) {
  return /^https?:\/\//i.test(target);
}

function isMailto(target) {
  return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(target);
}

function isImageTarget(target, explicitImage) {
  if (explicitImage) {
    return true;
  }

  try {
    return imageExtensions.has(path.extname(new URL(target).pathname).toLowerCase());
  } catch {
    return imageExtensions.has(path.extname(target).toLowerCase());
  }
}

async function validateLocalTarget(target, source, explicitImage) {
  const { targetPath } = splitFragment(target);
  const relativeTarget = targetPath || source;
  const absoluteTarget = path.resolve(repoRoot, path.dirname(source), relativeTarget);
  const relativeDisplay = path.relative(repoRoot, absoluteTarget);

  if (!absoluteTarget.startsWith(repoRoot + path.sep) && absoluteTarget !== repoRoot) {
    failures.push(`${source}: local target escapes repository: ${target}`);
    return;
  }

  let targetStat;
  try {
    targetStat = await stat(absoluteTarget);
  } catch {
    failures.push(`${source}: missing local target: ${target}`);
    return;
  }

  if (!targetStat.isFile()) {
    failures.push(`${source}: local target is not a file: ${target}`);
    return;
  }

  if (!isImageTarget(relativeTarget, explicitImage)) {
    return;
  }

  if (targetStat.size === 0) {
    failures.push(`${source}: image asset is empty: ${relativeDisplay}`);
    return;
  }

  const bytes = await readFile(absoluteTarget);
  const extension = path.extname(relativeTarget).toLowerCase();
  const startsWith = (signature) => bytes.subarray(0, signature.length).equals(signature);
  const textStart = bytes.subarray(0, 512).toString("utf8").trimStart();
  const isValid =
    (extension === ".png" && startsWith(Buffer.from("89504e470d0a1a0a", "hex"))) ||
    ((extension === ".jpg" || extension === ".jpeg") &&
      startsWith(Buffer.from("ffd8ff", "hex"))) ||
    (extension === ".gif" &&
      (startsWith(Buffer.from("GIF87a")) || startsWith(Buffer.from("GIF89a")))) ||
    (extension === ".webp" &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP") ||
    (extension === ".svg" && textStart.includes("<svg")) ||
    extension === ".avif";

  if (!isValid) {
    failures.push(`${source}: unsupported or invalid image asset: ${relativeDisplay}`);
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      ...options,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; README-link-check/1.0; +https://github.com/thewyattbrocato/thewyattbrocato)",
        accept: "*/*",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateExternalTarget(target, source, explicitImage) {
  const wantsImage = isImageTarget(target, explicitImage);
  let response;

  try {
    response = await fetchWithTimeout(target, {
      method: wantsImage ? "GET" : "HEAD",
      headers: wantsImage ? { accept: "image/*,*/*;q=0.8" } : {},
    });

    if (!wantsImage && [405, 403].includes(response.status)) {
      response = await fetchWithTimeout(target, { method: "GET" });
    }
  } catch (error) {
    failures.push(`${source}: failed to reach ${target}: ${error.message}`);
    return;
  }

  if (response.status < 200 || response.status >= 400) {
    failures.push(`${source}: ${target} returned HTTP ${response.status}`);
    return;
  }

  if (!wantsImage) {
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.toLowerCase().startsWith("image/")) {
    return;
  }

  const bodyStart = await response.text();
  if (!bodyStart.trimStart().includes("<svg")) {
    failures.push(
      `${source}: ${target} did not return an image content type or SVG body`,
    );
  }
}

async function validateTarget(target) {
  const key = `${target.source}\0${target.rawTarget}\0${target.isImage}`;
  if (checkedTargets.has(key)) {
    return;
  }
  checkedTargets.add(key);

  if (isMailto(target.rawTarget)) {
    return;
  }

  if (isExternalUrl(target.rawTarget)) {
    new URL(target.rawTarget);
    await validateExternalTarget(target.rawTarget, target.source, target.isImage);
    return;
  }

  await validateLocalTarget(target.rawTarget, target.source, target.isImage);
}

for (const filePath of filesToCheck) {
  const markdown = await readFile(path.resolve(repoRoot, filePath), "utf8");
  const targets = parseMarkdownTargets(markdown, filePath);

  for (const target of targets) {
    await validateTarget(target);
  }
}

if (failures.length > 0) {
  console.error("README validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${checkedTargets.size} Markdown link and image target(s).`);
