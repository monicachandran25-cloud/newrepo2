import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync("C:/Users/Kumaresan/Downloads/zevrocrm29.html", "utf8");
const css = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!css || !body) {
  throw new Error("Could not find HTML style/body blocks");
}

const scripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
let markup = body[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
const projectRoot = "D:/Zevro/ZevroReact2";
const assetsDirectory = path.join(projectRoot, "public", "assets");
fs.mkdirSync(assetsDirectory, { recursive: true });

let imageCount = 0;
markup = markup.replace(/data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)/g, (_, mime, data) => {
  imageCount += 1;
  const extension = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  }[`image/${mime}`] || "bin";
  const name = `embedded-${imageCount}.${extension}`;
  fs.writeFileSync(path.join(assetsDirectory, name), Buffer.from(data.replace(/\s/g, ""), "base64"));
  return `/assets/${name}`;
});

fs.writeFileSync(path.join(projectRoot, "src", "page.html"), markup, "utf8");
fs.writeFileSync(path.join(projectRoot, "src", "page.css"), css[1], "utf8");
fs.writeFileSync(path.join(projectRoot, "src", "page-scripts.js"), `export default ${JSON.stringify(scripts)};\n`, "utf8");
console.log(JSON.stringify({ scripts: scripts.length, images: imageCount, markupBytes: Buffer.byteLength(markup), cssBytes: Buffer.byteLength(css[1]) }));
