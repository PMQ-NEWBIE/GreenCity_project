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
  check("Desktop: nút 'Bán ve chai ngay' không bị lớp nào che", await evaluate(ctaUncovered));
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
  check("Mobile: nút 'Bán ve chai ngay' không bị che", await evaluate(ctaUncovered));
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
  if (backdrop.portrait) {
    // Ảnh hero dọc hiện tại: đỉnh xe (giỏ, nón) ở ~44% chiều cao ảnh. Tính chỗ ảnh thật sự được vẽ theo object-fit.
    const gap = await evaluate(`(() => {
      // Lớp xe tách từ ảnh dọc (cùng khung với ảnh gốc)
      const img = document.querySelector(".lobby-hero-bike") ?? document.querySelector('[data-layer="sky"] img');
      const r = img.getBoundingClientRect();
      const fit = getComputedStyle(img).objectFit;
      const scale = (fit === "contain" ? Math.min : Math.max)(r.width / 1080, r.height / 1920);
      const drawnH = 1920 * scale;
      const bikeTop = r.bottom - drawnH + 0.44 * drawnH;
      return Math.round(bikeTop - document.querySelector('[data-hero-cta]').getBoundingClientRect().bottom);
    })()`);
    check("Mobile: xe đạp trong ảnh hero dọc nằm dưới nút CTA", gap >= 8, `cách nút ${gap}px`);
  }
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

  // ---------- Giao diện tối & hiệu ứng chuyển đổi bầu trời ----------
  // Đổi bằng nút trên header như người dùng thật. Trên lobby: bầu trời mờ dần sang đêm (750ms),
  // chữ / nút giữ nguyên chỗ, xe đạp CHẠY RA KHỎI KHUNG rồi ẩn (ban đêm không có xe — yêu cầu của người dùng),
  // đổi về sáng thì xe chạy vào lại đúng chỗ. Áp dụng cả điện thoại.
  const rideState = `(() => {
    const r = [...document.querySelectorAll("[data-ride]")].find((e) => e.offsetWidth > 0);
    if (!r) return null;
    const cs = getComputedStyle(r);
    // Độ hiện thật = nhân độ mờ của xe và mọi lớp bao ngoài (lớp cha mờ đi thì xe cũng mờ theo dù chính nó opacity 1)
    let seen = 1;
    for (let e = r; e; e = e.parentElement) seen *= Number(getComputedStyle(e).opacity);
    return { x: Math.round(new DOMMatrix(cs.transform).m41), seen: Math.round(seen * 100) / 100, shown: cs.visibility !== "hidden" && seen > 0.8 };
  })()`;
  const skyState = `(() => {
    const day = document.querySelector(".lobby-sky-day");
    const night = document.querySelector(".lobby-sky-night");
    const subject = document.querySelector('[data-layer="subject"] img');
    // Điện thoại: nền ngày là 2 nửa cửa (.lobby-hero-half); ảnh .lobby-hero-portrait chỉ còn dùng trên máy tính
    const mobileImg = document.querySelector('.lobby-hero-half') ?? document.querySelector('.lobby-hero-portrait');
    return {
      dayOpacity: day ? parseFloat(getComputedStyle(day).opacity) : null,
      nightOpacity: night ? parseFloat(getComputedStyle(night).opacity) : null,
      nightLoaded: night ? !!night.querySelector("img")?.complete && night.querySelector("img")?.naturalWidth > 0 : false,
      subjectLoaded: subject ? !!subject.complete && subject.naturalWidth > 0 && subject.offsetWidth > 0 : false,
      mobileLoaded: mobileImg ? !!mobileImg.complete && mobileImg.naturalWidth > 0 && mobileImg.offsetHeight > 0 : false,
      mobileOpacity: mobileImg ? parseFloat(getComputedStyle(mobileImg).opacity) : null,
    };
  })()`;
  // Điện thoại: 2 nửa nền ngày (cửa) — vị trí dọc và có đang hiện không
  const doorState = `(() => {
    const d = (k) => {
      const e = document.querySelector('[data-door="' + k + '"]');
      if (!e || !e.offsetWidth) return null;
      const cs = getComputedStyle(e);
      return { y: Math.round(new DOMMatrix(cs.transform).m42), shown: cs.visibility !== "hidden" && Number(cs.opacity) > 0.5 };
    };
    return { top: d("top"), bottom: d("bottom") };
  })()`;
  const switchTheme = async (label) => {
    await evaluate(`document.querySelector('[aria-haspopup="menu"][aria-label^="Chuyển đổi giao diện"]')?.click()`);
    await sleep(400);
    await evaluate(`(() => {
      window.__gaps = [];
      let last = performance.now();
      const stopAt = last + 1200;
      const tick = (t) => { window.__gaps.push(t - last); last = t; if (t < stopAt) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      [...document.querySelectorAll('[role="menuitem"]')].find((b) => b.textContent.includes(${JSON.stringify(label)}))?.click();
      return true;
    })()`);
  };
  const isDarkNow = () => evaluate(`document.documentElement.classList.contains("dark")`);

  for (const vp of [
    { name: "Desktop", w: 1440, h: 900, mobile: false, shotDark: "desktop-1440-dark.png", shotBack: "desktop-1440-light-back.png" },
    { name: "Mobile", w: 390, h: 844, mobile: true, shotDark: "mobile-390-dark.png", shotBack: "mobile-390-light-back.png" },
  ]) {
    await viewport(vp.w, vp.h, vp.mobile);
    await goto(`${BASE}/`, 3500);
    if (await isDarkNow()) {
      await switchTheme("Sáng");
      await sleep(1500);
    }

    // Chuyển Sáng → Tối: giữa chừng xe đang chạy sang trái, xong thì ẩn.
    // Điện thoại: xe đi xong (~1,2s) thì nền ngày tách đôi — trên lên, dưới xuống — lộ phố đêm.
    await switchTheme("Tối");
    await sleep(750);
    const rideMid = await evaluate(rideState);
    await sleep(vp.mobile ? 950 : 1400);
    const doorsOpening = await evaluate(doorState);
    if (vp.mobile) await sleep(1000);
    const rideEnd = await evaluate(rideState);
    if (vp.mobile) {
      const doorsEnd = await evaluate(doorState);
      check("Mobile tối: nền ngày tách đôi ở chân trời — nửa trên trượt lên, nửa dưới trượt xuống", !!doorsOpening.top && doorsOpening.top.shown && doorsOpening.top.y < -20 && doorsOpening.bottom.shown && doorsOpening.bottom.y > 20, JSON.stringify(doorsOpening));
      check("Mobile tối: mở xong thì 2 nửa nền ngày ẩn, chỉ còn phố đêm", !!doorsEnd.top && !doorsEnd.top.shown && !doorsEnd.bottom.shown, JSON.stringify(doorsEnd));
    }
    const darkSky = await evaluate(skyState);
    check(`${vp.name} tối: xe đạp đang chạy ra khỏi khung giữa lúc chuyển`, !!rideMid && rideMid.shown && rideMid.x < -30, JSON.stringify(rideMid));
    check(`${vp.name} tối: chuyển xong thì xe đạp ẩn (ban đêm không có xe)`, !!rideEnd && !rideEnd.shown, JSON.stringify(rideEnd));
    const gaps = await evaluate(`window.__gaps.map(Math.round)`);
    const worstGap = Math.max(0, ...gaps);
    check(`${vp.name} tối: nút đổi giao diện chuyển sang tối`, await isDarkNow());
    check(`${vp.name} tối: chuyển giao diện không giật (khung hình chậm nhất ≤ 120ms)`, worstGap <= 120, `chậm nhất ${worstGap}ms, ${gaps.length} khung hình`);

    if (!vp.mobile) {
      check("Desktop tối: bầu trời đêm hiển thị (opacity > 0.9)", darkSky.nightOpacity > 0.9, `nightOpacity = ${darkSky.nightOpacity}`);
      check("Desktop tối: bầu trời ngày ẩn đi (opacity < 0.1)", darkSky.dayOpacity < 0.1, `dayOpacity = ${darkSky.dayOpacity}`);
      check("Desktop tối: ảnh bầu trời đêm tải thành công", darkSky.nightLoaded);
      const outline = await evaluate(`document.querySelector(".lobby-outline-text")?.textContent.trim()`);
      check("Desktop: chữ viền nền là GREEN CITY", outline === "GREEN CITY", outline);
    } else {
      check("Mobile tối: bầu trời đêm hiển thị (opacity > 0.9)", darkSky.nightOpacity > 0.9 && darkSky.nightLoaded, `nightOpacity = ${darkSky.nightOpacity}`);
    }
    await shot(vp.shotDark);

    // Chuyển Tối → Sáng trở lại: (điện thoại) 2 nửa nền khép lại trước, rồi xe chạy vào từ mép phải, dừng đúng chỗ cũ
    await switchTheme("Sáng");
    let doorsClosing = null;
    if (vp.mobile) {
      await sleep(350);
      doorsClosing = await evaluate(doorState);
      await sleep(950);
    } else await sleep(750);
    const rideBack = await evaluate(rideState);
    await sleep(vp.mobile ? 1600 : 1400);
    const rideHome = await evaluate(rideState);
    if (vp.mobile) {
      const doorsHome = await evaluate(doorState);
      check("Mobile sáng: 2 nửa nền ngày đang khép lại (trên hạ xuống, dưới nâng lên)", !!doorsClosing.top && doorsClosing.top.shown && doorsClosing.top.y < 0 && doorsClosing.bottom.y > 0, JSON.stringify(doorsClosing));
      check("Mobile sáng: 2 nửa nền ngày khép kín đúng chỗ", !!doorsHome.top && doorsHome.top.shown && doorsHome.top.y === 0 && doorsHome.bottom.y === 0, JSON.stringify(doorsHome));
    }
    const lightSky = await evaluate(skyState);
    check(`${vp.name} sáng: xe đạp chạy vào từ mép phải`, !!rideBack && rideBack.shown && rideBack.x > 30, JSON.stringify(rideBack));
    check(`${vp.name} sáng: xe đạp về đúng chỗ cũ`, !!rideHome && rideHome.shown && rideHome.x === 0, JSON.stringify(rideHome));
    check(`${vp.name} sáng: chuyển về chế độ sáng thành công`, !(await isDarkNow()));
    if (!vp.mobile) {
      check("Desktop sáng: bầu trời ngày hiển thị trở lại (opacity > 0.9)", lightSky.dayOpacity > 0.9, `dayOpacity = ${lightSky.dayOpacity}`);
      check("Desktop sáng: bầu trời đêm ẩn đi (opacity < 0.1)", lightSky.nightOpacity < 0.1, `nightOpacity = ${lightSky.nightOpacity}`);
      check("Desktop sáng: xe đạp hiển thị đầy đủ", lightSky.subjectLoaded);
    } else {
      check("Mobile sáng: ảnh nền/xe đạp hiển thị đầy đủ", lightSky.mobileLoaded && lightSky.mobileOpacity > 0.8);
    }
    await shot(vp.shotBack);
  }

  // Phần dưới trang ở giao diện tối
  await viewport(1440, 900, false);
  await goto(`${BASE}/`, 3500);
  await switchTheme("Tối");
  await sleep(2200);
  for (let i = 0; i < 60; i++) {
    await wheel(120);
    await sleep(30);
  }
  await sleep(2500);
  await shot("desktop-bottom-dark.png");

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
