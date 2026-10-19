# Prompt cho Claude Code: nền móng và 10 tính năng nâng cao Green City

> **Cách dùng**
> 1. **Trước khi dán:** tự commit hết các thay đổi đang dở trong `C:\123`. Chạy `git status`, phải báo sạch.
> 2. Mở Claude Code trong `C:\123`, dán toàn bộ phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT".
> 3. Claude làm **Giai đoạn 0** trước. Khi Claude báo **"Nền móng xong"**, mới dán `docs/prompt-gemini-tinh-nang-co-ban.md` vào Antigravity cho Gemini.
> 4. Hai bên làm song song **trong cùng thư mục `C:\123`, cùng nhánh `main`** (người dùng chốt ngày 2026-10-19: không tách thư mục). Khi Gemini báo xong, nhắn Claude câu `Gemini xong` để vào Giai đoạn kiểm thử chung.

---

## BẮT ĐẦU PROMPT

# VAI TRÒ
Bạn là kỹ sư chính của Green City (Next.js 16, React 19, Tailwind 4; toàn bộ chạy phía trình duyệt, dữ liệu demo lưu ở `localStorage`).

Người dùng đưa danh sách 18 tính năng mới, chia 4 nhóm (I–IV). Công việc được chia cho 2 bên:
- **Gemini 3.8 Flash** (trong Antigravity) làm phần **giao diện của 6 tính năng cơ bản**, theo `docs/prompt-gemini-tinh-nang-co-ban.md`. **Đọc file đó trước tiên**: nó là hợp đồng bạn đã hứa với Gemini, Giai đoạn 0 phải giao đúng từng thứ đã hứa.
- **Bạn** làm 4 phần:
  1. **Giai đoạn 0 – nền móng** cho cả hai bên. Phải xong trước khi Gemini bắt đầu.
  2. **A1–A10**: các tính năng nâng cao.
  3. **Giai đoạn G**: xử lý yêu cầu của Gemini, gộp nhánh, kiểm thử toàn bộ.
  4. **Logic và dữ liệu** phía sau các tính năng của Gemini.

Quy tắc chung:
- Trả lời người dùng bằng tiếng Việt, ngắn gọn.
- Làm hết giai đoạn này sang giai đoạn khác, không dừng giữa chừng, trừ những chỗ ghi **HỎI NGƯỜI DÙNG**.

# KIỂM TRA HIỆN TRẠNG (đối chiếu code ngày 2026-10-19)
**Chưa có tính năng nào trong danh sách được làm đủ.** Có 2 tính năng đã có một phần.

| Mục | Yêu cầu | Hiện trạng trong code | Ai làm |
|---|---|---|---|
| I.1 | Đặt thu gom tại nhà: chọn loại, gửi ảnh, đội tới cân, thanh toán, cộng điểm | **Một phần.** `CollectView` đã có: chọn loại, khối lượng ước tính, quận, khung giờ, ghi chú, danh sách yêu cầu với 3 trạng thái tĩnh. **Còn thiếu:** ảnh, đội nhận đơn, cân thực tế, thanh toán, điểm | Claude A2 |
| I.2 | Điểm khi bỏ vào thùng cố định, cộng tác viên kiểm tra | Chưa có | Claude A3 |
| I.3 | Báo điểm rác tự phát: ảnh, vị trí, xác minh, điểm | Chưa có | Claude A4 |
| I.4 | Lịch sử điểm, quy tắc công khai | Chưa có, chưa có hệ thống điểm | Claude A1 (logic); Gemini B2, B3 (giao diện) |
| I.5 | Chợ vật liệu: doanh nghiệp xem và đặt giữ lô đã kiểm định | **Một phần.** `/kham-pha` là chợ đồ cũ cho người dân (lọc, liên hệ người bán). **Còn thiếu:** vai trò doanh nghiệp, lô đã kiểm định, đặt giữ | Claude A7 |
| II.1 | Thùng quần áo cũ và rác hữu cơ, kiểm tra, điểm | Chưa có | Claude A3 (chung hệ thống thùng) |
| II.2 | Khu trao đổi đồ tái sử dụng | Chưa có (chợ hiện tại chỉ có mua bán có giá) | Gemini B6 (giao diện); Claude (dữ liệu) |
| II.3 | Đổi điểm lấy phân bón, sản phẩm xanh | Chưa có | Claude A1 (logic); Gemini B4 (giao diện) |
| II.4 | Bản đồ xanh | Chưa có | Claude A6 |
| II.5 | Báo thùng đầy | Chưa có | Claude A5 |
| III.1 | Tư vấn phân loại qua ảnh | Chưa có | Claude A8 (dùng lại sổ tay B1 của Gemini) |
| III.2 | Thống kê, báo cáo môi trường | Chưa có | Claude A9 |
| III.3 | Trang kiến thức môi trường | Chưa có | Gemini B1 |
| III.4 | Gian hàng doanh nghiệp xanh | Chưa có | Gemini B5 (Claude đọc dữ liệu cho bản đồ) |
| IV.1–4 | Quản lý đơn, thùng, điểm, đối tác | Chưa có, chưa có phân quyền | Claude A10 |

**Cách chia:**
- **Cơ bản (Gemini)**: chủ yếu là giao diện, nội dung tĩnh, các luồng CRUD đơn giản đi qua hook có sẵn.
- **Nâng cao (bạn)**: máy trạng thái nhiều bước, phân quyền, sổ điểm, xác minh chéo giữa các vai trò, bản đồ, thống kê, quản trị, và mọi thứ dùng chung.

# LUẬT LÀM CHUNG VỚI GEMINI (bạn phải giữ đúng như đã hứa)
- **Sở hữu file.** Sau Giai đoạn 0, **không sửa** bất kỳ file nào của Gemini:
  - `src/features/{learn,points,rewards,green-shops,swap}/**`
  - `src/data/knowledge.ts`, `src/data/green-shops.ts`
  - `public/content/**`, `assets-src/content/**`
  - `docs/collab/gemini-*.md`

  Cần Gemini đổi gì thì ghi vào `docs/collab/claude-thong-bao.md`, rồi nhờ người dùng chuyển lời.
- **Hợp đồng `src/features/contracts.ts`.** Sau Giai đoạn 0 chỉ được **thêm**, không được đổi tên, xóa hay đổi kiểu.
  - Thay đổi phá vỡ: **HỎI NGƯỜI DÙNG** trước, rồi ghi rõ vào `claude-thong-bao.md`.
  - Thêm gì vào hợp đồng thì commit ngay và ghi một dòng vào `claude-thong-bao.md`. Gemini đọc file này đầu mỗi tính năng.
- **Chung một thư mục `C:\123`, chung nhánh `main`** với Gemini. Vì vậy:
  - Stage **chỉ file của mình**: `git add -- . ':!src/features/learn' ':!src/features/points' ':!src/features/rewards' ':!src/features/green-shops' ':!src/features/swap' ':!src/data/knowledge.ts' ':!src/data/green-shops.ts' ':!public/content' ':!docs/collab/gemini-yeu-cau.md' ':!docs/collab/gemini-bao-cao.md'`.
  - **Cấm** `git add -A`, `git commit -a`, `git stash`, `git reset`, `git restore`/`git checkout -- <file>` trên file của Gemini, `git clean`, đổi nhánh, `git pull`/`git push` khi người dùng chưa bảo.
  - Build và chạy server bằng thư mục riêng: `NEXT_DIST_DIR=.next-claude npx next build`, `NEXT_DIST_DIR=.next-claude npx next start -p 3300`. Dev thì `NEXT_DIST_DIR=.next-claude npx next dev -p 3200`.
  - Cổng của bạn là `3200` và `3300`. Không tắt tiến trình ở cổng 3000 và 3100. Tắt server của mình thì tắt theo cổng (tiến trình `node` con có thể còn sống sau khi tắt lệnh `npx`).
  - **Giữ cây code luôn biên dịch được**, vì Gemini build cùng mã nguồn: viết file mới cho xong rồi mới nối vào chỗ dùng, chạy `npx tsc --noEmit` thường xuyên, không để lỗi kiểu kéo dài.
  - Lỗi build do file của Gemini đang dở: không sửa, đợi rồi chạy lại; kéo dài thì báo người dùng.
- **Trước mỗi commit** chạy `npm run collab:check -- claude` (kiểm file đang stage và các commit `[claude]` từ tag `nen-mong`). Commit có tiền tố `[claude]`.
- **Đọc yêu cầu của Gemini.** Mỗi khi xong một tính năng A, đọc `docs/collab/gemini-yeu-cau.md`.
  - Yêu cầu nằm trong phần của bạn thì làm ngay, theo luật hợp đồng ở trên.
  - Làm xong thì ghi kết quả vào `claude-thong-bao.md`.

# LUẬT KỸ THUẬT CHUNG
- **Next.js 16** khác bản bạn đã học. Đọc `AGENTS.md` và đúng phần tài liệu trong `node_modules/next/dist/docs/01-app/` trước khi viết code có liên quan:
  - `params` và `searchParams` là Promise.
  - `generateStaticParams`, metadata, route groups, `useSearchParams` cần `<Suspense>`.
- **Giữ nguyên các mẫu đang dùng**:
  - Toàn bộ code tính năng là client.
  - Store đặt trong `src/store/`, hiện là `useReducer` + Context, lưu `localStorage`.
  - Giao diện dùng bộ có sẵn trong `src/components/greencity/`.
  - Màu chỉ dùng token ngữ nghĩa, đúng ở cả nền sáng và tối.
  - Câu chữ tiếng Việt cụ thể, không "mùi AI": không emoji, không gradient tím, không số liệu bịa trình bày như số thật.
- **Không thêm thư viện.** Ngoại lệ duy nhất đã được người dùng duyệt: `leaflet`, `react-leaflet` và `@types/leaflet`, dùng cho A6.
- **Dữ liệu mẫu** phải trông hợp lý và được gắn nhãn rõ là dữ liệu minh họa. Tên người, tên đơn vị đều hư cấu.
- **Ảnh người dùng tải lên**:
  - Nén về tối đa 800px, JPEG chất lượng 0.72.
  - Giới hạn tối đa 3 ảnh mỗi đơn hoặc báo cáo.
  - Khi `localStorage` báo đầy: bắt lỗi `QuotaExceededError`, hiện toast cảnh báo, không làm sập ứng dụng.
- **Lobby** (`src/lobby/**`, `src/app/page.tsx`): không đụng tới. `npm run lobby:smoke` phải vẫn đạt.

# GIAI ĐOẠN 0: NỀN MÓNG (làm trên `main` trong `C:\123`, trước khi Gemini vào) — ĐÃ XONG 2026-10-19

## 0.1 Mốc ban đầu
- Chạy `git status`. Cây làm việc đang có nhiều thay đổi chưa commit từ các đợt trước.
- **Đã chốt (2026-10-19): người dùng tự commit phần thay đổi cũ này**, vì họ đang học git. Bạn **không** commit hộ.
  - Nếu cây làm việc chưa sạch: dừng lại, nhắc người dùng commit trước.
  - Nếu họ hỏi cách làm: hướng dẫn từng lệnh (`git status`, `git add .`, `git commit -m "..."`), và nhắc gỡ `.env` khỏi git bằng `git rm --cached .env`.
  - Từ commit của Giai đoạn 0 trở đi thì bạn tự commit, vì quy trình tách nhánh cần các commit đó.
- Sau khi cây đã sạch, đánh dấu mốc: `npm run lint` và `npm run build` phải đạt.

## 0.2 Kiểu dữ liệu và hợp đồng
- Tạo `src/types/features.ts` chứa toàn bộ kiểu mới: của Gemini (đúng như trong prompt Gemini) và của bạn.
- Thêm `role: UserRole` vào `DemoUser`, với `UserRole = "resident" | "collaborator" | "business" | "operator"`.
- Tạo `src/features/contracts.ts`: **chỉ re-export**, không chứa logic, gồm đúng danh sách sau.
  - **Đường dẫn và khu vực**: `ROUTES`, `AREAS`, `type Area`.
  - **Người dùng và thông báo**: `useCurrentUser`, `useToast`.
  - **Định dạng**: `formatDate`, `formatDateTime`, `formatRelativeTime`, `compressImage`.
  - **Điểm thưởng**: các kiểu điểm, `POINT_RULES`, `POINT_REASON_LABEL`, `POINT_STATUS_LABEL`, `usePoints`.
  - **Đổi quà**: các kiểu quà, `REWARD_CATEGORY_LABEL`, `REDEMPTION_STATUS_LABEL`, `useRewards`.
  - **Trao đổi đồ**: các kiểu trao đổi, các bảng nhãn `SWAP_*`, `SWAP_SAMPLE_IMAGES`, `useSwap`.
  - **Kiến thức**: `WasteGroup`, `WASTE_GROUPS`, `ArticleTopic`, `ARTICLE_TOPIC_LABEL`, `ArticleBlock`, `Article`, `SortingGuideItem`.
  - **Gian hàng**: `GreenShopKind`, `GREEN_SHOP_KIND_LABEL`, `GreenShop`, `GreenShopProduct`.

  Chữ ký phải khớp **từng ký tự** với mục HỢP ĐỒNG DỮ LIỆU trong prompt Gemini.
- Các hàm định dạng đặt ở `src/utils/format.ts`. `compressImage` đặt ở `src/lib/image.ts` (chuyển từ `toCompressedDataUrl` trong `SellView`; `SellView` cũng phải dùng lại hàm này).

## 0.3 Store bản 2
- **Tách store thành slice** trong `src/store/slices/*.ts`. Mỗi slice gồm: state, action, reducer con và seed. Hook đặt trong `src/store/hooks.ts`. Store tổng vẫn cung cấp `useApp`, để code cũ không phải sửa.
- **Lưu trữ**:
  - Khóa lưu mới: `greencity-demo-v2`.
  - Có bước chuyển dữ liệu từ `greencity-demo-v1`: giữ `user` (gán `role: "resident"`), `favorites`, `myListings`, `myRequests` (đổi trạng thái cũ sang trạng thái mới của A2).
  - Lưu **toàn bộ** state có thể thay đổi (điểm, thùng, báo cáo, lô…), không chỉ phần `isMine`. Seed chỉ dùng khi chưa có dữ liệu.
- **Danh sách slice**:
  - `points` (sổ điểm)
  - `rewards` (tồn kho, lịch sử đổi quà)
  - `swap`
  - `collect` (đơn thu gom bản mới)
  - `bins`
  - `dropoffs`
  - `binReports`
  - `litterReports`
  - `consults`
  - `lots`
  - `reservations`
  - `partners`
- **Vai trò demo**:
  - Đăng nhập bằng email bắt đầu `ctv@` → `collaborator`; `doanhnghiep@` → `business`; `vanhanh@` → `operator`; còn lại → `resident`.
  - Trang `/ho-so` có khối **"Chế độ demo: đổi vai trò"** để chuyển nhanh giữa 4 vai trò.
  - Nút "Điền thử" ở trang đăng nhập có thêm lựa chọn vai trò.
- **Điểm chào mừng**: lần đầu đăng nhập, cộng 1 mục `welcome` đã xác nhận. Số điểm lấy từ `POINT_RULES`.

## 0.4 Dữ liệu của bạn (seed)
- **`src/data/point-rules.ts`**: `POINT_RULES`. Mỗi quy tắc gồm `reason`, `activity`, `points`, `unit`, `condition`. Đề xuất mặc định, người dùng có thể chỉnh sau:

  | Hoạt động | Điểm | Điều kiện |
  |---|---|---|
  | Tạo tài khoản | 50 | Một lần |
  | Thu gom tận nhà | 2 điểm/kg đã cân | Tính trên khối lượng thực tế khi cân |
  | Thu gom tận nhà, đã phân loại sẵn | 10 điểm/lần | Cộng thêm, khi đội thu gom xác nhận đồ đã được phân loại |
  | Bỏ vật liệu tái chế vào thùng | 5 điểm/lần đạt chuẩn | Tối đa 3 lần/ngày |
  | Bỏ quần áo cũ vào thùng | 3 điểm/kg | |
  | Bỏ rác hữu cơ vào thùng | 1 điểm/kg | |
  | Báo điểm rác được xác minh | 20 điểm | |
  | Báo thùng đầy được xác nhận | 5 điểm | Tối đa 1 lần/thùng/ngày |

  Mọi chỗ tính điểm **đều đọc từ bảng này**, không gõ tay con số ở chỗ khác.
- **`src/data/rewards.ts`**:
  - Khoảng 8 quà, ví dụ: phân hữu cơ 2kg, túi vải, ly thủy tinh, cây giống, bộ dụng cụ làm vườn mini, ống hút inox.
  - 3–4 `partnerName` hư cấu. Gemini sẽ tạo gian hàng trùng tên với các đối tác này.
  - `image` trỏ tới `/content/rewards/<id>.webp`. Gemini sẽ tạo ảnh.
- **`src/data/swap-seed.ts`**: khoảng 8 món trao đổi, với `image` trỏ tới `/content/swap/<id>.webp`. Thêm `SWAP_SAMPLE_IMAGES` gồm 4 ảnh `/content/swap/mau-1..4.webp`.
- **Thùng thu gom**:
  - Khoảng 24 thùng, đủ 3 loại `"tai-che" | "quan-ao" | "huu-co"`, rải đủ 10 quận trong `AREAS`.
  - Mỗi thùng có mã in trên thùng (ví dụ `BT-014`), tọa độ trong TP.HCM, mức đầy, ngày đổ gần nhất.
- **Các seed khác**:
  - Điểm tái chế, vườn cộng đồng (cho A6).
  - Đối tác thu gom, cơ sở chế biến phân bón (cho A10).
  - Lịch sử thống kê 6 tháng theo quận (cho A9).

  Tất cả đều được gắn nhãn là dữ liệu minh họa.

## 0.5 File khung cho Gemini
- **`src/data/knowledge.ts`**: 1 bài viết và 1 món trong sổ tay, kiểu dữ liệu đúng.
- **`src/data/green-shops.ts`**: 1 gian hàng, đúng kiểu dữ liệu.
- **11 file View khung** trong 5 thư mục của Gemini, đúng tên và props trong bảng của prompt Gemini.
  - Mỗi file render `<FeatureStub title="…" />`.
  - `FeatureStub` đặt ở `src/features/_shared/FeatureStub.tsx` và hiện chữ **"Đang xây dựng"**. Smoke test dựa vào đúng chữ này.

## 0.6 Route và trang
- **Thêm vào `ROUTES`** (`src/lib/routes.ts`):

  | Khóa | Đường dẫn |
  |---|---|
  | `learn` | `/kien-thuc` |
  | `article(slug)` | `/kien-thuc/<slug>` |
  | `sortingGuide` | `/kien-thuc/so-tay` |
  | `points` | `/diem-thuong` |
  | `pointRules` | `/diem-thuong/quy-tac` |
  | `rewards` | `/doi-qua` |
  | `shops` | `/gian-hang` |
  | `shop(slug)` | `/gian-hang/<slug>` |
  | `swap` | `/trao-doi` |
  | `swapPost` | `/trao-doi/dang` |
  | `swapItem(id)` | `/trao-doi/<id>` |
  | `collectRequest(id)` | `/thu-gom/<id>` |
  | `bins` | `/thung-thu-gom` |
  | `litterReport` | `/bao-diem-rac` |
  | `map` | `/ban-do` |
  | `consult` | `/tu-van-phan-loai` |
  | `materials` | `/cho-vat-lieu` |
  | `stats` | `/thong-ke` |
  | `ctv` | `/cong-tac-vien` |
  | `admin` | `/quan-tri` |
- **Tạo `page.tsx` cho mọi route mới** (của cả Gemini lẫn của bạn), đặt trong `src/app/(app)/`.
  - Có `metadata.title`.
  - Bọc `<Suspense>` khi View dùng `useSearchParams`. Danh sách View cần bọc: `LearnView`, `SortingGuideView`, `ShopsView`, `SwapView`, bản đồ.
  - Trang `[slug]` có `generateStaticParams` lấy từ dữ liệu, và `generateMetadata` lấy tiêu đề từ dữ liệu.
  - Trang `[id]` thì render động.
- **View của bạn** đặt trong `src/features/{collect,bins,litter,map,consult,materials,stats,ctv,admin}/`. Ở Giai đoạn 0, các View này cũng chỉ là `FeatureStub`.

## 0.7 AppShell và menu
- **Route công khai** (người chưa đăng nhập vẫn xem được): `learn`, `pointRules`, `shops`, `map`.
  - Với khách: AppShell hiện nút "Đăng nhập" thay cho avatar. Bấm hành động cần tài khoản thì chuyển tới `loginHref(pathname)`.
  - Vẫn giữ cách chờ `state.ready` rồi mới render như hiện tại.
- **Menu bên trái chia nhóm có tiêu đề nhỏ**, ẩn hoặc hiện theo vai trò:

  | Nhóm | Mục | Ai thấy |
  |---|---|---|
  | Việc chính | Tổng quan, Khám phá & mua, Đăng tin, Gọi thu gom, Thùng thu gom, Báo điểm rác | Mọi người |
  | Điểm thưởng | Điểm của tôi, Đổi quà | Mọi người |
  | Cộng đồng | Trao đổi đồ, Bản đồ xanh, Gian hàng xanh, Kiến thức | Mọi người |
  | Doanh nghiệp | Chợ vật liệu, Thống kê | `business` và `operator` |
  | Vận hành | Khu cộng tác viên | `collaborator` và `operator` |
  | Vận hành | Quản trị | `operator` |
  | Cuối menu | Đã lưu, Hồ sơ | Mọi người |
- **Thanh đáy trên điện thoại** giữ 5 ô: Tổng quan, Khám phá, Đăng tin, Thu gom, **Thêm**.
  - Ô "Thêm" mở `GcModal` (dạng sheet từ đáy lên), liệt kê đủ các nhóm menu ở trên.
  - Avatar trên thanh trên cùng vẫn dẫn tới Hồ sơ.
- **Cập nhật `PAGE_TITLES`** cho mọi route mới.
- **Trang Tổng quan**: thêm thẻ số dư điểm (link tới `ROUTES.points`) và thẻ "Tìm thùng gần bạn" (link tới `ROUTES.bins`).

## 0.8 Script phối hợp (thêm vào `package.json`)
Viết theo kiểu `scripts/lobby-assets/*.mjs`: Node thuần, không thêm thư viện. Smoke test điều khiển Chrome qua DevTools Protocol.

- **`collab:check`** → `scripts/collab/check.mjs <gemini|claude>`
  - Lấy danh sách file đã đổi: `git diff --name-only main...HEAD`, cộng thêm các file trong `git status --porcelain` (gồm cả file chưa theo dõi).
  - Với `gemini`: mọi file phải nằm trong vùng của Gemini.
  - Với `claude`: không file nào được nằm trong vùng của Gemini.
  - In ra "ĐẠT" hoặc "FAIL" kèm danh sách file vi phạm. Có vi phạm thì thoát với mã 1.
- **`content:missing`** → `scripts/collab/content-missing.mjs`
  - Quét `src/data/**/*.ts` tìm chuỗi `"/content/…"`.
  - Liệt kê file nào chưa có trong `public/`, in ra số lượng thiếu.
- **`content:image`** → `scripts/collab/content-image.mjs <vào> <ra> <rộng> <cao>`
  - Dùng `sharp` (đã có trong devDependencies): cắt cover, xuất WebP chất lượng khoảng 72.
  - Nếu file ra lớn hơn 150KB thì tự hạ chất lượng xuống, thấp nhất 50. Vẫn vượt thì báo FAIL.
- **`features:smoke`** → `scripts/collab/smoke.mjs <url> <gemini|claude|all> [--allow-stub]`
  - Trước khi chạy: đặt `localStorage` có sẵn user demo, đúng vai trò cho từng route.
  - Mỗi route chạy ở 390px và 1440px, ở cả giao diện sáng và tối.
  - Kiểm tra từng route:
    - mã HTTP 200
    - console không có lỗi
    - không cuộn ngang
    - không có ảnh hỏng (`naturalWidth` bằng 0)
    - có đúng 1 thẻ `h2`
    - không còn chữ "Đang xây dựng" (trừ khi có cờ `--allow-stub`)
  - Chạy thử các luồng:
    - với `gemini`: đổi quà, đăng đồ trao đổi
    - với `claude`: các luồng chính của A2–A5, A7
  - Chụp ảnh vào `assets-src/features/_check/<bên>/`.
  - In "✓ TẤT CẢ ĐẠT" khi mọi mục đạt; có mục hỏng thì thoát với mã 1.

## 0.9 Tệp phối hợp và `.gitignore`
- Thêm `assets-src/content/` và `assets-src/features/_check/` vào `.gitignore`.
- Tạo các tệp trong `docs/collab/`:

  | Tệp | Nội dung ban đầu |
  |---|---|
  | `gemini-yeu-cau.md` | Tiêu đề và mẫu ghi yêu cầu |
  | `gemini-bao-cao.md` | Để trống |
  | `claude-thong-bao.md` | Dòng đầu tiên: "Nền móng xong, commit <hash>" |

## 0.10 Kiểm tra và đánh dấu mốc
1. `npm run lint` 0 lỗi, `npm run build` thành công.
2. Chạy `npm run features:smoke -- http://localhost:3300 all --allow-stub` và phải đạt.
3. Chạy `npm run lobby:smoke` và phải vẫn đạt.
4. Commit lên `main` với tiền tố `[claude]`, rồi gắn tag `nen-mong`.
5. Báo người dùng đúng câu **"Nền móng xong"**, kèm việc họ cần làm: dán prompt Gemini vào Antigravity, mở ở `C:\123`.

(Lúc đầu có tách 2 worktree `C:\123-main` và `C:\123-nang-cao`. Người dùng không muốn tách nên đã gom lại một thư mục. Tag `nen-mong` được dời lên commit chuyển sang cách làm chung thư mục.)

# CÁC TÍNH NĂNG NÂNG CAO (làm ở `C:\123`, nhánh `main`, mỗi tính năng một commit `[claude]`)

## Thứ tự làm và luật cho mọi tính năng

| Thứ tự | Tính năng | Lý do đứng ở vị trí này |
|---|---|---|
| 1 | A1 | Nền của mọi luồng tính điểm |
| 2 | A2 | |
| 3 | A3 và A5 | Cùng dùng hệ thống thùng |
| 4 | A4 | |
| 5 | A10 | Các luồng trên cần phía vận hành để chạy hết vòng |
| 6 | A6 | |
| 7 | A7 | |
| 8 | A8 | |
| 9 | A9 | |

- Logic thuần (tính điểm, chuyển trạng thái, kiểm tra trùng) đặt trong `src/lib/*.ts`, không dính React.
- Nếu Node hỗ trợ chạy TypeScript trực tiếp (`node --test`, bản 22.6 trở lên), viết test cho `src/lib/` trong `scripts/tests/`.

## A1. Sổ điểm và đổi quà (I.4, II.3: logic)
- **Sổ điểm**: mỗi lần cộng hoặc trừ là một `PointEntry`.
  - `balance` = tổng các mục `confirmed`.
  - `pending` = tổng các mục dương đang `pending`.
- **Hàm thuần** trong `src/lib/points.ts`: `pointsForPickup`, `pointsForDropoff`, `canEarnToday` (giới hạn theo ngày), `applyDecision` (đổi `pending` thành `confirmed` hoặc `rejected`).
- **`redeem(rewardId)`**, kiểm tra theo thứ tự:
  1. Đã đăng nhập chưa.
  2. Quà còn hàng không.
  3. Đủ điểm không.

  Nếu qua cả 3 bước:
  - Trừ điểm bằng một mục âm `confirmed`.
  - Giảm tồn kho.
  - Tạo mã dạng `GC-XXXX-XXXX`, không dùng các ký tự dễ nhầm `0`, `O`, `1`, `I`.
  - Đặt hạn nhận là 14 ngày.
- **Trạng thái `expired`** tính lúc đọc dữ liệu, không lưu.
- Phía quản trị có thể chỉnh điểm tay. Phần này làm ở A10.

## A2. Thu gom tận nhà bản đầy đủ (I.1)
- **Form ở `/thu-gom`**, giữ các bước cũ và thêm:
  - Ảnh (0–3 ảnh).
  - Ô chọn "Đã phân loại sẵn".
  - Địa chỉ ngắn gồm tên đường và phường.
- **Trạng thái của đơn**: `cho-nhan` → `da-nhan` (có tên đội, giờ hẹn) → `dang-den` → `da-can` → `hoan-tat`. Đơn có thể chuyển sang `da-huy` khi người dân hủy ở bước `cho-nhan` hoặc `da-nhan`, bắt buộc kèm lý do.
  - Bước `da-can` ghi khối lượng thực tế theo từng loại và số tiền.
  - Bước `hoan-tat` ghi cách thanh toán: tiền mặt, chuyển khoản, hoặc quy ra điểm.
- **Trang `/thu-gom/[id]`** gồm:
  - Dòng thời gian các bước.
  - Ảnh.
  - Bảng cân.
  - Thanh toán.
  - Điểm nhận được.
  - Nút hủy.
- **Khi đơn hoàn tất**: tự cộng điểm `confirmed` theo `POINT_RULES`.
- **Phía đội thu gom** làm trong khu quản trị (A10): nhận đơn, hẹn giờ, nhập số cân, xác nhận thanh toán.
- **Khối "Chế độ demo"** trong trang chi tiết có nút "Chuyển sang bước tiếp theo", để người dân tự xem hết vòng mà không phải đổi vai trò.

## A3. Thùng cố định: tái chế, quần áo, hữu cơ (I.2, II.1)
- **Trang `/thung-thu-gom`**:
  - Lọc theo loại thùng và theo quận.
  - Mỗi thẻ thùng có: loại, địa chỉ, mức đầy, ngày đổ gần nhất.
  - Mỗi thẻ có 3 nút: "Ghi nhận bỏ đồ", "Báo thùng đầy", "Xem trên bản đồ".
- **Ghi nhận bỏ đồ**:
  - Chọn thùng, hoặc nhập mã in trên thùng (phải kiểm tra mã có tồn tại).
  - Chọn loại vật liệu, khối lượng ước tính theo khoảng, ảnh nếu có.
  - Tạo `DropOff` ở trạng thái `cho-kiem-tra`, kèm một mục điểm `pending`.
  - Đã chạm giới hạn trong ngày thì vẫn ghi nhận, nhưng 0 điểm và nói rõ lý do.
- **Khu cộng tác viên `/cong-tac-vien`**, hàng chờ kiểm tra:
  - Duyệt: được chỉnh lại khối lượng, điểm thành `confirmed`.
  - Từ chối: chọn lý do (lẫn rác, sai loại thùng, không thấy đồ), điểm thành `rejected`.

## A4. Báo điểm rác tự phát (I.3)
- **Trang `/bao-diem-rac`**, form gồm:
  - Ảnh: bắt buộc, 1–3 ảnh.
  - Vị trí: thử lấy bằng `navigator.geolocation`. Bị từ chối hoặc lỗi thì cho chọn quận và nhập địa chỉ ngắn.
  - Quy mô: nhỏ / vừa / lớn.
  - Mô tả.
- **Trạng thái của báo cáo**: `cho-xac-minh` → `da-xac-minh` (cộng điểm) hoặc `khong-hop-le` (kèm lý do) → `da-don` (vận hành đã dọn).
- **Chống trùng**: nếu đã có báo cáo trong bán kính 100m và trong vòng 24 giờ, cảnh báo trước khi gửi.
- **Danh sách "Báo cáo của tôi"**: hiện trạng thái của từng báo cáo.
- **Phía xác minh**: làm trong `/cong-tac-vien`.
- **Báo cáo đã xác minh** sẽ hiện trên bản đồ (A6).

## A5. Báo thùng đầy (II.5)
- **Người báo**: nút trên thẻ thùng. Người dân và cộng tác viên đều báo được.
- **Mức báo**: `sap-day` hoặc `day`.
- **Gộp báo trùng**: các báo cáo cùng một thùng trong vòng 6 giờ được gộp lại.
- **Trạng thái của thùng**: `binh-thuong` → `sap-day` / `day` → `dang-xu-ly` → `binh-thuong`. Khi về lại `binh-thuong` thì cập nhật ngày đổ gần nhất.
- **Điểm**: người dân có báo cáo được xác nhận thì cộng điểm theo quy tắc.
- **Phía vận hành**: xử lý trong A10.

## A6. Bản đồ xanh (II.4)
- **Đã chốt (2026-10-19): dùng `leaflet` + `react-leaflet`, nền bản đồ OpenStreetMap.**
  - Cài đặt: `npm install leaflet react-leaflet` và `npm install -D @types/leaflet`. Trước khi cài, kiểm tra bản `react-leaflet` đó có hỗ trợ React 19 không.
  - Chỉ nạp ở trang `/ban-do`, phía trình duyệt, bằng `dynamic(..., { ssr: false })`. CSS của Leaflet cũng chỉ import bên trong component bản đồ.
  - Vẽ điểm bằng `CircleMarker` hoặc `divIcon`. Không dùng icon ảnh mặc định của Leaflet, vì đường dẫn ảnh hay bị vỡ khi đóng gói.
  - Màu điểm của từng lớp dùng token, nhìn rõ ở cả nền sáng lẫn nền tối.
  - Ghi nguồn "© OpenStreetMap contributors" đúng quy định.
  - Ghi chú vào `docs/` rằng khi chạy thật, lượng người dùng lớn, thì nên chuyển sang một nhà cung cấp tile có hợp đồng.
- **Các lớp dữ liệu**, bật/tắt bằng chip:
  - Thùng thu gom (3 loại).
  - Điểm tái chế, vựa.
  - Vườn cộng đồng.
  - Gian hàng xanh (đọc `GREEN_SHOPS` của Gemini, **chỉ đọc**).
  - Điểm rác đã báo.
- **Bố cục**:
  - Desktop: danh sách nằm cạnh bản đồ.
  - Điện thoại: chuyển qua lại giữa "Bản đồ" và "Danh sách".
- **Tham số trên URL**: `?gian-hang=<slug>` và `?thung=<id>` thì phóng tới đúng điểm và mở thông tin.
- **Nút "Gần tôi"**: dùng geolocation, sắp xếp danh sách theo khoảng cách.

## A7. Chợ vật liệu cho doanh nghiệp (I.5)
- **Ai thấy**: vai trò `business` và `operator`. Chợ đồ cũ ở `/kham-pha` giữ nguyên cho người dân.
- **Lô vật liệu** gồm:
  - Loại vật liệu, khối lượng.
  - Chứng nhận kiểm định: hạng A/B/C, độ sạch %, độ ẩm, người kiểm, ngày kiểm, ảnh.
  - Kho đặt lô (quận), giá/kg.
  - Trạng thái: `san-sang` → `dang-giu` → `da-ban`.
- **Doanh nghiệp đặt giữ**:
  - Giữ trong 48 giờ, chọn lịch tới lấy hàng.
  - Hết 48 giờ mà chưa xác nhận thì lô tự trả về `san-sang` (tính lúc đọc dữ liệu).
- **Vận hành** (A10): tạo lô từ hàng đã gom, kiểm định, xác nhận đã bán.
- **Trang "Lô tôi đang giữ"** cho doanh nghiệp.

## A8. Tư vấn phân loại qua ảnh (III.1)
- **Trang `/tu-van-phan-loai`**, người dùng gửi: ảnh (bắt buộc), mô tả ngắn, câu hỏi.
- **Gợi ý tức thì**: lấy từ khóa trong mô tả, so với `SORTING_GUIDE` của Gemini (**chỉ đọc**, so khớp không dấu). Hiện tối đa 3 món gần nhất, kèm link tới `ROUTES.sortingGuide`.
- **Phiếu tư vấn**: `cho-tu-van` → `da-tra-loi`.
  - Cộng tác viên hoặc vận hành trả lời trong khu của mình: chọn nhóm rác và viết hướng dẫn.
  - Người dùng xem câu trả lời trong mục "Câu hỏi của tôi".
- **AI tự nhận diện ảnh. Đã chốt (2026-10-19): hiện chỉ dựng khung, chưa gọi AI thật.** Khung phải sẵn sàng để sau này chỉ cần bật lên là chạy, không phải sửa giao diện.
  - **Kiểu dữ liệu**, trong `src/lib/consult/types.ts`:
    - `ClassifyInput`: ảnh dạng data URL, mô tả.
    - `ClassifyResult`: `group: WasteGroup`, tên món đoán được, hướng dẫn xử lý, độ tin cậy từ 0 tới 1, `source: "keyword" | "ai" | "human"`.
  - **Provider**, trong `src/lib/consult/providers/`. Mỗi cách nhận diện là một provider, cùng giao diện `classify(input): Promise<ClassifyResult[]>`.
    - `keyword.ts`: bản đang chạy, so khớp mô tả với `SORTING_GUIDE`.
    - `ai.ts`: gọi `POST /api/tu-van-phan-loai`. Khi AI chưa bật thì trả về mảng rỗng, không gọi mạng.
  - **Cờ bật/tắt**, trong `src/lib/consult/config.ts`: `CONSULT_AI_ENABLED`, đọc từ biến môi trường `NEXT_PUBLIC_CONSULT_AI`, mặc định là tắt. Trang tư vấn chạy lần lượt các provider đang bật, rồi gộp kết quả lại.
  - **Route khung**, `src/app/api/tu-van-phan-loai/route.ts`. Khi chưa bật cờ hoặc chưa có biến `ANTHROPIC_API_KEY`, route trả về `503` với `{ error: "ai_disabled" }`. Chưa cài SDK, chưa gọi model nào.
  - **Giao diện**: trong khối gợi ý có nhãn nhỏ "Nhận diện tự động: chưa bật". Phiếu tư vấn vẫn chuyển cho người thật trả lời như bình thường.
  - **Tài liệu `docs/tu-van-ai.md`**: hướng dẫn cách bật về sau, gồm:
    - cài SDK, đặt biến môi trường
    - chọn model Claude đọc được ảnh (tra model mới nhất vào lúc triển khai)
    - giới hạn kích thước ảnh, chi phí
    - lý do khóa API chỉ được nằm ở server

## A9. Thống kê và báo cáo (III.2)
- **Ai thấy**: vai trò `business` và `operator`.
- **Dữ liệu**: gộp từ đơn thu gom, lượt bỏ thùng, báo cáo điểm rác, cộng với lịch sử 6 tháng minh họa (seed). Đầu trang có nhãn "Số liệu minh họa".
- **Bộ lọc**: theo quận và theo khoảng thời gian.
- **Chỉ số**:
  - Tổng khối lượng thu gom theo loại.
  - Tỷ lệ bỏ thùng đúng chuẩn.
  - Số điểm rác đã xử lý, thời gian xử lý trung bình.
  - Top quận.
- **Biểu đồ**: vẽ bằng SVG hoặc CSS, không thêm thư viện. Đọc skill `dataviz` trước khi vẽ.
- **Xuất CSV**: dùng `Blob` để tải về. Bảng số liệu phải đọc được bằng bàn phím và trình đọc màn hình.

## A10. Khu quản trị vận hành (IV.1–4)
- **Ai thấy**: chỉ vai trò `operator`.
- **Trang `/quan-tri`** có 5 tab:
  - **Đơn thu gom**: hàng chờ, gán đội, nhập số cân và thanh toán.
  - **Báo cáo**: điểm rác, thùng đầy, phiếu tư vấn.
  - **Thùng**: danh sách, trạng thái, đổi trạng thái, thêm hoặc sửa thùng.
  - **Điểm thưởng**: tìm người dùng demo, xem sổ điểm, chỉnh điểm tay (bắt buộc ghi lý do, tạo mục `admin_adjust`).
  - **Đối tác**: thêm, sửa, ngưng đối tác thu gom và cơ sở chế biến phân bón.
- **Dùng chung với khu cộng tác viên**: các hàng chờ kiểm tra dùng lại component của `/cong-tac-vien`.
- **Mọi thao tác** đều có xác nhận và toast. Bảng dữ liệu có ô tìm kiếm và bộ lọc trạng thái.

# GIAI ĐOẠN G: KIỂM THỬ CHUNG (khi người dùng nhắn `Gemini xong`)
1. **Chốt yêu cầu của Gemini**: đọc báo cáo và yêu cầu của Gemini. Yêu cầu nào còn tồn thì xử lý xong trước.
2. **Kiểm tra cả hai bên**: `npm run collab:check -- gemini` và `npm run collab:check -- claude` đều ĐẠT. Chỉ đọc kết quả, không sửa file của Gemini.
3. Không cần gộp nhánh: hai bên đã commit chung trên `main`.
4. **Nối các tính năng với nhau**: link qua lại giữa các phần, các mục ở trang Tổng quan, bước "Làm quen" có thêm "Thử đổi quà" hoặc "Tìm thùng gần bạn" nếu hợp lý.
5. **Kiểm thử toàn bộ trên `main`** (build ra `.next-claude`):
   - `npm run lint` 0 lỗi, build thành công.
   - `npm run features:smoke -- http://localhost:3300 all` phải đạt.
   - `npm run lobby:smoke -- http://localhost:3300` phải vẫn đạt.
   - Tự chạy tay một vòng cho mỗi vai trò, ở 390px và 1440px, cả nền sáng và tối:

     | Vai trò | Việc cần thử |
     |---|---|
     | Người dân | Gửi đơn thu gom → (vận hành) cân → hoàn tất, thấy điểm |
     | Người dân | Bỏ đồ vào thùng → (cộng tác viên) duyệt |
     | Người dân | Báo điểm rác → xác minh |
     | Người dân | Đổi quà |
     | Doanh nghiệp | Đặt giữ lô vật liệu |
     | Vận hành | Xử lý thùng đầy, chỉnh điểm tay |
6. Không push khi người dùng chưa bảo.

# ĐỊNH NGHĨA HOÀN THÀNH
- [ ] Giai đoạn 0 xong, đã báo "Nền móng xong", Gemini đã bắt đầu được.
- [ ] A1–A10 làm đủ các mục ở phần mô tả. Mọi luồng nhiều bước đều chạy hết vòng được ở chế độ demo.
- [ ] Mọi yêu cầu trong `gemini-yeu-cau.md` đã được xử lý hoặc trả lời.
- [ ] Trên `main`, các lệnh sau đều đạt: lint, build, `features:smoke all`, `lobby:smoke`, `collab:check -- claude`, `collab:check -- gemini`.
- [ ] Không commit `[claude]` nào sau tag `nen-mong` sửa file của Gemini (`collab:check -- claude` kiểm điều này).

# MẪU BÁO CÁO CUỐI
```
## Kết quả
| Mã | Tính năng | Route | Xong? | Ghi chú |
(A1–A10, kèm dòng tổng kết B1–B6 lấy từ báo cáo của Gemini)

## Quyết định đã chốt
- Thay đổi cũ trước Giai đoạn 0: người dùng tự commit
- Bản đồ: Leaflet + OpenStreetMap
- AI tư vấn: chỉ dựng khung, mặc định tắt
(cộng thêm các quyết định phát sinh trong lúc làm)

## Lệnh kiểm tra (dòng kết quả cuối)
- lint / build / features:smoke all / lobby:smoke / collab:check

## Yêu cầu của Gemini đã xử lý
(YC-... → cách xử lý)

## Việc còn lại hoặc rủi ro
(ví dụ: dung lượng localStorage, dữ liệu minh họa, chưa có server thật)
```

## KẾT THÚC PROMPT
