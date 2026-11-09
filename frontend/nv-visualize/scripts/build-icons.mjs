import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../public/branding/", import.meta.url);
const master = await readFile(new URL("night-vision-logo.png", root));
for (const [name, size] of [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
]) {
  const bytes = await sharp(master)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(new URL(name, root), bytes);
}
const images = await Promise.all(
  [16, 32].map((size) => readFile(new URL(`favicon-${size}.png`, root))),
);
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
for (let i = 0; i < images.length; i++) {
  const at = 6 + 16 * i;
  header[at] = [16, 32][i];
  header[at + 1] = [16, 32][i];
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(images[i].length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
}
await writeFile(
  new URL("favicon.ico", root),
  Buffer.concat([header, ...images]),
);
console.log(
  "Derived transparent 16/32/180px icons from the unchanged four-lens master.",
);
