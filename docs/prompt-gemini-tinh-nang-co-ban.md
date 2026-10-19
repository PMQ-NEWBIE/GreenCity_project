# Prompt cho Gemini 3.8 Flash (Antigravity): 6 tính năng cơ bản của Green City

> **Cách dùng**
> 1. **Chỉ dán khi Claude đã báo "Nền móng xong"**. Đó là Giai đoạn 0 trong `docs/prompt-claude-tinh-nang-nang-cao.md`. Dán sớm hơn, Gemini sẽ không tìm thấy hook, route và các lệnh kiểm tra.
> 2. Mở thư mục `C:\123` trong Antigravity, chọn Gemini 3.8 Flash, rồi dán **toàn bộ** phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT".
> 3. Claude làm cùng lúc **trong chính thư mục `C:\123`**. Hai bên chia nhau theo file, không chia thư mục.

---

## BẮT ĐẦU PROMPT

# VAI TRÒ
Bạn là **frontend developer kiêm designer** của Green City. Đây là web Next.js 16 + React 19 + Tailwind 4 giúp người dân TP.HCM bán ve chai, gọi thu gom tận nhà và sống xanh hơn. Thế mạnh của bạn là giao diện đẹp, rõ ràng, dễ dùng.

Việc của bạn: **làm giao diện cho 6 tính năng cơ bản B1–B6** ở dưới, dựa trên dữ liệu và hàm Claude đã chuẩn bị sẵn.

Phải làm **trọn cả 6 tính năng**, tới khi mọi mục ở ĐỊNH NGHĨA HOÀN THÀNH đều đạt.
- Không làm một nửa, không để lại TODO.
- Không báo "xong" khi còn bất kỳ mục FAIL nào.
- Không hỏi lại người dùng giữa chừng, trừ các trường hợp ở mục KHI GẶP KHÓ.

# BẠN ĐANG LÀM CHUNG VỚI CLAUDE: ĐỌC KỸ TRƯỚC KHI VIẾT DÒNG CODE NÀO
Dự án có **hai bên làm cùng lúc**:

| | Bạn (Gemini) | Claude (Claude Code) |
|---|---|---|
| Phần việc | Giao diện của 6 tính năng cơ bản | Nền móng (dữ liệu, store, route, menu, phân quyền) và 10 tính năng nâng cao |
| Thư mục | `C:\123` | `C:\123` (chung với bạn) |
| Nhánh git | `main` | `main` (chung với bạn) |
| Tiền tố commit | `[gemini]` | `[claude]` |
| Thư mục build | `.next` (mặc định) | `.next-claude` |
| Cổng | dev `3000`, kiểm tra `3100` | `3200`, `3300` |
| Ghi chú gửi bên kia | `docs/collab/gemini-yeu-cau.md` | `docs/collab/claude-thong-bao.md` |

Hai bên **làm cùng lúc, trong cùng một thư mục, trên cùng nhánh `main`**. Vì vậy lúc nào trong thư mục cũng có thể có file Claude đang sửa dở. `git status` sẽ hiện cả file của Claude: **đó không phải việc của bạn, để yên cho chúng.**

**Luật làm chung** (vi phạm bất kỳ điều nào là thất bại):
1. **Mỗi file chỉ có một chủ.**
   - Bạn chỉ được tạo và sửa file nằm trong mục FILE CỦA BẠN.
   - Mọi file khác là của Claude. **Không sửa dù chỉ một ký tự**: kể cả khi thấy lỗi, kể cả "sửa giúp", kể cả format lại.
2. **Cần Claude đổi gì thì viết yêu cầu, không tự làm.**
   - Ví dụ: cần thêm trường dữ liệu, thêm hàm vào store, thêm route hay mục menu, sửa lỗi trong file của Claude.
   - Cách làm: ghi vào `docs/collab/gemini-yeu-cau.md` theo mẫu bên dưới, rồi làm tiếp việc khác.
   - **Không tự chế đường vòng**: không tạo store riêng, không đọc/ghi `localStorage` trực tiếp, không copy file của Claude ra để sửa, không tạo route mới.
3. **Chỉ import từ danh sách ở mục ĐƯỢC IMPORT.** Đó là "hợp đồng" giữa hai bên. Claude chỉ được **thêm** vào hợp đồng, không đổi hay xóa cái đã có.
4. **Git: chỉ đụng vào file của mình.**
   - Chỉ stage file của bạn, bằng **đúng lệnh này** (không dùng cách khác):
     ```
     git add -- src/features/learn src/features/points src/features/rewards src/features/green-shops src/features/swap src/data/knowledge.ts src/data/green-shops.ts public/content docs/collab/gemini-yeu-cau.md docs/collab/gemini-bao-cao.md
     ```
   - **CẤM tuyệt đối** các lệnh sau. Chúng sẽ commit nhầm hoặc **xóa mất** code Claude đang làm dở trong cùng thư mục:
     `git add -A`, `git add .`, `git commit -a`, `git stash`, `git reset`, `git restore` (trừ `git restore --staged`), `git checkout -- <file>`, `git clean`, `git checkout <nhánh>`, `git switch`, `git merge`, `git rebase`, `git pull`, `git push`.
   - Commit báo lỗi `index.lock` nghĩa là Claude cũng đang commit: đợi 10 giây rồi chạy lại.
5. **Không tắt tiến trình** mà bạn không tự mở. Claude có thể đang chạy server ở cổng 3200 và 3300.
6. **Trước mỗi commit**, chạy `npm run collab:check -- gemini`. Lệnh này kiểm file đang stage và các commit `[gemini]` của bạn.
   - Nếu báo FAIL vì stage nhầm file của Claude: bỏ stage bằng `git restore --staged -- <đường dẫn>`. Lệnh này **không** xóa thay đổi của ai.
   - Nếu bạn lỡ **sửa** file của Claude: dừng lại, báo người dùng tên file đó. Không tự hoàn tác, vì có thể làm mất code của Claude.
   - Xong chạy lại cho tới khi ĐẠT.
7. **Lỗi build hoặc lint nằm trong file của Claude** (Claude có thể đang sửa dở):
   - Không sửa file đó.
   - Trong lúc chờ, kiểm code của riêng bạn bằng `npx eslint src/features/learn src/features/points src/features/rewards src/features/green-shops src/features/swap src/data/knowledge.ts src/data/green-shops.ts`.
   - Đợi 2 phút rồi chạy lại, tối đa 5 lần. Vẫn lỗi thì ghi vào `gemini-yeu-cau.md` (kèm dòng lỗi), báo người dùng, và làm tiếp việc khác.
8. **Đầu mỗi tính năng**, đọc `docs/collab/claude-thong-bao.md`. Claude ghi ở đó khi thêm gì vào hợp đồng, hoặc khi trả lời yêu cầu của bạn.

Mẫu ghi yêu cầu trong `docs/collab/gemini-yeu-cau.md`. Thêm xuống cuối file, không xóa yêu cầu cũ:
```
## YC-<số> · <tiêu đề ngắn>
- Tính năng: B<số>
- Cần gì: <cụ thể: tên trường, kiểu dữ liệu, tên hàm, chữ ký hàm>
- Vì sao: <không có thì giao diện thiếu gì>
- Tạm thời: <giao diện đang xử lý ra sao khi chưa có, ví dụ: ẩn nút đó>
- Trạng thái: chờ Claude
```

# HIỆN TRẠNG

## Đã có sẵn: không làm lại, không sửa, không "cải thiện"
- Lobby `/`, đăng nhập, đăng ký, quên mật khẩu (bản demo).
- `/tong-quan` (tổng quan), `/kham-pha` (khám phá và mua ve chai), `/san-pham/[id]` (chi tiết tin), `/dang-tin` (đăng tin bán), `/yeu-thich` (đã lưu), `/ho-so` (hồ sơ).
- `/thu-gom` (gọi thu gom tận nhà, bản đầy đủ của Claude).

## Claude đã làm xong: bạn không làm, không sửa, không tạo trang thay
Các tính năng này đã chạy được. Bạn **chỉ được đặt link** tới route của chúng:
- Thu gom tận nhà bản nâng cấp: `ROUTES.collect`
- Thùng thu gom cố định và báo thùng đầy: `ROUTES.bins`
- Báo điểm rác tự phát: `ROUTES.litterReport`
- Bản đồ xanh: `ROUTES.map`
- Tư vấn phân loại qua ảnh: `ROUTES.consult`
- Chợ vật liệu cho doanh nghiệp: `ROUTES.materials`
- Thống kê: `ROUTES.stats`
- Khu cộng tác viên: `ROUTES.ctv`
- Khu quản trị: `ROUTES.admin`

Claude cũng nắm toàn bộ logic tính điểm, phân quyền, menu và thanh điều hướng.

## Dữ liệu của bạn được tính năng của Claude dùng lại
Viết dữ liệu cẩn thận, vì hai tính năng của Claude đọc thẳng từ file của bạn:
- **`SORTING_GUIDE`** (B1) là nguồn gợi ý tức thì của trang Hỏi cách phân loại (`ROUTES.consult`). Gợi ý so khớp `name` và `aliases` không dấu, nên mỗi món cần đủ các tên mà người dân hay gọi (ví dụ "hộp sữa giấy", "vỏ hộp sữa", "hộp giấy uống sữa").
- **`GREEN_SHOPS`** (B5) được vẽ lên Bản đồ xanh (`ROUTES.map`). Sai `lat`/`lng` thì điểm nằm lệch quận.

## Cách có dữ liệu thật để tự thử giao diện
- Mỗi người dùng mới có sẵn 50 điểm chào mừng.
- Muốn có thêm điểm và lịch sử để thử B3, B4: vào `ROUTES.collect`, gửi một yêu cầu, rồi bấm "Chuyển sang bước tiếp theo" trong khối **Chế độ demo** cho tới khi hoàn tất. Mỗi kg được cộng điểm.
- Muốn có mục "chờ xác minh" và "không được duyệt": vào `ROUTES.bins` bấm **Bỏ đồ**. Sau đó vào **Hồ sơ → Chế độ demo: đổi vai trò**, chọn Cộng tác viên, rồi duyệt hoặc bác ở **Khu cộng tác viên**.
- Đổi vai trò chỉ để thử. Xong nhớ đổi lại "Người dân".

# HỢP ĐỒNG DỮ LIỆU: `src/features/contracts.ts`
File này do Claude viết. Bạn **chỉ import từ đây**, không import thẳng từ store hay từ `mock-data`.

**Đọc kỹ file trước khi code. Nếu file và prompt này khác nhau, làm theo file**, rồi ghi khác biệt vào báo cáo.

Tóm tắt những gì file cung cấp:

```ts
// Đường dẫn và khu vực
ROUTES            // dùng ROUTES.xxx cho mọi link, không gõ tay "/kien-thuc"
AREAS, type Area  // danh sách quận

// Người dùng và thông báo
useCurrentUser(): DemoUser | null                        // { name, email, memberSince, role }
useToast(): (kind: "success" | "error" | "info", title: string, description?: string) => void

// Định dạng
formatDate(iso: string): string           // "19/10/2026"
formatDateTime(iso: string): string       // "07:30 · 19/10/2026"
formatRelativeTime(iso: string): string   // "3 giờ trước", "Hôm qua"
compressImage(file: File): Promise<string> // nén ảnh thành data URL, dùng cho ô chọn ảnh

// Điểm thưởng (B2, B3)
type PointReason = "welcome" | "home_pickup" | "bin_dropoff" | "litter_report" | "bin_full_report" | "redeem" | "admin_adjust"
type PointStatus = "pending" | "confirmed" | "rejected"
interface PointEntry { id; at: string /*ISO*/; delta: number /* + cộng, − trừ */; reason: PointReason; title: string; status: PointStatus; refId?: string }
interface PointRule  { id; reason: PointReason; activity: string; points: number; unit: string /* "lần", "kg"... */; condition: string }
POINT_RULES: PointRule[]
POINT_REASON_LABEL: Record<PointReason, string>
POINT_STATUS_LABEL: Record<PointStatus, string>
usePoints(): { balance: number; pending: number; entries: PointEntry[] /* mới nhất trước */ }

// Đổi quà (B4)
type RewardCategory = "phan-bon" | "tui-vai" | "do-dung" | "cay-giong"
interface Reward { id; name; category: RewardCategory; partnerName: string; pointsCost: number; stock: number; image: string; description: string; pickupNote: string }
type RedemptionStatus = "ready" | "collected" | "expired"
interface Redemption { id; rewardId; rewardName; pointsSpent: number; code: string; at: string; expiresAt: string; status: RedemptionStatus }
type RedeemResult = { ok: true; redemption: Redemption } | { ok: false; reason: "not_logged_in" | "not_enough_points" | "out_of_stock" }
REWARD_CATEGORY_LABEL, REDEMPTION_STATUS_LABEL
useRewards(): { rewards: Reward[] /* tồn kho đang cập nhật */; redemptions: Redemption[]; redeem(rewardId: string): RedeemResult }

// Trao đổi đồ (B6)
type SwapCategory  = "quan-ao" | "sach" | "gia-dung" | "do-tre-em" | "khac"
type SwapCondition = "nhu-moi" | "tot" | "da-dung"
type SwapStatus    = "open" | "reserved" | "done"
interface SwapItem { id; title; category: SwapCategory; condition: SwapCondition; description: string; image: string; area: Area;
                     giveaway: boolean /* true = tặng miễn phí */; wants: string /* muốn đổi lấy gì, rỗng nếu tặng */;
                     postedAt: string; status: SwapStatus; owner: { name: string; initials: string }; isMine?: boolean }
type NewSwapItem = Pick<SwapItem, "title" | "category" | "condition" | "description" | "image" | "area" | "giveaway" | "wants">
SWAP_CATEGORY_LABEL, SWAP_CONDITION_LABEL, SWAP_STATUS_LABEL
SWAP_SAMPLE_IMAGES: { url: string; label: string }[]
useSwap(): { items: SwapItem[]; addItem(input: NewSwapItem): SwapItem; setStatus(id: string, status: SwapStatus): void; removeItem(id: string): void }

// Kiến thức (B1): kiểu do Claude định nghĩa, dữ liệu do BẠN viết
type WasteGroup = "tai-che" | "thuc-pham" | "khac" | "nguy-hai" | "cong-kenh"
WASTE_GROUPS: Record<WasteGroup, { label: string; description: string }>
type ArticleTopic = "phan-loai" | "u-phan" | "giam-rac" | "tai-su-dung"
ARTICLE_TOPIC_LABEL: Record<ArticleTopic, string>
type ArticleBlock =
  | { type: "p"; text: string } | { type: "h2"; text: string } | { type: "steps"; items: string[] }
  | { type: "tip"; text: string } | { type: "image"; src: string; alt: string; caption?: string }
interface Article { slug; title; summary; topic: ArticleTopic; readMinutes: number; cover: string; updatedAt: string /*ISO*/;
                    blocks: ArticleBlock[]; video?: { title: string; youtubeId: string | null; duration: string } }
interface SortingGuideItem { id; name: string; aliases: string[]; group: WasteGroup; prep: string; note?: string }

// Gian hàng xanh (B5): kiểu do Claude định nghĩa, dữ liệu do BẠN viết
type GreenShopKind = "phan-bon" | "lam-vuon" | "san-pham-xanh"
GREEN_SHOP_KIND_LABEL: Record<GreenShopKind, string>
interface GreenShopProduct { id; name; price: number; unit: string; description: string; image?: string }
interface GreenShop { slug; name; kind: GreenShopKind; area: Area; address: string; lat: number; lng: number; openHours: string;
                      phoneMasked: string; description: string; cover: string; isPartnerReward: boolean; products: GreenShopProduct[] }
```

# 6 TÍNH NĂNG CỦA BẠN
Các route và file View dưới đây Claude **đã tạo sẵn ở dạng khung**: trang `page.tsx`, tiêu đề trang, `<Suspense>`, kiểm tra đăng nhập. Bạn chỉ thay ruột file View.

| Mã | Tính năng (mục yêu cầu) | Route → file View | Cần đăng nhập |
|---|---|---|---|
| B1 | Kiến thức môi trường (III.3) | `/kien-thuc` → `src/features/learn/LearnView.tsx`<br>`/kien-thuc/[slug]` → `src/features/learn/ArticleView.tsx` (prop `slug`)<br>`/kien-thuc/so-tay` → `src/features/learn/SortingGuideView.tsx` | Không |
| B2 | Quy tắc tính điểm công khai (I.4) | `/diem-thuong/quy-tac` → `src/features/points/PointRulesView.tsx` | Không |
| B3 | Lịch sử điểm của tôi (I.4) | `/diem-thuong` → `src/features/points/PointsView.tsx` | Có |
| B4 | Đổi điểm lấy quà xanh (II.3) | `/doi-qua` → `src/features/rewards/RewardsView.tsx` | Có |
| B5 | Gian hàng doanh nghiệp xanh (III.4) | `/gian-hang` → `src/features/green-shops/ShopsView.tsx`<br>`/gian-hang/[slug]` → `src/features/green-shops/ShopDetailView.tsx` (prop `slug`) | Không |
| B6 | Khu trao đổi đồ tái sử dụng (II.2) | `/trao-doi` → `src/features/swap/SwapView.tsx`<br>`/trao-doi/dang` → `src/features/swap/SwapPostView.tsx`<br>`/trao-doi/[id]` → `src/features/swap/SwapDetailView.tsx` (prop `id`) | Có |

**Trang công khai (cột "Cần đăng nhập" = Không) mở được khi chưa đăng nhập.** Lúc đó `useCurrentUser()` trả về `null`.
- Không được giả định có người dùng: không đọc `user.name` khi chưa kiểm tra `null`.
- Ở trang công khai, nút nào cần tài khoản thì đổi thành link "Đăng nhập để …" dẫn tới `ROUTES.login`.

## B1. Kiến thức môi trường và sổ tay phân loại

### Dữ liệu
Bạn viết dữ liệu trong `src/data/knowledge.ts`, export đúng 2 tên `ARTICLES: Article[]` và `SORTING_GUIDE: SortingGuideItem[]`.

**Bài viết**
- Ít nhất **8 bài**, mỗi chủ đề `ArticleTopic` ít nhất 2 bài, mỗi bài 400–900 chữ.
- Gợi ý đề bài:
  - Phân loại rác tại nhà thành 3 nhóm chính
  - Chuẩn bị ve chai để bán được giá: rửa, ép dẹt, tách loại
  - Ủ phân hữu cơ từ rác bếp trong thùng xốp
  - Ủ vỏ trái cây làm nước tẩy rửa
  - Đi chợ ít túi nilon
  - Pin, bóng đèn, thuốc hết hạn bỏ ở đâu
  - Cho đồ cũ một vòng đời mới: quần áo, sách
  - Sửa trước khi vứt
- `slug` viết không dấu, nối bằng gạch ngang. **Không được dùng slug `so-tay`.**
- `video` chỉ thêm cho 3–4 bài. **`youtubeId` luôn để `null`, không được bịa ID.**

**Sổ tay phân loại**
- Ít nhất **60 món** đồ thường gặp trong nhà ở Việt Nam, đủ cả 5 nhóm `WasteGroup`, mỗi nhóm ít nhất 6 món.
- Mỗi món có ít nhất 1 tên gọi khác trong `aliases`, ví dụ "lon bia" có thêm "vỏ lon", "lon nước ngọt".
- `prep` là **một câu** nói cần làm gì trước khi bỏ, ví dụ: "Tráng sơ, bóp dẹt, bỏ chung túi lon."

**Văn phong** (áp dụng cho mọi chữ bạn viết)
- Tiếng Việt đời thường, câu ngắn, nói thẳng cần làm gì.
- Không trích số hiệu luật, nghị định hay quyết định.
- Không đưa số liệu thống kê, không nêu tên thương hiệu thật, không emoji.

### Giao diện `/kien-thuc`
- Mở đầu bằng `PageIntro`.
- **Khối dẫn tới Sổ tay phân loại**: có một ô tìm nhanh. Gõ rồi Enter thì chuyển tới `` `${ROUTES.sortingGuide}?q=<từ khóa>` ``.
- **Chip lọc chủ đề**: "Tất cả" và 4 chủ đề. Lưu trên URL `?chu-de=`, giống cách `DiscoverView` lưu `?danh-muc=` (dùng `useSearchParams` và `router.replace(..., { scroll: false })`).
- **Danh sách bài**: 1 bài mới nhất làm thẻ lớn nằm ngang trên desktop, phía dưới là lưới thẻ.
  - Mỗi thẻ có: ảnh bìa 4:3, nhãn chủ đề, tiêu đề, tóm tắt cắt ở 2 dòng, "X phút đọc".
  - Lưới: 1 cột trên điện thoại, 2 cột từ `sm`, 3 cột từ `lg`.
  - Thẻ dùng kiểu link phủ cả thẻ giống `ProductCard`.
- Không có bài nào khớp bộ lọc thì hiện `EmptyState`.

### Giao diện `/kien-thuc/[slug]`
- **Đầu bài**:
  - Link quay lại "Tất cả bài viết".
  - Tiêu đề bài.
  - Dòng meta: chủ đề · X phút đọc · Cập nhật `formatDate(updatedAt)`.
  - Ảnh bìa.
- **Thân bài**: render lần lượt từng `ArticleBlock`.
  - `p`: đoạn văn.
  - `h2`: tiêu đề mục, nhưng **render bằng thẻ `<h3>`**, vì mỗi trang chỉ được có một `h2`.
  - `steps`: danh sách đánh số, mỗi số nằm trong vòng tròn giống `StepHeading`.
  - `tip`: hộp `bg-accent` có nhãn "Mẹo".
  - `image`: dùng `SmartImage`, kèm chú thích nếu có.
  - Cột chữ rộng tối đa `max-w-[68ch]`, cỡ chữ thân bài 16–17px, `leading-relaxed`.
- **Video**: bài có `video` thì hiện khung 16:9 nền `bg-muted`, có biểu tượng và chữ "Video đang được biên tập".
- **Cuối bài**:
  - Mục "Bài cùng chủ đề", tối đa 3 bài.
  - Một hộp hành động dẫn tới việc liên quan, tùy chủ đề:

    | Chủ đề | Dẫn tới |
    |---|---|
    | phân loại | `ROUTES.sortingGuide` |
    | ủ phân | `ROUTES.rewards` |
    | giảm rác | `ROUTES.collect` |
    | tái sử dụng | `ROUTES.swap` |
- Slug không tồn tại thì hiện `EmptyState` "Không tìm thấy bài viết", kèm nút về `ROUTES.learn`.

### Giao diện `/kien-thuc/so-tay`
- **Tìm kiếm**
  - Ô tìm có sẵn giá trị từ `?q=` trên URL.
  - Tìm trong cả `name` lẫn `aliases`, **không phân biệt dấu và chữ hoa**: gõ "chai nhua" phải ra "Chai nhựa".
  - Tự viết hàm bỏ dấu trong `src/features/learn/lib.ts`: chuẩn hóa NFD, bỏ dấu, đổi "đ" thành "d".
- **5 thẻ giải thích nhóm** ở đầu trang, lấy từ `WASTE_GROUPS` (nhãn + mô tả). Bấm vào thẻ nào thì lọc theo nhóm đó, bấm lần nữa thì bỏ lọc.
- **Màu của từng nhóm**: chỉ dùng token, theo dạng `bg-<token>/10 text-<token>`.

  | Nhóm | Token |
  |---|---|
  | `tai-che` | `primary` |
  | `thuc-pham` | `earth` |
  | `khac` | `muted-foreground` |
  | `nguy-hai` | `destructive` |
  | `cong-kenh` | `warn` |
- **Mỗi kết quả** gồm: tên món, nhãn nhóm, câu `prep`, và `note` nếu có. Phía trên danh sách có dòng đếm "N món".
- **Không tìm thấy** thì hiện `EmptyState` "Chưa có trong sổ tay", kèm nút "Gửi ảnh nhờ tư vấn" dẫn tới `ROUTES.consult`.

## B2. Quy tắc tính điểm công khai
- **Bảng quy tắc**, lấy từ `POINT_RULES`, gồm 3 cột: Hoạt động, Điểm (`points` + `unit`), Điều kiện.
  - Từ `md` trở lên: hiện dạng `<table>`.
  - Dưới `md`: mỗi quy tắc là một thẻ, xếp dọc.
- **Mục "Khi nào điểm được cộng?"**: giải thích 3 trạng thái, dùng nhãn trong `POINT_STATUS_LABEL`.
  - Lúc mới ghi nhận, điểm ở trạng thái chờ xác minh.
  - Cộng tác viên kiểm tra xong thì điểm thành đã cộng, hoặc bị từ chối kèm lý do.
- **Mục "Dùng điểm để làm gì?"**: link tới `ROUTES.rewards`.
- **5 câu hỏi thường gặp**, dạng `<details>`/`<summary>`. Vùng bấm của mỗi `<summary>` cao ít nhất 44px.
- **Mọi con số phải lấy từ `POINT_RULES`**, không gõ tay số điểm vào câu chữ. Claude có thể đổi số, trang phải tự đúng theo.

## B3. Lịch sử điểm của tôi
- **Thẻ số dư**
  - `balance` hiển thị cỡ thật lớn.
  - Nếu `pending > 0`, thêm dòng phụ "+N điểm đang chờ xác minh".
  - Nút chính "Đổi quà" dẫn tới `ROUTES.rewards`, link phụ "Cách tính điểm" dẫn tới `ROUTES.pointRules`.
- **3 thẻ "Kiếm thêm điểm"**, dẫn tới `ROUTES.collect`, `ROUTES.bins` và `ROUTES.litterReport`.
  - Mỗi thẻ có tiêu đề và 1 câu mô tả.
  - Số điểm trên thẻ lấy từ quy tắc **đầu tiên** trong `POINT_RULES` có `reason` tương ứng: `home_pickup`, `bin_dropoff`, `litter_report`.
- **Lịch sử**
  - Chip lọc: Tất cả / Được cộng / Đã dùng / Chờ xác minh.
  - Danh sách **nhóm theo tháng**, ví dụ "Tháng 10/2026".
  - Mỗi dòng gồm:
    - Biểu tượng lucide theo `reason`.
    - `title`.
    - Thời gian `formatDateTime(at)`.
    - Nhãn trạng thái, chỉ hiện khi khác `confirmed`.
    - `note` nếu có, chữ nhỏ màu `text-muted-foreground`. Đây là lý do bị từ chối hoặc lý do nhóm vận hành chỉnh điểm tay.
    - Số điểm canh phải: số dương có dấu `+` màu `text-primary`; số âm có dấu `−` màu `text-foreground`; `rejected` thì gạch ngang và màu `text-muted-foreground`.
- Chưa có mục nào thì hiện `EmptyState` dẫn tới `ROUTES.collect`.

## B4. Đổi điểm lấy quà xanh

### Danh sách quà
- **Đầu trang**: số dư hiện tại lấy từ `usePoints()`, kèm link tới `ROUTES.points`.
- **Lọc**: chip theo `REWARD_CATEGORY_LABEL`.
- **Lưới thẻ quà**: ảnh vuông, tên, đối tác, giá điểm, dòng "Còn N phần".
- **Nút trên thẻ** có 3 trạng thái:

  | Tình huống | Nút |
  |---|---|
  | Đủ điểm và còn hàng | "Đổi quà" |
  | Thiếu điểm | Nút tắt, kèm chữ "Cần thêm N điểm" |
  | Hết hàng | Nút tắt, kèm chữ "Tạm hết" |

### Luồng đổi quà
1. Bấm "Đổi quà" thì mở `GcModal` xác nhận, gồm: tên quà, giá điểm, số dư sau khi đổi, `pickupNote`, và 2 nút "Xác nhận đổi" / "Để sau".
2. Bấm "Xác nhận đổi" thì gọi `redeem(id)`.
3. Nếu kết quả `ok: true`:
   - **Ngay trong modal đó** chuyển sang màn thành công: mã nhận quà `code` cỡ lớn bằng `font-mono`, hạn nhận `formatDate(expiresAt)`, `pickupNote`, nút "Xong".
   - Gọi thêm `toast("success", "Đã đổi quà", <tên quà>)`.
4. Nếu kết quả `ok: false`: hiện lỗi ngay trong modal, theo `reason`:

   | `reason` | Câu báo lỗi |
   |---|---|
   | `not_enough_points` | "Bạn chưa đủ điểm cho món này." |
   | `out_of_stock` | "Quà vừa hết, bạn chọn món khác nhé." |
   | `not_logged_in` | "Phiên đăng nhập đã hết, bạn đăng nhập lại nhé." |

### Quà đã đổi
- Mục "Quà bạn đã đổi" liệt kê `redemptions`. Mỗi dòng: tên quà, mã, ngày đổi, nhãn `REDEMPTION_STATUS_LABEL`.
- Danh sách rỗng thì chỉ cần một câu ngắn, không dùng `EmptyState` lớn.

## B5. Gian hàng doanh nghiệp xanh

### Dữ liệu
Bạn viết `GREEN_SHOPS: GreenShop[]` trong `src/data/green-shops.ts`.
- **Số lượng**: ít nhất **8 gian hàng**, đủ 3 loại `GreenShopKind`, rải ít nhất 5 quận trong `AREAS`. Mỗi gian hàng có 3–6 sản phẩm.
- **Khớp với quà đổi điểm**: mỗi `partnerName` khác nhau trong `REWARDS` phải có **đúng 1 gian hàng trùng tên**, đặt `isPartnerReward: true`. Các gian hàng còn lại đặt `false`.
- **Thông tin hư cấu**:
  - Tên gian hàng hư cấu, không trùng thương hiệu thật.
  - `phoneMasked` có dạng `"09xx xxx 123"`.
  - `address` chỉ ghi tên đường và phường, không ghi số nhà.
- **Tọa độ**:
  - `lat` trong khoảng 10.70–10.90, `lng` trong khoảng 106.60–106.85.
  - Điểm phải nằm gần đúng quận đã ghi, vì Claude dùng tọa độ này để vẽ Bản đồ xanh.

### Giao diện `/gian-hang`
- `PageIntro`, kèm một link "Xem trên bản đồ" dẫn tới `ROUTES.map`.
- **Bộ lọc**: chip theo loại (`GREEN_SHOP_KIND_LABEL`) và ô chọn khu vực.
- **Mỗi thẻ gian hàng**: ảnh bìa, tên, loại, quận, giờ mở cửa. Gian hàng có `isPartnerReward` thì thêm nhãn "Nhận đổi điểm".

### Giao diện `/gian-hang/[slug]`
- **Đầu trang**: ảnh bìa, tên, nhãn loại, mô tả.
- **Khối thông tin**:
  - Địa chỉ, giờ mở cửa, số điện thoại đã che.
  - Link "Xem trên bản đồ" dẫn tới `` `${ROUTES.map}?gian-hang=${slug}` ``.
  - Nút "Liên hệ gian hàng" mở `GcModal`, giống modal liên hệ trong `src/pages-views/ProductDetailView.tsx`: số điện thoại đã che, kèm câu "Bản demo nên số điện thoại được che."
- **Lưới sản phẩm**:
  - Mỗi sản phẩm: tên, giá `formatPrice(price, unit)`, mô tả cắt ở 2 dòng.
  - Ảnh sản phẩm không bắt buộc. Không có ảnh thì dùng ô vuông `bg-accent` có biểu tượng lucide theo loại gian hàng.
- Gian hàng có `isPartnerReward` thì thêm hộp "Gian hàng này nhận đổi điểm Green City", kèm nút tới `ROUTES.rewards`.
- Slug sai thì hiện `EmptyState`.

## B6. Khu trao đổi đồ tái sử dụng
Khác với "Đăng tin bán": ở đây **không có tiền**. Người đăng chọn **tặng miễn phí** hoặc **đổi lấy món khác**. Dữ liệu lấy từ `useSwap()`.

### Giao diện `/trao-doi`
- `PageIntro` và nút chính "Đăng đồ trao đổi" dẫn tới `ROUTES.swapPost`.
- **Bộ lọc**:
  - Ô tìm kiếm.
  - Chip loại (`SWAP_CATEGORY_LABEL`).
  - Ô chọn khu vực.
  - Công tắc "Chỉ đồ tặng miễn phí".
  - Ô chọn trạng thái, mặc định chỉ hiện `open`.
- **Lưới thẻ**:
  - Mỗi thẻ: ảnh 4:3, tiêu đề, nhãn tình trạng (`SWAP_CONDITION_LABEL`), quận, `formatRelativeTime(postedAt)`.
  - Thêm dòng "Tặng miễn phí" nếu là đồ tặng, hoặc "Muốn đổi: <wants>" nếu là đồ đổi.
  - Thẻ có trạng thái `reserved` mang nhãn "Đã có người hẹn". Thẻ `done` thì mờ đi và ghi "Đã trao đổi".
  - Kiểu link phủ cả thẻ giống `ProductCard`.
- Không có kết quả thì hiện `EmptyState` kèm nút "Xóa bộ lọc".

### Giao diện `/trao-doi/dang`
Học theo cấu trúc và cách kiểm lỗi của `src/pages-views/SellView.tsx`, nhưng **viết file mới** trong thư mục của bạn.

**4 bước, mỗi bước dùng `StepHeading`:**
1. **Ảnh**
   - Chụp hoặc chọn từ máy, nén bằng `compressImage(file)`.
   - Hoặc chọn một ảnh trong `SWAP_SAMPLE_IMAGES`.
   - Bắt buộc phải có ảnh.
2. **Món đồ**
   - Tiêu đề: ít nhất 4 ký tự.
   - Loại và tình trạng: chọn bằng chip.
   - Mô tả: ít nhất 20 ký tự, có bộ đếm ký tự.
3. **Bạn muốn gì?**
   - 2 lựa chọn dạng thẻ radio: "Tặng miễn phí" và "Muốn đổi lấy…".
   - Chọn "Muốn đổi lấy…" thì hiện ô `wants`, bắt buộc, ít nhất 3 ký tự.
4. **Khu vực**: chọn quận.

**Khi có lỗi**
- Hiện `FieldError` ngay dưới ô sai.
- Đưa focus vào ô lỗi đầu tiên.
- Gọi toast "Còn vài chỗ cần điền".

**Bố cục và nút**
- Cột phải (từ `lg`): ô xem trước thẻ, dính khi cuộn, kèm `SubmitButton`.
- Có nút phụ "Điền thử dữ liệu mẫu" giống SellView.

**Khi gửi thành công**
1. Gọi `addItem(input)`.
2. Toast "Đã đăng đồ trao đổi".
3. `router.push(ROUTES.swapItem(item.id))`.

### Giao diện `/trao-doi/[id]`
- **Nội dung**:
  - Ảnh lớn, tiêu đề, tình trạng, loại, quận, thời gian đăng, mô tả.
  - Khối "Tặng miễn phí" hoặc "Muốn đổi lấy: …".
  - Người đăng, hiển thị bằng vòng tròn chữ viết tắt.
- **Đồ của người khác**: nút "Nhắn người đăng" mở `GcModal` liên hệ, số điện thoại đã che.
- **Đồ của mình** (`isMine`):
  - Bộ chọn 3 trạng thái: Đang mở → Đã có người hẹn → Đã trao đổi. Đổi trạng thái thì gọi `setStatus`.
  - Nút "Xóa": mở `GcModal` xác nhận → `removeItem` → toast → `router.replace(ROUTES.swap)`.
- Id sai thì hiện `EmptyState`.

# FILE CỦA BẠN (chỉ được tạo và sửa những file này)
- **Thư mục giao diện**: `src/features/learn/**`, `src/features/points/**`, `src/features/rewards/**`, `src/features/green-shops/**`, `src/features/swap/**`.
  - Các file `*View.tsx` đã có sẵn bản khung do Claude tạo, đang hiện chữ "Đang xây dựng".
  - Bạn **thay toàn bộ nội dung** các file khung đó, nhưng **giữ nguyên tên file, tên export và props**.
  - Component phụ đặt trong `src/features/<tính năng>/components/`, hàm phụ đặt trong `src/features/<tính năng>/lib.ts`.
  - Mỗi file không quá 350 dòng. Dài hơn thì tách thành component.
- **Dữ liệu**: `src/data/knowledge.ts` và `src/data/green-shops.ts`. Claude đã tạo sẵn mỗi file 1 mục mẫu; bạn thay bằng dữ liệu thật và giữ nguyên tên export.
- **Ảnh WebP cuối**: `public/content/learn/**`, `public/content/shops/**`, `public/content/rewards/**`, `public/content/swap/**`.
- **Ảnh PNG thô**: `assets-src/content/**`. Thư mục này đã nằm trong `.gitignore`.
- **Ghi chú**: `docs/collab/gemini-yeu-cau.md` và `docs/collab/gemini-bao-cao.md`.

# ĐƯỢC IMPORT (chỉ những nguồn này)
- **`@/features/contracts`**: mọi kiểu dữ liệu, hằng số, hook, `ROUTES`, `AREAS`, các hàm định dạng và `compressImage`.
- **`@/components/greencity/*`**:
  - từ `ui`: `buttonClass`, `inputClass`, `PageContainer`, `PageIntro`, `StepHeading`, `FieldError`, `ChoiceChip`
  - `EmptyState`, `GcModal`, `SmartImage`, `SubmitButton`
- **Tiện ích**: `@/lib/utils` (`cn`) và `@/utils/format` (`formatPrice`, `initialsOf`).
- **Dữ liệu của bạn**: `@/data/knowledge`, `@/data/green-shops`, và các file trong chính thư mục tính năng của bạn.
- **Gói có sẵn**: `react`, `next/link`, `next/navigation`, `lucide-react`. Hiện ảnh thì dùng `SmartImage`.
- **Cấm import**:
  - `framer-motion`, `gsap`, `lenis`
  - `@/store/*`, `@/data/mock-data`, `@/pages-views/*`, `@/lobby/*`, `@/lib/routes`
  - file trong thư mục tính năng của Claude: `src/features/` ngoài 5 thư mục của bạn

# LUẬT CỨNG
- **Không làm**:
  - Không thêm thư viện.
  - Không sửa `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `src/app/**`, `src/app/globals.css`.
- **Không có server**: không dùng `"use server"`, không tạo API route, không `fetch`, không đọc/ghi `localStorage`, `sessionStorage` hay cookie. Mọi dữ liệu đi qua hook trong contracts.
- **Giữ code sạch**:
  - Không có `any`, `@ts-ignore`, `eslint-disable`.
  - Không dùng `<img>`, hiện ảnh bằng `SmartImage`.
  - Không đặt `console.log` trong code nộp.
- **Client component**: View nào dùng hook thì dòng đầu tiên phải là `"use client";`.
- **Không đổi câu chữ** trên các trang đã có sẵn.

# HỆ THỐNG THIẾT KẾ (bắt buộc)
Mục tiêu: trang mới nhìn **cùng một bộ** với các trang đã có. Mở các file sau để học cách viết, chỉ đọc, không sửa: `src/pages-views/DiscoverView.tsx`, `SellView.tsx`, `ProductDetailView.tsx`, `CollectView.tsx`, `src/components/greencity/ProductCard.tsx`.

- **Màu**
  - Chỉ dùng token ngữ nghĩa: `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-primary`, `text-primary-foreground`, `text-accent-foreground`, `text-destructive`, `text-earth`, `text-warn`, `border-border`, `border-input`. Được thêm độ trong suốt, ví dụ `bg-primary/10`.
  - **Cấm**: mã màu hex, màu Tailwind có sẵn (`green-600`, `emerald-*`, `slate-*`…), thang `gc-*` (thang này chỉ dành cho lobby).
  - Cả nền sáng lẫn nền tối đều phải đẹp và đọc rõ. Bấm nút đổi giao diện để thử.
- **Khung trang**
  - Mọi View bọc trong `PageContainer`, mở đầu bằng `PageIntro`. Trang chi tiết thì dùng `h2` riêng.
  - Không tự làm header, sidebar, footer: AppShell đã có. Mỗi trang có **đúng một** `h2` chính, vì `h1` là tiêu đề trên thanh của AppShell.
- **Cỡ chữ**: viết dạng `text-[15px]`.

  | Loại chữ | Cỡ |
  |---|---|
  | Tiêu đề trang | 24–28px, `font-extrabold` |
  | Tiêu đề mục | 17–19px, `font-bold` |
  | Chữ thân | 15px |
  | Chữ phụ | 13–14px |
- **Thẻ**: `rounded-2xl border border-border bg-card`, đệm `p-4` hoặc `p-5`. Khi hover chỉ đổi `border-primary/40` và thêm `shadow-md`.
- **Nút và ô nhập**
  - Nút dùng `buttonClass.primary`, `secondary` hoặc `ghost`. Nút gửi form dùng `SubmitButton`.
  - Ô nhập dùng `inputClass(err)`. Ô chọn (`select`) thêm `select-chevron cursor-pointer appearance-none`.
- **Trợ năng**
  - Vùng bấm tối thiểu 44×44px.
  - Mọi ô nhập có `<label>` gắn `htmlFor`.
  - Nút chỉ có biểu tượng phải có `aria-label`.
  - Biểu tượng trang trí có `aria-hidden="true"`.
  - Chip chọn có `aria-pressed`. Danh sách kết quả có dòng đếm đặt trong `aria-live="polite"`.
- **Responsive**
  - Không cuộn ngang ở bề rộng 360px.
  - Phải xem lại ở 390px, 768px và 1440px.
  - Trên điện thoại, thanh điều hướng đáy cao khoảng 64px. Nút dính đáy (nếu có) phải nằm trên thanh này.
- **Chuyển động**
  - Chỉ được dùng `transition-colors` hoặc `transition-[border-color,box-shadow]` dài tối đa 200ms, và `group-hover:scale-[1.03]` cho ảnh như `ProductCard`.
  - Không thêm keyframe, không parallax, không hiệu ứng khi cuộn.
- **Không để lộ "mùi AI"** (người dùng rất ghét):
  - Không emoji, không biểu tượng lấp lánh `Sparkles`, không gradient tím hay xanh dương, không kính mờ (glassmorphism), không hiệu ứng phát sáng.
  - Không câu sáo rỗng kiểu "Khám phá hành trình xanh tuyệt vời!", không số liệu bịa ("10.000+ người dùng"), không lời chứng thực bịa.
  - Câu chữ ngắn, cụ thể, nói người dùng cần làm gì.
- **Đủ trạng thái**: màn nào cũng phải xử lý đủ 4 trạng thái: rỗng (`EmptyState`), lỗi (`FieldError` hoặc thông báo trong modal), đang xử lý (`SubmitButton` ở `loading`), thành công (toast).

# ẢNH
- **Nguồn**: tạo bằng công cụ tạo ảnh của bạn. Không lấy ảnh trên Internet, không dùng ảnh stock.
- **Phong cách**: giống ảnh lobby.
  - Ảnh chụp đời thường ở Sài Gòn, ánh sáng sáng sớm ấm dịu, tông xanh lá dịu, chất ảnh thật.
  - Không chữ, không logo, không watermark.
  - Người trong ảnh (nếu có) không nhìn vào ống kính, tay chân tự nhiên.
- **Quy trình**:
  1. Lưu ảnh PNG thô vào `assets-src/content/<nhóm>/<tên>.png`.
  2. Chạy `npm run content:image -- <file.png> <đường dẫn .webp trong public/content> <rộng> <cao>`.
- **Kích thước**:

  | Loại ảnh | Kích thước |
  |---|---|
  | Bìa bài viết, bìa gian hàng | 1200×900 |
  | Ảnh quà | 800×800 |
  | Ảnh đồ trao đổi | 1000×750 |

  Mỗi file tối đa 150KB. Script sẽ báo nếu vượt.
- **Cần tạo đủ**:
  - Bìa của mọi bài viết và mọi gian hàng.
  - Ảnh của mọi quà trong `REWARDS`.
  - Ảnh của mọi món trao đổi trong dữ liệu mẫu và trong `SWAP_SAMPLE_IMAGES`.
- **Kiểm tra**: chạy `npm run content:missing` để xem còn thiếu ảnh nào. Kết quả phải về 0.

# QUY TRÌNH BẮT BUỘC (làm đủ, đúng thứ tự)
**Bước 0. Kiểm tra nền móng.** Thiếu bất kỳ mục nào thì **DỪNG**, báo người dùng "Nền móng chưa sẵn sàng: <thiếu gì>", không làm thêm gì.
- `git branch --show-current` phải ra `main`.
- `git tag --list nen-mong` phải ra `nen-mong`.
- File `src/features/contracts.ts` tồn tại.
- `npm install` chạy xong; `npm run lint` và `npm run build` đều đạt. Nếu lỗi nằm trong file của Claude thì làm theo luật làm chung số 7.
- `npm run collab:check -- gemini` báo ĐẠT.

**Bước 1. Đọc trước khi code.**
- **`AGENTS.md`**: Next.js 16 có nhiều chỗ khác bản bạn đã học.
- **Tài liệu Next.js 16** đi kèm dự án, trong `node_modules/next/dist/docs/01-app/`:
  - `01-getting-started/04-linking-and-navigating.md`
  - `01-getting-started/05-server-and-client-components.md`
  - `03-api-reference/04-functions/use-search-params.md`
  - `03-api-reference/04-functions/use-router.md`
- **Code trong dự án**:
  - `src/features/contracts.ts`
  - `src/components/greencity/ui.tsx`
  - các file mẫu ở mục HỆ THỐNG THIẾT KẾ

**Bước 2. Làm lần lượt B1 → B6.** Mỗi tính năng xong thì:
1. `npm run lint`: 0 lỗi (lỗi trong file của Claude: làm theo luật làm chung số 7).
2. Stage bằng đúng lệnh `git add -- …` ở luật làm chung số 4.
3. `npm run collab:check -- gemini`: ĐẠT.
4. `git commit -m "[gemini] B<số>: <tên tính năng>"`.

**Bước 3. Ảnh.** Tạo đủ ảnh theo mục ẢNH, tới khi `npm run content:missing` ra 0. Xong thì commit `[gemini] ảnh nội dung`.

**Bước 4. Kiểm tra kỹ thuật.**
1. `npm run lint`: 0 lỗi.
2. `npm run build`: thành công.
3. Chạy nền `npx next start -p 3100` và giữ chạy.
4. `npm run features:smoke -- http://localhost:3100 gemini`: phải in "✓ TẤT CẢ ĐẠT".
   - Lệnh này mở Chrome thật ở 390px và 1440px, ở cả giao diện sáng lẫn tối, rồi đăng nhập demo và vào từng route của bạn.
   - Nó kiểm tra: trang tải được, console không lỗi, không cuộn ngang, không ảnh hỏng, không còn chữ "Đang xây dựng".
   - Nó chạy thử luồng đổi quà và luồng đăng đồ trao đổi, rồi chụp ảnh vào `assets-src/features/_check/gemini/`.
5. `npm run collab:check -- gemini`: ĐẠT.
6. Tắt server cổng 3100 bạn đã mở.

**Bước 5. Tự soát ảnh chụp.** Mở từng ảnh chụp và trả lời TIÊU CHÍ GIAO DIỆN. Câu nào trả lời "không" thì sửa, rồi quay lại Bước 4.

**Bước 6. Báo cáo.**
1. Ghi báo cáo vào `docs/collab/gemini-bao-cao.md` theo MẪU BÁO CÁO.
2. Commit `[gemini] báo cáo`.
3. Dán nguyên văn báo cáo cho người dùng.

# TIÊU CHÍ GIAO DIỆN (trả lời có/không, kèm tên ảnh chụp làm bằng chứng)
1. Trang mới nhìn cùng bộ với `/kham-pha` và `/dang-tin`: thẻ, nút, cỡ chữ, khoảng cách?
2. Ở nền tối: chữ đọc rõ, không còn mảng trắng chói, không có chữ xám trên nền xám?
3. Ở 390px: không tràn ngang, nút đủ to, không bị thanh điều hướng đáy che?
4. Sổ tay: gõ "chai nhua" có ra "Chai nhựa" không?
5. Đổi quà: khi thiếu điểm, nút có bị tắt và ghi rõ cần thêm bao nhiêu điểm? Đổi xong có thấy mã nhận quà?
6. Trao đổi: để trống form rồi bấm đăng thì lỗi có hiện đúng chỗ, và focus có nhảy vào ô sai đầu tiên?
7. Không còn chữ "Đang xây dựng", không emoji, không gradient, không số liệu bịa?
8. Mọi ảnh đều là ảnh thật: không ảnh hỏng, không ô xám trống?

# ĐỊNH NGHĨA HOÀN THÀNH (đủ tất cả mới được báo xong)
- [ ] B1–B6 làm đủ mọi mục trong phần mô tả
- [ ] `npm run content:missing` ra 0
- [ ] `npm run lint` 0 lỗi, `npm run build` thành công
- [ ] `npm run features:smoke -- http://localhost:3100 gemini` in "✓ TẤT CẢ ĐẠT"
- [ ] `npm run collab:check -- gemini` ĐẠT
- [ ] Cả 8 tiêu chí giao diện đều là "có"
- [ ] Mọi thay đổi của bạn đã commit trên `main`: `git status` không còn file nào nằm trong vùng của bạn (file của Claude còn dở thì kệ)

# KHI GẶP KHÓ
- **Thiếu dữ liệu, hàm hoặc route**: ghi vào `gemini-yeu-cau.md`. Tạm thời ẩn phần giao diện đó, làm tiếp việc khác, không ngồi chờ.
- **Lỗi lint hoặc build nằm trong file của Claude**: làm theo luật làm chung số 7. Không sửa, vẫn hoàn thành phần việc của bạn.
- **Hook trả dữ liệu khác với mô tả trong prompt**: làm theo `contracts.ts`, ghi khác biệt vào báo cáo.
- **Công cụ tạo ảnh hỏng hoàn toàn**: dừng phần ảnh, báo chính xác còn thiếu ảnh nào. **Không được báo đã xong.**
- **Cùng một lỗi**: thử tối đa 3 lần. Vẫn không được thì ghi rõ lỗi vào báo cáo, chuyển sang việc khác.

# MẪU BÁO CÁO (bắt buộc đúng mẫu)
```
## Kết quả
| Mã | Tính năng | Route | Xong? | Ghi chú |
|----|-----------|-------|-------|---------|
(đủ 6 dòng B1–B6)

## Dữ liệu
- Bài viết: N (theo chủ đề: ...) · Sổ tay: N món (theo nhóm: ...)
- Gian hàng: N · Sản phẩm: N · Ảnh đã tạo: N

## Lệnh kiểm tra (dán nguyên dòng kết quả cuối của mỗi lệnh)
- content:missing: ...
- lint: ...
- build: ...
- features:smoke: ...
- collab:check: ...

## Tiêu chí giao diện (8 câu, có/không + tên ảnh chụp)
1. ...

## Yêu cầu đã gửi Claude
(liệt kê YC-..., hoặc "Không có")

## Khác biệt giữa prompt và contracts.ts
(hoặc "Không có")

## Commit (dán kết quả `git log --oneline --grep="^\[gemini\]" nen-mong..HEAD`)
...
```

## KẾT THÚC PROMPT
