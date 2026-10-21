/**
 * KIỂM TRA LOBBY TRÊN TRÌNH DUYỆT THẬT (Chrome headless qua DevTools Protocol, không cần thư viện)
 *
 *   npm run build && npx next start -p 3100      (terminal 1)
 *   npm run lobby:smoke -- http://localhost:3100  (terminal 2)
 *
 * Ảnh chụp lưu ở assets-src/lobby/_check/ để tự soát bằng mắt. Thoát mã 1 nếu có FAIL.
 * Biến môi trường CHROME_PATH để chỉ đường dẫn Chrome nếu không tự tìm thấy.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const ROOT = path.resolve(import.meta.dirname, "../..");
const SHOTS = path.join(ROOT, "assets-src", "lobby", "_check");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chromePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
if (!chromePath) {
  console.error("Không tìm thấy Chrome/Edge. Đặt biến CHROME_PATH rồi chạy lại.");
  process.exit(1);
}

try {
  await fetch(BASE);
} catch {
  console.error(`Không kết nối được ${BASE}. Chạy "npm run build" rồi "npx next start -p 3100" trước.`);
  process.exit(1);
}

const port = 9400 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), `gc-smoke-${Date.now()}`);
const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--hide-scrollbars",
  "about:blank",
]);

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let msgId = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) listeners.forEach((fn) => fn(m));
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
const consoleErrors = [];
listeners.push((m) => {
  if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") consoleErrors.push(`${m.params.entry.text} ${m.params.entry.url ?? ""}`);
});
await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const viewport = async (width, height, mobile) => {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
};
const goto = async (url, wait) => {
  const loaded = new Promise((r) => listeners.push((m) => m.method === "Page.loadEventFired" && r()));
  await send("Page.navigate", { url });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(wait);
};
const shot = async (name) => {
  mkdirSync(SHOTS, { recursive: true });
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(path.join(SHOTS, name), Buffer.from(r.data, "base64"));
};
const wheel = (deltaY) => send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 700, y: 450, deltaX: 0, deltaY });

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

const ctaUncovered = `(() => { const a = document.querySelector('[data-hero-cta] a'); if (!a) return false; const r = a.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return a.contains(t); })()`;
// Chỉ xét ảnh đang thực sự hiển thị (ảnh trong khối display:none không có hộp hiển thị)
const imagesLoaded = `[...document.querySelectorAll('.lobby img')].filter(i => i.getClientRects().length > 0).map(i => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 }))`;

try {
  // ---------- Desktop ----------
  await viewport(1440, 900, false);
  await goto(`${BASE}/`, 3500);
  await shot("desktop-1440.png");
  check("Desktop: có đủ 5 lớp hero", (await evaluate(`document.querySelectorAll('[data-layer]').length`)) === 5);
  check("Desktop: nút 'Bắt đầu ngay' không bị lớp nào che", await evaluate(ctaUncovered));
  check("Desktop: không có thanh cuộn ngang", await evaluate(`document.documentElement.scrollWidth <= innerWidth`));
  const titleOk = await evaluate(`(() => { const h = document.querySelector('#hero-title'); return h && getComputedStyle(h).opacity === '1' && h.getBoundingClientRect().height > 40; })()`);
  check("Desktop: tiêu đề hiển thị sau intro", titleOk);

  for (let i = 0; i < 7; i++) {
    await wheel(100);
    await sleep(50);
  }
  await sleep(1800);
  await shot("desktop-pin.png");
  const pin = await evaluate(`({ top: Math.round(document.querySelector('[data-hero]').getBoundingClientRect().top), spacer: !!document.querySelector('.pin-spacer') })`);
  check("Desktop: hero được ghim khi cuộn", pin.spacer && pin.top === 0, `hero top = ${pin.top}px`);

  for (let i = 0; i < 60; i++) {
    await wheel(120);
    await sleep(30);
  }
  await sleep(2500);
  await shot("desktop-bottom.png");
  const imgs = await evaluate(imagesLoaded);
  const broken = imgs.filter((i) => !i.ok);
  check("Desktop: mọi ảnh lobby tải được", broken.length === 0, broken.map((b) => b.src).join(", "));

  // ---------- Điện thoại ----------
  await viewport(390, 844, true);
  await goto(`${BASE}/`, 3500);
  await shot("mobile-390.png");
  check("Mobile: nút 'Bắt đầu ngay' không bị che", await evaluate(ctaUncovered));
  check("Mobile: không có thanh cuộn ngang", await evaluate(`document.documentElement.scrollWidth <= innerWidth`));
  const subjectOverlap = await evaluate(`(() => {
    const cta = document.querySelector('[data-hero-cta]').getBoundingClientRect();
    const img = document.querySelector('[data-layer="subject"] img');
    if (img && !img.offsetWidth) return null; // đã có ảnh hero dọc → lớp xe đạp ẩn
    return img ? Math.round(img.getBoundingClientRect().top - cta.bottom) : null;
  })()`);
  check("Mobile: xe/vật thể nằm dưới nút CTA", subjectOverlap === null || subjectOverlap > -60, `khoảng cách = ${subjectOverlap}px`);
  const backdrop = await evaluate(`(() => {
    const img = document.querySelector('[data-layer="sky"] img');
    const portrait = !!document.querySelector('[data-layer="sky"] source');
    return { portrait, src: img?.currentSrc ?? "", ok: !!img && img.complete && img.naturalWidth > 0 };
  })()`);
  check(
    backdrop.portrait ? "Mobile: tải đúng ảnh hero dọc (hero-mobile)" : "Mobile: ảnh nền tải được",
    backdrop.ok && (!backdrop.portrait || backdrop.src.includes("hero-mobile")),
    backdrop.src.split("?")[1]?.slice(0, 60) ?? backdrop.src
  );

  // ---------- Trang đăng nhập (ảnh panel) ----------
  await viewport(1440, 900, false);
  await goto(`${BASE}/dang-nhap`, 2500);
  await shot("login-1440.png");
  const panel = await evaluate(`(() => { const i = document.querySelector('img[src*="auth-panel"], img[srcset*="auth-panel"]'); return i ? i.complete && i.naturalWidth > 0 : false; })()`);
  check("Đăng nhập: ảnh panel bên trái tải được", panel);

  check("Console không có lỗi", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
} catch (err) {
  check("Chạy kiểm tra không lỗi", false, err.message);
} finally {
  ws.close();
  chrome.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* Chrome có thể còn giữ file vài giây */
  }
}

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
console.log(`\nẢnh chụp để tự soát: ${path.relative(ROOT, SHOTS)}/ (desktop-1440, desktop-pin, desktop-bottom, mobile-390, login-1440)`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n✗ ${failed} mục FAIL — CHƯA HOÀN THÀNH.` : `\n✓ TẤT CẢ ĐẠT.`);
process.exit(failed ? 1 : 0);
