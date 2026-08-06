// index.html에 base64로 임베드된 이미지를 images/*.webp 파일로 추출하고
// <img src>를 파일 참조로 교체한다. 같은 이미지(해시 동일)는 한 파일로 합친다.
// 사용: NODE_PATH=<sharp가 설치된 node_modules> node scripts/externalize-images.mjs
// (일회성 마이그레이션 완료. 추후 새 사진을 base64로 붙였을 때 재실행하면 된다.)
import { createRequire } from "module";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "x.js") : import.meta.url);
const sharp = require("sharp");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "index.html");
mkdirSync(path.join(root, "images"), { recursive: true });

let html = readFileSync(htmlPath, "utf-8");

const imgRe = /<img\b[^>]*>/g;
const tags = html.match(imgRe) || [];
const byHash = new Map(); // hash -> filename
const nameCount = new Map();
let converted = 0, reused = 0;

const sanitize = (s) =>
  (s || "img").trim().replace(/[^\w가-힣a-zA-Z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "img";

for (const tag of tags) {
  const srcM = tag.match(/src="(data:image\/[a-z+]+;base64,([^"]+))"/);
  if (!srcM) continue;
  const altM = tag.match(/alt="([^"]*)"/);
  const buf = Buffer.from(srcM[2], "base64");
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 8);

  let file = byHash.get(hash);
  if (!file) {
    const base = sanitize(altM && altM[1]);
    const n = (nameCount.get(base) || 0) + 1;
    nameCount.set(base, n);
    file = `${base}${n > 1 ? "-" + n : ""}.webp`;
    const out = path.join(root, "images", file);
    await sharp(buf).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    byHash.set(hash, file);
    converted++;
  } else {
    reused++;
  }

  let newTag = tag.replace(srcM[1], `images/${file}`);
  if (!/loading=/.test(newTag)) newTag = newTag.replace("<img ", '<img loading="lazy" ');
  html = html.replace(tag, newTag);
}

writeFileSync(htmlPath, html);
console.log(`img tags: ${tags.length}, files written: ${converted}, dedup reuse: ${reused}`);
