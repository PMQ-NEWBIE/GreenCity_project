/**
 * KIỂM TRA CÁC TRANG TÍNH NĂNG MỚI TRÊN TRÌNH DUYỆT THẬT
 * (Chrome headless qua DevTools Protocol, không cần thư viện)
 *
 *   npm run build && npx next start -p 3100                       (terminal 1)
 *   npm run features:smoke -- http://localhost:3100 gemini         (terminal 2)
 *   npm run features:smoke -- http://localhost:3300 claude
 *   npm run features:smoke -- http://localhost:3300 all --allow-stub
 *
 * Mỗi trang: 390px và 1440px × nền sáng và tối, đăng nhập demo đúng vai trò.
 * Kiểm: tải được, không lỗi console, không cuộn ngang, không ảnh hỏng, đúng 1 thẻ h2,
 * không còn chữ "Đang xây dựng" (trừ khi có --allow-stub). Sau đó chạy thử các luồng chính.
 * Ảnh chụp: assets-src/features/_check/<bên>/. Thoát mã 1 nếu có FAIL.
 * Biến môi trường CHROME_PATH để chỉ đường dẫn Chrome nếu không tự tìm thấy.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const SIDE = process.argv[3] || "all";
const ALLOW_STUB = process.argv.includes("--allow-stub");
if (!["gemini", "claude", "all"].includes(SIDE)) {
  console.error("Cách dùng: npm run features:smoke -- <url> <gemini|claude|all> [--allow-stub]");
  process.exit(2);
}
const ROOT = path.resolve(import.meta.dirname, "../..");
const SHOTS = path.join(ROOT, "assets-src", "features", "_check", SIDE);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------- Đọc id mẫu từ dữ liệu ---------------------------- */

const firstMatch = (file, re) => {
  try {
    return readFileSync(path.join(ROOT, file), "utf8").match(re)?.[1] ?? null;
  } catch {
    return null;
  }
};
const articleSlug = firstMatch("src/data/knowledge.ts", /slug:\s*"([^"]+)"/);
const shopSlug = firstMatch("src/data/green-shops.ts", /slug:\s*"([^"]+)"/);
const swapId = firstMatch("src/data/swap-seed.ts", /id:\s*"(s-[^"]+)"/);

/* ------------------------------ Danh sách trang ------------------------------ */

const PAGES = [
  // Gemini — tính năng cơ bản
  { side: "gemini", path: "/kien-thuc", name: "kien-thuc" },
  articleSlug && { side: "gemini", path: `/kien-thuc/${articleSlug}`, name: "bai-viet" },
  { side: "gemini", path: "/kien-thuc/so-tay", name: "so-tay" },
  { side: "gemini", path: "/diem-thuong", name: "diem-thuong" },
  { side: "gemini", path: "/diem-thuong/quy-tac", name: "quy-tac-diem" },
  { side: "gemini", path: "/doi-qua", name: "doi-qua" },
  { side: "gemini", path: "/gian-hang", name: "gian-hang" },
  shopSlug && { side: "gemini", path: `/gian-hang/${shopSlug}`, name: "gian-hang-chi-tiet" },
  { side: "gemini", path: "/trao-doi", name: "trao-doi" },
  { side: "gemini", path: "/trao-doi/dang", name: "trao-doi-dang" },
  swapId && { side: "gemini", path: `/trao-doi/${swapId}`, name: "trao-doi-chi-tiet" },
  // Claude — trang có sẵn và tính năng nâng cao
  { side: "claude", path: "/ban-hang", name: "ban-hang" },
  { side: "claude", path: "/ban-hang/don", name: "don-den" },
  { side: "claude", path: "/ban-hang/tin", name: "tin-cua-toi" },
  { side: "claude", path: "/don-mua", name: "don-mua" },
  { side: "claude", path: "/kham-pha", name: "kham-pha" },
  { side: "claude", path: "/san-pham/p1", name: "san-pham" },
  { side: "claude", path: "/dang-tin", name: "dang-tin" },
  { side: "claude", path: "/thu-gom", name: "thu-gom" },
  { side: "claude", path: "/yeu-thich", name: "yeu-thich" },
  { side: "claude", path: "/ho-so", name: "ho-so" },
  { side: "claude", path: "/thung-thu-gom", name: "thung-thu-gom" },
  { side: "claude", path: "/bao-diem-rac", name: "bao-diem-rac" },
  { side: "claude", path: "/ban-do", name: "ban-do" },
  { side: "claude", path: "/tu-van-phan-loai", name: "tu-van" },
  // Khu làm việc riêng
  { side: "claude", path: "/doanh-nghiep", name: "doanh-nghiep", role: "business" },
  { side: "claude", path: "/doanh-nghiep/thong-ke", name: "thong-ke", role: "business" },
  { side: "claude", path: "/cong-tac-vien", name: "cong-tac-vien", role: "collaborator" },
  { side: "claude", path: "/van-hanh", name: "van-hanh", role: "operator" },
  { side: "claude", path: "/doi-tac", name: "doi-tac", role: "partner" },
  { side: "claude", path: "/doi-tac/tin/p1", name: "doi-tac-tin", role: "partner" },
  { side: "claude", path: "/doi-tac/don", name: "doi-tac-don", role: "partner" },
  { side: "claude", path: "/doi-tac/thu-gom", name: "doi-tac-thu-gom", role: "partner" },
  { side: "claude", path: "/doi-tac/lo", name: "doi-tac-lo", role: "partner" },
  { side: "claude", path: "/doi-tac/nhu-cau", name: "doi-tac-nhu-cau", role: "partner" },
  { side: "claude", path: "/cong-tac-vien/trao-qua", name: "ctv-trao-qua", role: "collaborator" },
  { side: "claude", path: "/cong-tac-vien/lo", name: "ctv-lo", role: "collaborator" },
  { side: "claude", path: "/cong-tac-vien/nhu-cau", name: "ctv-nhu-cau", role: "collaborator" },
  { side: "claude", path: "/doanh-nghiep/nhu-cau", name: "doanh-nghiep-nhu-cau", role: "business" },
  { side: "claude", path: "/van-hanh/vat-lieu", name: "van-hanh-vat-lieu", role: "operator" },
  { side: "claude", path: "/van-hanh/thong-ke", name: "van-hanh-thong-ke", role: "operator" },
].filter((p) => p && (SIDE === "all" || p.side === SIDE));

const VIEWPORTS = [
  { label: "390", width: 390, height: 844, mobile: true },
  { label: "1440", width: 1440, height: 900, mobile: false },
];
const THEMES = ["light", "dark"];

const EMAIL = {
  resident: "kiemthu@greencity.vn",
  partner: "doitac@greencity.vn",
  collaborator: "ctv@greencity.vn",
  business: "doanhnghiep@greencity.vn",
  operator: "vanhanh@greencity.vn",
};

/** Dữ liệu demo đặt vào localStorage trước mỗi lần mở trang. role = null → khách. */
function seedScript(role, theme) {
  const payload = {
    v: 2,
    user: role ? { name: "Người Kiểm Thử", email: EMAIL[role], memberSince: "Tháng 10/2026", role } : null,
    favorites: [],
    myListings: [],
    myRequests: [],
    points: { entries: [] },
    rewards: { redemptions: [] },
    swap: { items: [] },
  };
  return `try {
    localStorage.setItem("greencity-demo-v2", ${JSON.stringify(JSON.stringify(payload))});
    localStorage.setItem("theme", "${theme}");
    localStorage.setItem("greencity-demo-banner-hidden", "1");
  } catch (e) {}`;
}

/* --------------------------------- Chrome --------------------------------- */

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
  console.error(`Không kết nối được ${BASE}. Chạy "npm run build" rồi "npx next start -p <cổng>" trước.`);
  process.exit(1);
}

const port = 9400 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), `gc-features-smoke-${Date.now()}`);
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
const listeners = new Set();
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};

let consoleErrors = [];
listeners.add((m) => {
  if (m.method === "Runtime.exceptionThrown")
    consoleErrors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error")
    consoleErrors.push(`${m.params.entry.text} ${m.params.entry.url ?? ""}`);
});
await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const viewport = async (v) => {
  await send("Emulation.setDeviceMetricsOverride", { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile });
  await send("Emulation.setTouchEmulationEnabled", v.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
};

let seedId = null;
const seed = async (role, theme) => {
  if (seedId) await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: seedId });
  seedId = (await send("Page.addScriptToEvaluateOnNewDocument", { source: seedScript(role, theme) })).identifier;
};

const goto = async (url, wait = 1400) => {
  let done;
  const loaded = new Promise((r) => (done = r));
  const fn = (m) => m.method === "Page.loadEventFired" && done();
  listeners.add(fn);
  await send("Page.navigate", { url });
  await Promise.race([loaded, sleep(20000)]);
  listeners.delete(fn);
  await sleep(wait);
};

const shot = async (name) => {
  mkdirSync(SHOTS, { recursive: true });
  const { contentSize } = await send("Page.getLayoutMetrics");
  const height = Math.min(Math.ceil(contentSize.height), 6000);
  const r = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: Math.ceil(contentSize.width), height, scale: 1 },
  });
  writeFileSync(path.join(SHOTS, name), Buffer.from(r.data, "base64"));
};

/** Cuộn hết trang để ảnh lazy-load tải, rồi về đầu trang. */
const scrollThrough = async () => {
  await evaluate(`(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    await new Promise(r => setTimeout(r, 600));
    scrollTo(0, 0);
  })()`);
};

/** within: chỉ tìm trong vùng này (vd "main", '[role="dialog"]') — tránh bấm nhầm link cùng chữ ở menu. */
const clickByText = (text, { exact = true, within = "body" } = {}) =>
  evaluate(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(within)} + ' button, ' + ${JSON.stringify(within)} + ' a')];
    const el = els.find(e => !e.disabled && (${exact} ? e.textContent.trim() === ${JSON.stringify(text)} : e.textContent.includes(${JSON.stringify(text)})));
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.click();
    return true;
  })()`);

/** Gõ giá trị vào ô input/textarea/select theo cách React nhận được (setter gốc + sự kiện). */
const setField = (selector, value) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
    return true;
  })()`);

/**
 * Đổi vai trò (bản demo) bằng giao diện, không tải lại trang (tải lại sẽ nạp lại dữ liệu mẫu):
 * người dân đổi trong Hồ sơ, nhân sự đổi trong hộp "Tài khoản" ở sidebar khu làm việc.
 * Trang tự chuyển tới khu của vai trò mới (người dân về Tổng quan bán).
 */
const switchRole = async (label) => {
  const staff = await clickByText("Tài khoản", { exact: false, within: "aside" });
  if (!staff) await clickByText("Hồ sơ của tôi", { exact: false, within: "aside" });
  await sleep(700);
  const scope = staff ? '[role="dialog"] label' : "main label";
  await evaluate(`[...document.querySelectorAll(${JSON.stringify(scope)})].find(l => l.textContent.includes(${JSON.stringify(label)}))?.click()`);
  await sleep(900);
  if (!staff && label === "Người dân") await clickByText("Tổng quan bán", { within: "aside" });
};

/** Số dư điểm ở Tổng quan bán (chế độ bán của người dân). */
const readBalance = async () => {
  await clickByText("Tổng quan bán", { within: "aside" });
  await sleep(800);
  return evaluate(`(() => { const a = [...document.querySelectorAll('main a')].find(x => /điểm thưởng$/.test(x.textContent.trim())); return a?.textContent.trim().split(" ")[0]; })()`);
};

/** Đưa một ảnh PNG nhỏ vào ô chọn file (giống người dùng chọn ảnh từ máy). */
const TEST_PNG = path.join(os.tmpdir(), "gc-smoke-anh.png");
{
  const sharp = (await import("sharp")).default;
  await sharp({ create: { width: 96, height: 72, channels: 3, background: { r: 110, g: 150, b: 80 } } }).png().toFile(TEST_PNG);
}
const attachPhoto = async (selector) => {
  const { root } = await send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector });
  if (!nodeId) return false;
  await send("DOM.setFileInputFiles", { nodeId, files: [TEST_PNG] });
  return true;
};

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

/* ------------------------------ Kiểm từng trang ------------------------------ */

const PAGE_CHECKS = `(() => {
  const main = document.querySelector('main');
  const text = document.body.innerText;
  const imgs = [...document.querySelectorAll('main img')].filter(i => i.getClientRects().length > 0);
  return {
    pathname: location.pathname,
    hScroll: document.documentElement.scrollWidth > innerWidth + 1,
    h2: main ? main.querySelectorAll('h2').length : -1,
    stub: text.includes('Đang xây dựng'),
    noAccess: text.includes('Trang này dành cho'),
    broken: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 3),
    failedImg: text.includes('Không tải được ảnh'),
  };
})()`;

try {
  for (const theme of THEMES) {
    for (const v of VIEWPORTS) {
      await viewport(v);
      let currentRole;
      for (const pg of PAGES) {
        const role = pg.role ?? "resident";
        if (role !== currentRole) {
          await seed(role, theme);
          currentRole = role;
        }
        consoleErrors = [];
        const label = `${pg.path} [${v.label}px, ${theme === "light" ? "sáng" : "tối"}]`;
        const res = await fetch(BASE + pg.path, { redirect: "manual" });
        await goto(BASE + pg.path);
        await scrollThrough();
        const r = await evaluate(PAGE_CHECKS);
        await shot(`${pg.name}-${v.label}-${theme}.png`);

        const problems = [];
        if (res.status !== 200) problems.push(`HTTP ${res.status}`);
        if (r.pathname !== pg.path) problems.push(`bị chuyển sang ${r.pathname}`);
        if (r.noAccess) problems.push("báo không có quyền");
        if (r.hScroll) problems.push("có cuộn ngang");
        if (r.h2 !== 1) problems.push(`có ${r.h2} thẻ h2 trong <main> (cần đúng 1)`);
        if (r.stub && !ALLOW_STUB) problems.push('còn chữ "Đang xây dựng"');
        if (r.broken.length || r.failedImg) problems.push(`ảnh hỏng ${r.broken.join(", ")}`);
        if (consoleErrors.length) problems.push(`lỗi console: ${consoleErrors.slice(0, 2).join(" | ").slice(0, 300)}`);
        check(label, problems.length === 0, problems.join("; "));
      }
    }
  }

  /* --------------------------- Khách chưa đăng nhập --------------------------- */
  await viewport(VIEWPORTS[1]);
  await seed(null, "light");
  for (const p of ["/kien-thuc", "/diem-thuong/quy-tac", "/gian-hang", "/ban-do"]) {
    await goto(BASE + p);
    check(`Khách xem được ${p}`, (await evaluate("location.pathname")) === p);
  }
  await goto(BASE + "/diem-thuong", 2200);
  check("Khách vào /diem-thuong bị chuyển sang trang đăng nhập", (await evaluate("location.pathname")) === "/dang-nhap");

  /* ------------------------------- Các luồng chính ------------------------------- */
  if (!ALLOW_STUB && (SIDE === "gemini" || SIDE === "all")) {
    await seed("resident", "light");

    // Sổ tay: tìm không dấu
    await goto(BASE + "/kien-thuc/so-tay");
    await evaluate(`(() => { const i = document.querySelector('main input[type="search"], main input[type="text"], main input:not([type])'); if (i) { i.focus(); i.select?.(); } return !!i; })()`);
    await send("Input.insertText", { text: "chai nhua" });
    await sleep(700);
    check('Luồng: sổ tay tìm "chai nhua" ra "Chai nhựa"', await evaluate(`document.querySelector('main').innerText.includes('Chai nhựa')`));
    await shot("luong-so-tay-tim.png");

    // Đổi quà: điểm chào mừng đủ cho món rẻ nhất
    await goto(BASE + "/doi-qua");
    const opened = await clickByText("Đổi quà", { within: "main" });
    await sleep(500);
    const confirmed = opened && (await clickByText("Xác nhận đổi", { within: '[role="dialog"]' }));
    await sleep(800);
    const code = await evaluate(`(document.body.innerText.match(/GC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}/) || [null])[0]`);
    await shot("luong-doi-qua.png");
    check("Luồng: đổi quà ra mã nhận quà", opened && confirmed && code, code ?? (opened ? "không thấy mã GC-XXXX-XXXX" : 'không có nút "Đổi quà" nào bấm được'));
    if (code && SIDE !== "gemini") {
      // Trả thưởng tại điểm thu gom: cộng tác viên nhập mã người dân đọc
      await switchRole("Cộng tác viên");
      await clickByText("Trao quà", { within: "aside" });
      await sleep(700);
      await setField("#gift-code", code.slice(3));
      await clickByText("Kiểm tra mã", { within: "main" });
      await sleep(300);
      const handed = await clickByText("Đã trao quà", { within: "main" });
      await sleep(400);
      const stillWaiting = await evaluate(`document.querySelector('main').innerText.includes(${JSON.stringify(code)})`);
      await shot("luong-ctv-trao-qua.png");
      check("Luồng CTV: nhập mã người dân đọc (không cần 'GC-'), trao quà, mã rời danh sách chờ", handed && !stillWaiting, `mã ${code}`);
    }

    // Đăng đồ trao đổi: để trống → báo lỗi và focus ô sai
    await goto(BASE + "/trao-doi/dang");
    await evaluate(`(() => { const b = document.querySelector('main form button[type="submit"]'); b?.scrollIntoView({ block: "center" }); b?.click(); return !!b; })()`);
    await sleep(600);
    const err = await evaluate(`({
      errors: [...document.querySelectorAll('main .text-destructive')].filter(e => e.getClientRects().length > 0).length,
      focused: document.activeElement && document.activeElement !== document.body && !!document.activeElement.closest('main'),
    })`);
    await shot("luong-trao-doi-loi.png");
    check("Luồng: đăng đồ trao đổi bỏ trống thì báo lỗi và focus ô sai", err.errors > 0 && err.focused, `lỗi hiện: ${err.errors}, focus trong form: ${err.focused}`);

    // Đăng đồ trao đổi: điền mẫu → sang trang chi tiết
    await clickByText("Điền thử dữ liệu mẫu", { within: "main" });
    await sleep(400);
    await evaluate(`(() => { const b = document.querySelector('main form button[type="submit"]'); b?.click(); })()`);
    await sleep(2500);
    const after = await evaluate("location.pathname");
    await shot("luong-trao-doi-dang.png");
    check("Luồng: đăng đồ trao đổi bằng dữ liệu mẫu rồi sang trang chi tiết", after.startsWith("/trao-doi/s-"), `đang ở ${after}`);
  }

  /* ------------------------- Luồng của Claude (A2–A5, A7) ------------------------- */
  if (SIDE === "claude" || SIDE === "all") {
    await viewport(VIEWPORTS[1]);
    await seed("resident", "light");

    // A2: gửi yêu cầu thu gom → chế độ demo đi hết các bước → được cộng điểm
    await goto(BASE + "/thu-gom");
    await clickByText("Lon nhôm");
    await clickByText("Chai nhựa PET");
    await evaluate(`document.querySelector('main input[type="checkbox"]')?.click()`);
    await setField("#collect-quantity", "2 bao, khoảng 10kg");
    await setField("#collect-area", "Quận 3");
    await setField("#collect-address", "Đường Trần Quốc Thảo, Phường Võ Thị Sáu");
    await clickByText("Linh hoạt");
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    await sleep(1800);
    const detail = await evaluate("location.pathname");
    check("Luồng A2: gửi yêu cầu thu gom rồi sang trang theo dõi", detail.startsWith("/thu-gom/r-"), `đang ở ${detail}`);
    for (let i = 0; i < 3; i++) {
      await clickByText("Chuyển sang bước tiếp theo");
      await sleep(400);
    }
    await clickByText("Nhận tiền và hoàn tất");
    await sleep(600);
    const done = await evaluate(`({ done: !!document.querySelector('main')?.innerText.includes('Hoàn tất'), pts: (document.querySelector('main')?.innerText.match(/\\+(\\d+) điểm/) || [])[1] })`);
    await shot("luong-a2-thu-gom-hoan-tat.png");
    // 10kg × 2 điểm + 10 điểm phân loại sẵn = 30
    check("Luồng A2: đi hết 5 bước và được cộng điểm đúng quy tắc", done.done && done.pts === "30", `điểm hiện: ${done.pts ?? "không thấy"}`);
    const balance = await readBalance();
    check("Luồng A2: số dư ở Tổng quan bán = 50 chào mừng + 30", balance === "80", `số dư: ${balance}`);

    // A3 + A5: bỏ đồ vào thùng, báo thùng đầy → đổi sang cộng tác viên → duyệt → điểm vào tài khoản
    await goto(BASE + "/thung-thu-gom");
    const firstBin = await evaluate(`document.querySelector('main li[id^="thung-"] .font-mono')?.textContent`);
    await clickByText("Bỏ đồ");
    await sleep(400);
    await clickByText("Chai nhựa PET");
    await clickByText("1–3kg");
    await clickByText("Ghi nhận");
    await sleep(900);
    await clickByText("Báo đầy");
    await sleep(400);
    await clickByText("Gửi báo cáo");
    await sleep(900);
    const pendingShown = await evaluate(`document.querySelector('main').innerText.includes('Chờ kiểm tra')`);
    await shot("luong-a3-bo-do.png");
    check("Luồng A3: ghi nhận bỏ đồ, hiện 'Chờ kiểm tra' trong hoạt động của bạn", pendingShown);

    await switchRole("Cộng tác viên");
    const approved = await evaluate(`(() => {
      const li = [...document.querySelectorAll('main li')].find(l => l.textContent.includes('Người Kiểm Thử'));
      const b = li && [...li.querySelectorAll('button')].find(x => x.textContent.trim() === 'Đạt');
      b?.click(); return !!b;
    })()`);
    await sleep(500);
    await clickByText("Thùng báo đầy", { exact: false });
    await sleep(500);
    const confirmed = await evaluate(`(() => {
      const li = [...document.querySelectorAll('main li')].find(l => l.textContent.includes(${JSON.stringify(firstBin ?? "")}));
      const b = li && [...li.querySelectorAll('button')].find(x => x.textContent.trim() === 'Xác nhận đầy');
      b?.click(); return !!b;
    })()`);
    await sleep(500);
    await shot("luong-a5-ctv-xac-nhan.png");
    check("Luồng A3/A5: cộng tác viên duyệt lượt bỏ đồ và xác nhận thùng đầy", approved && confirmed, `duyệt: ${approved}, xác nhận ${firstBin}: ${confirmed}`);
    await switchRole("Người dân");
    const balance2 = await readBalance();
    check("Luồng A3/A5: số dư = 50 + 5 (bỏ đồ) + 5 (báo đầy)", balance2 === "60", `số dư: ${balance2}`);

    // A4: báo điểm rác (ảnh bắt buộc) → cộng tác viên xác minh → +20 điểm
    await seed("resident", "light");
    await goto(BASE + "/bao-diem-rac");
    await attachPhoto('main input[type="file"]');
    await sleep(1200);
    await setField("#litter-area", "Quận 5");
    await setField("#litter-address", "Đầu hẻm chợ, cạnh cột điện");
    await clickByText("Vừa", { exact: false });
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    await sleep(1500);
    const sent = await evaluate(`(() => { const t = document.querySelector('main').innerText; return t.includes('Chờ xác minh') && t.includes('+20 điểm'); })()`);
    await shot("luong-a4-bao-diem-rac.png");
    check("Luồng A4: gửi báo cáo có ảnh, hiện 'Chờ xác minh · +20 điểm'", sent);
    // Xác minh điểm rác giờ là việc của ban điều hành (tab Báo cáo)
    await switchRole("Nhóm vận hành");
    await clickByText("Báo cáo", { exact: false, within: "main" });
    await sleep(500);
    const verified = await evaluate(`(() => {
      const li = [...document.querySelectorAll('main li')].find(l => l.textContent.includes('Người Kiểm Thử'));
      const b = li && [...li.querySelectorAll('button')].find(x => x.textContent.trim() === 'Đúng như báo cáo');
      b?.click(); return !!b;
    })()`);
    await sleep(500);
    await switchRole("Người dân");
    const balance3 = await readBalance();
    check("Luồng A4: ban điều hành xác minh, số dư = 50 + 20", verified && balance3 === "70", `xác minh: ${verified}, số dư: ${balance3}`);

    // A10: người thu mua tự nhận yêu cầu tới lấy của chị Lan → lên đường → cân → thanh toán
    await seed("partner", "light");
    await goto(BASE + "/doi-tac/thu-gom");
    const opened = await evaluate(`(() => { const a = [...document.querySelectorAll('main li a')].find(x => x.textContent.includes('Chị Lan')); a?.click(); return !!a; })()`);
    await sleep(1000);
    await clickByText("Nhận đơn, hẹn giờ");
    await sleep(400);
    await clickByText("Tôi đang tới");
    await sleep(400);
    await setField('input[id^="kg-r-mau-1-0"]', "12");
    await setField('input[id^="kg-r-mau-1-1"]', "4,5");
    await clickByText("Lưu số cân");
    await sleep(400);
    await clickByText("Xác nhận đã thanh toán");
    await sleep(600);
    const ops = await evaluate(`(() => { const t = document.querySelector('main').innerText; return { done: t.includes('Hoàn tất'), kg: t.includes('16,5') }; })()`);
    await shot("luong-a10-nguoi-mua-don.png");
    check("Luồng A10: người thu mua tự nhận và làm hết đơn (nhận → đi → cân 16,5kg → thanh toán)", opened && ops.done && ops.kg, JSON.stringify(ops));

    // Ban điều hành chỉ theo dõi: thấy tiến độ, không có nút thao tác thay người mua
    await seed("operator", "light");
    await goto(BASE + "/van-hanh");
    await evaluate(`[...document.querySelectorAll('main li a')].find(x => x.textContent.includes('Anh Khoa'))?.click()`);
    await sleep(900);
    const opsReadOnly = await evaluate(`![...document.querySelectorAll('main button')].some(b => ['Nhận đơn, hẹn giờ', 'Tôi đang tới', 'Lưu số cân'].includes(b.textContent.trim())) && document.querySelector('main').innerText.includes('chỉ theo dõi')`);
    check("Ban điều hành mở đơn thu gom chỉ để theo dõi, không có nút thao tác", opsReadOnly);

    await goto(BASE + "/van-hanh?tab=diem-thuong");
    await evaluate(`[...document.querySelectorAll('main button')].find(b => b.textContent.includes('lan@vidu.vn'))?.click()`);
    await sleep(300);
    await setField("#adj-delta", "10");
    await setField("#adj-reason", "Bù điểm lượt cân bị nhập thiếu");
    await clickByText("Chỉnh điểm");
    await sleep(500);
    const lan = await evaluate(`[...document.querySelectorAll('main button')].find(b => b.textContent.includes('lan@vidu.vn'))?.textContent`);
    await shot("luong-a10-diem-thuong.png");
    // 50 + 62 − 80 + 5 = 37, chỉnh +10 → 47
    check("Luồng A10: chỉnh tay +10 điểm cho chị Lan (37 → 47)", /47$/.test(lan ?? ""), lan);

    // A6: bản đồ có đủ điểm; link ?thung= từ trang thùng mở đúng popup
    await seed("resident", "light");
    await goto(BASE + "/ban-do?thung=tc-003", 3000);
    const map = await evaluate(`({
      markers: document.querySelectorAll('.gc-map path.leaflet-interactive').length,
      tiles: [...document.querySelectorAll('.gc-map img.leaflet-tile')].filter(i => i.complete && i.naturalWidth > 0).length,
      popup: document.querySelector('.gc-map .leaflet-popup')?.innerText ?? '',
    })`);
    await shot("luong-a6-ban-do.png");
    check("Luồng A6: bản đồ vẽ đủ điểm (≥ 30) và tải được ô bản đồ", map.markers >= 30 && map.tiles > 0, `điểm: ${map.markers}, ô bản đồ: ${map.tiles}`);
    check("Luồng A6: ?thung=tc-003 mở popup của thùng TC-003", map.popup.includes("TC-003"), map.popup.slice(0, 80));

    // A7: doanh nghiệp giữ lô 48 giờ → tới lấy hàng → bấm đã lấy
    await seed("business", "light");
    await goto(BASE + "/doanh-nghiep");
    const firstLot = await evaluate(`document.querySelector('main li .font-mono')?.textContent`);
    await clickByText("Giữ lô 48 giờ");
    await sleep(500);
    await evaluate(`document.querySelector('[role="dialog"] form button[type="submit"]')?.click()`);
    await sleep(600);
    await clickByText("Lô tôi đang giữ", { exact: false });
    await sleep(500);
    const holding = await evaluate(`(() => { const t = document.querySelector('main').innerText; return t.includes(${JSON.stringify(firstLot ?? "?")}) && t.includes('Còn'); })()`);
    await shot("luong-a7-giu-lo.png");
    check("Luồng A7: doanh nghiệp giữ lô, lô hiện trong 'Lô tôi đang giữ'", holding, firstLot);
    const sold = await clickByText("Đã lấy hàng", { within: "main" });
    await sleep(400);
    await clickByText("Lô đang bán", { exact: false, within: "main" });
    await sleep(400);
    await evaluate(`[...document.querySelectorAll('main input[type="checkbox"]')].forEach((c) => c.checked && c.click())`);
    await sleep(400);
    const soldShown = await evaluate(`[...document.querySelectorAll('main li')].find(l => l.textContent.includes(${JSON.stringify(firstLot ?? "?")}))?.textContent.includes('Đã bán')`);
    check("Luồng A7: doanh nghiệp lấy hàng xong, lô chuyển 'Đã bán'", sold && soldShown, `${firstLot}: bấm ${sold}, đã bán ${soldShown}`);

    // Nhu cầu thu mua: doanh nghiệp đăng → (bản demo) vựa mẫu chào hàng sau ~15 giây → doanh nghiệp nhận
    await goto(BASE + "/doanh-nghiep/nhu-cau");
    await clickByText("Đăng nhu cầu", { within: "main" });
    await sleep(300);
    await setField("#nd-kg", "300");
    await setField("#nd-price", "900");
    await setField("#nd-note", "Rau củ hết hạn, không lẫn nilon");
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    let offered = false;
    for (let i = 0; i < 12 && !offered; i++) {
      await sleep(2000);
      offered = await evaluate(`[...document.querySelectorAll('main button')].some(b => b.textContent.trim() === 'Nhận')`);
    }
    await clickByText("Nhận", { within: "main" });
    await sleep(400);
    const acceptedOffer = await evaluate(`document.querySelector('main').innerText.includes('Đã nhận')`);
    await shot("luong-nhu-cau-doanh-nghiep.png");
    check("Nhu cầu thu mua: doanh nghiệp đăng, có lời chào hàng, bấm nhận", offered && acceptedOffer, `có chào: ${offered}, đã nhận: ${acceptedOffer}`);

    // Vựa: chào hàng vào nhu cầu mẫu; đăng lô bán cho doanh nghiệp
    await seed("partner", "light");
    await goto(BASE + "/doi-tac/nhu-cau");
    await clickByText("Chào hàng", { within: "main" });
    await sleep(300);
    await setField("#offer-kg", "120");
    await evaluate(`document.querySelector('[role="dialog"] form button[type="submit"]').click()`);
    await sleep(500);
    check("Vựa: chào hàng vào nhu cầu doanh nghiệp, hiện 'Chờ doanh nghiệp trả lời'", await evaluate(`document.querySelector('main').innerText.includes('Chờ doanh nghiệp trả lời')`));
    await clickByText("Lô của tôi", { within: "aside" });
    await sleep(600);
    await clickByText("Đăng lô mới", { within: "main" });
    await sleep(300);
    await setField("#nl-weightKg", "250");
    await setField("#nl-pricePerKg", "3500");
    await setField("#nl-warehouse", "Vựa Minh Đức, Gò Vấp");
    await setField("#nl-area", "Gò Vấp");
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    await sleep(500);
    const lotListed = await evaluate(`document.querySelector('main table')?.innerText.includes('250kg')`);
    await shot("luong-vua-dang-lo.png");
    check("Vựa: đăng lô 250kg, lô hiện trong 'Lô của tôi'", lotListed);

    // A8: hỏi cách phân loại → gợi ý tức thì từ sổ tay → cộng tác viên trả lời → người hỏi thấy câu trả lời
    await seed("resident", "light");
    await goto(BASE + "/tu-van-phan-loai");
    await attachPhoto('main input[type="file"]');
    await sleep(1000);
    await setField("#consult-description", "chai nhua");
    await sleep(900);
    const suggested = await evaluate(`document.querySelector('[aria-labelledby="suggest"]')?.innerText.includes('Chai nhựa')`);
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    await sleep(1500);
    check("Luồng A8: gõ 'chai nhua' có gợi ý 'Chai nhựa'; gửi câu hỏi thì hiện 'Chờ tư vấn'", suggested && (await evaluate(`document.querySelector('main').innerText.includes('Chờ tư vấn')`)), `gợi ý: ${suggested}`);
    // Trả lời câu hỏi phân loại giờ là việc của ban điều hành (tab Báo cáo)
    await switchRole("Nhóm vận hành");
    await clickByText("Báo cáo", { exact: false, within: "main" });
    await sleep(500);
    const answered = await evaluate(`(() => {
      const li = [...document.querySelectorAll('main li')].find(l => l.textContent.includes('Người Kiểm Thử'));
      const b = li && [...li.querySelectorAll('button')].find(x => x.textContent.trim() === 'Gửi câu trả lời');
      b?.click(); return !!b;
    })()`);
    await sleep(400);
    await switchRole("Người dân");
    await clickByText("Hỏi cách phân loại", { within: "main" });
    await sleep(800);
    const seen = await evaluate(`document.querySelector('main').innerText.includes('Đã trả lời')`);
    await shot("luong-a8-tu-van.png");
    check("Luồng A8: ban điều hành trả lời, người hỏi thấy 'Đã trả lời'", answered && seen, `trả lời: ${answered}, thấy: ${seen}`);

    // Phân chợ: người dân chỉ thấy đồ thanh lý; tin phế liệu không có nút đặt
    await seed("resident", "light");
    await goto(BASE + "/kham-pha");
    const residentMarket = await evaluate(`(() => { const t = document.querySelector('main').innerText; return { scrap: t.includes('Giấy carton'), secondhand: t.includes('Máy quạt') }; })()`);
    check("Phân chợ: người dân thấy đồ thanh lý, không thấy phế liệu", !residentMarket.scrap && residentMarket.secondhand, JSON.stringify(residentMarket));
    await goto(BASE + "/san-pham/p1");
    const scrapLocked = await evaluate(`![...document.querySelectorAll('main button')].some(b => b.textContent.trim() === 'Đặt mua') && document.querySelector('main').innerText.includes('dành cho người thu mua')`);
    check("Phân chợ: người dân mở tin phế liệu thì không đặt được, có lời giải thích", scrapLocked);

    // Đơn mua bán: người dân đặt một món thanh lý → trang đơn "chờ người bán" → đơn nằm trong Đơn mua của tôi
    await goto(BASE + "/san-pham/p5");
    await clickByText("Đặt mua", { within: "main" });
    await sleep(400);
    await setField("#order-qty", "Khoảng 5 kg");
    await clickByText("Linh hoạt", { within: '[role="dialog"]' });
    await clickByText("Gửi đơn cho người bán", { within: '[role="dialog"]' });
    await sleep(1200);
    const orderPage = await evaluate(`({ path: location.pathname, pending: !!document.querySelector('main')?.innerText.includes('Chờ người bán xác nhận') })`);
    await shot("luong-don-mua.png");
    check("Đơn mua bán: đặt tin mẫu → mở trang đơn, chờ người bán xác nhận", orderPage.path.startsWith("/don/") && orderPage.pending, JSON.stringify(orderPage));
    await clickByText("Đơn mua của tôi", { exact: false, within: "aside" });
    await sleep(700);
    const listed = await evaluate(`document.querySelector('main')?.innerText.includes('Khoảng 5 kg')`);
    check("Đơn mua bán: đơn vừa đặt nằm trong Đơn mua của tôi", listed);

    // Phía người bán: đăng tin → người mua mô phỏng (bản demo) đặt sau ~15 giây → nhận đơn → giao xong → tin thành "Đã bán"
    await clickByText("Tôi bán", { within: "aside" });
    await sleep(700);
    const sellMenu = await evaluate(`[...document.querySelectorAll('aside a')].some(a => a.textContent.trim() === 'Đơn đến') && ![...document.querySelectorAll('aside a')].some(a => a.textContent.trim() === 'Đơn mua của tôi')`);
    check("Công tắc 'Tôi bán' đổi sang menu người bán (không còn mục mua)", sellMenu);
    await clickByText("Đăng tin bán", { within: "aside" });
    await sleep(700);
    await clickByText("Điền thử dữ liệu mẫu", { within: "main" });
    await sleep(300);
    await evaluate(`document.querySelector('main form button[type="submit"]').click()`);
    await sleep(1500);
    await clickByText("Đơn đến", { exact: false, within: "aside" });
    let incoming = false;
    for (let i = 0; i < 12 && !incoming; i++) {
      await sleep(2000);
      incoming = await evaluate(`!!document.querySelector('main a[href^="/don/"]')`);
    }
    const partnerBuyer = await evaluate(`/ve chai|Vựa|thu mua/.test(document.querySelector('main').innerText)`);
    check("Phân chợ: tin phế liệu (chai nhựa) có người thu mua đặt, không phải người dân", partnerBuyer);
    await evaluate(`document.querySelector('main a[href^="/don/"]')?.click()`);
    await sleep(900);
    await clickByText("Nhận đơn", { within: "main" });
    await sleep(500);
    await clickByText("Đã giao xong", { within: "main" });
    await sleep(500);
    const sellerDone = await evaluate(`document.querySelector('main')?.innerText.includes('Giao dịch đã xong')`);
    await clickByText("Tin đăng của tôi", { exact: false, within: "aside" });
    await sleep(700);
    const listingSold = await evaluate(`[...document.querySelectorAll('main li')].some(l => l.innerText.includes('Đã bán'))`);
    await shot("luong-don-ban.png");
    check("Đơn mua bán: người bán nhận đơn đến, giao xong, tin chuyển 'Đã bán'", incoming && sellerDone && listingSold, `đơn đến: ${incoming}, xong: ${sellerDone}, đã bán: ${listingSold}`);

    // Người thu mua: khu riêng chỉ có phế liệu → đặt thu mua một lô → đơn nằm trong Đơn thu mua
    await seed("partner", "light");
    await goto(BASE + "/kham-pha", 2500);
    check("Người thu mua mở trang mua của người dân thì được đưa về khu người thu mua", (await evaluate("location.pathname")) === "/doi-tac");
    const partnerMarket = await evaluate(`(() => { const t = document.querySelector('main').innerText; return { scrap: t.includes('Giấy carton'), secondhand: t.includes('Máy quạt') }; })()`);
    check("Phân chợ: người thu mua thấy phế liệu, không thấy đồ thanh lý", partnerMarket.scrap && !partnerMarket.secondhand, JSON.stringify(partnerMarket));
    await evaluate(`document.querySelector('main a[href="/doi-tac/tin/p1"]')?.click()`);
    await sleep(900);
    await clickByText("Đặt mua", { within: "main" });
    await sleep(400);
    await setField("#order-qty", "Cả kiện 20 kg");
    await clickByText("Sáng (8h–11h)", { within: '[role="dialog"]' });
    await clickByText("Gửi đơn cho người bán", { within: '[role="dialog"]' });
    await sleep(1200);
    const partnerOrder = await evaluate(`({ path: location.pathname, pending: !!document.querySelector('main')?.innerText.includes('Chờ người bán xác nhận') })`);
    await shot("luong-doi-tac-thu-mua.png");
    check("Người thu mua: đặt lô phế liệu → trang đơn trong khu người thu mua", partnerOrder.path.startsWith("/doi-tac/don/") && partnerOrder.pending, JSON.stringify(partnerOrder));
    await clickByText("Đơn thu mua", { exact: false, within: "aside" });
    await sleep(700);
    check("Người thu mua: đơn vừa đặt nằm trong Đơn thu mua", await evaluate(`document.querySelector('main')?.innerText.includes('Cả kiện 20 kg')`));
  }
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
console.log(`\nẢnh chụp để tự soát: ${path.relative(ROOT, SHOTS).replaceAll("\\", "/")}/`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n✗ ${failed} mục FAIL — CHƯA HOÀN THÀNH.` : `\n✓ TẤT CẢ ĐẠT.`);
process.exit(failed ? 1 : 0);
