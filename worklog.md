# Worklog — Green City Project

---
Task ID: 1
Agent: main
Task: Khởi tạo môi trường + thu thập hình ảnh

Work Log:
- Init fullstack env (Next.js 16 + TS + Tailwind 4 + shadcn/ui + framer-motion + lucide)
- Tìm 29 ảnh OSS qua image-search (hero, 6 danh mục, sản phẩm, dịch vụ, lá cây)

Stage Summary:
- Stack: Next.js 16 App Router, mọi view trong route `/` (SPA state-based navigation)
- Ảnh OSS: /home/z/my-project/scripts/img-inventory.json
- Palette: #248B52 / #14532D / #A7E8B2 / #8B6848 / #F7FAF5 / #17251C / #718078 / #E3EAE3 / #D97706
- Font: Be Vietnam Pro (hỗ trợ tiếng Việt đầy đủ)

---
Task ID: 2
Agent: main
Task: Xây dựng toàn bộ website Green City

Work Log:
- Design tokens trong globals.css (palette Green City, xs breakpoint, keyframes: gradient-drift, leaf-float, pulse-ring, nudge-x, ticker; prefers-reduced-motion)
- layout.tsx: Be Vietnam Pro + metadata tiếng Việt + favicon SVG lá/vòng tuần hoàn
- types/index.ts: Category, Product, Seller, CollectionRequest, Route, ToastItem...
- data/mock-data.ts: 10 sản phẩm VN, 6 danh mục, 3 yêu cầu, activities, impact stats, 29 ảnh OSS
- store/app-store.tsx: Context + useReducer; route/pendingRoute/discoverPreset/user/products/favorites/requests/toasts; localStorage persist
- Components: Logo (SVG vòng tuần hoàn + mầm lá), SmartImage (fallback đẹp), Reveal, GcModal (Escape+backdrop, scale .96→1), GcToasts (desktop top-right dưới header, mobile bottom), AuthField (floating label + đủ trạng thái), SubmitButton (idle/loading/success), Counter, ProductCard, CategoryCard, EmptyState, Navbar (sticky glass + mobile menu), Footer (link có hành vi thật)
- Views: LandingPage (hero bất đối xứng + 4 thẻ nổi + ticker giá, 6 danh mục, 8 sản phẩm, thu gom + modal, quy trình 3 bước nền forest, impact counter demo, CTA band), AuthScreen (2 cột, gradient drift, stagger, login/register/forgot chuyển direction-aware), AppShell (sidebar layoutId pill + drawer + notif), Dashboard, Discover (search/category/price/area/sort/status filter thật), ProductDetail (contact modal, related), Sell (validate + ảnh mẫu + preview giá), Collect, Favorites, Profile (edit inline, tabs)
- page.tsx: AppProvider + splash animation + route switching AnimatePresence

Bugs tìm & sửa trong quá trình test (Agent Browser + VLM):
1. Import CATEGORIES sai module → 500 → sửa import từ mock-data
2. Logout crash: AnimatePresence giữ AppShell exit với user=null → thêm guard return null
3. Nút submit idle rỗng chữ (thiếu children) → thêm label
4. Toast che nút navbar → reposition top-84px desktop / bottom mobile
5. Double-submit (onClick + form onSubmit cùng chạy → LOGIN/ADD_PRODUCT ×2, pendingRoute bị ghi đè mất) → bỏ onClick, chỉ dùng form onSubmit
6. 4 lỗi lint react-hooks/set-state-in-effect → tái cấu trúc (Counter, AppShell, AuthScreen, DiscoverView lazy-init)

Stage Summary:
- Website hoàn chỉnh: landing + auth 3 chế độ + 7 trang app, 10+ tương tác frontend thật
- Agent Browser E2E đã verify: login/register/forgot/logout, pendingRoute (guest click sản phẩm/danh mục/footer → login → đúng trang), search/filter/sort, favorite, đăng tin (xuất hiện Discover + Profile), yêu cầu thu gom (modal + trang), mobile drawer, responsive 360/390/768/1366/1440 không overflow, không lỗi console
- Lint sạch, dev server 200
- Screenshot kiểm chứng: /home/z/my-project/scripts/shot-*.png, final-*.png
