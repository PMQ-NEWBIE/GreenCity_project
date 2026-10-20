# Prompt cho Gemini 3.8 Flash (Antigravity): làm lại TOÀN BỘ ảnh nội dung

> Cách dùng: mở dự án `C:\123` trong Antigravity, chọn Gemini 3.8 Flash, dán **toàn bộ** phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT".
> Trước khi dán, chạy `npm run content:sheet` rồi gửi kèm 4 ảnh trong `assets-src/content/_sheet/` (learn, rewards, shops, swap) để nó tự thấy mình đã làm hỏng thế nào.

---

## BẮT ĐẦU PROMPT

# TÌNH TRẠNG (cập nhật 20/10/2026): bạn mới làm xong một phần, LÀM TIẾP cho hết

Đã kiểm tra bằng `npm run content:sheet`:
- **ĐẠT, không được động vào nữa:** 8 ảnh `learn/`, và 3 ảnh `rewards/` là `phan-huu-co-2kg`, `phan-trun-que-1kg`, `tui-vai-di-cho`. Đúng nội dung, đúng bối cảnh Việt Nam, đẹp. Đây là chuẩn cho mọi ảnh còn lại.
- **CHƯA LÀM, vẫn là ảnh sai cũ:**
  - 5 ảnh `rewards/`: `chau-luoi-ho`, `dung-cu-lam-vuon-mini`, `ly-thuy-tinh-tai-che`, `ong-hut-inox`, `tui-luoi-dung-rau`.
  - **Cả 8** ảnh `shops/`.
  - **Cả 12** ảnh `swap/`.
  - **14/15** ảnh `products/`. Mới có `sat-vun.webp`. Trong `src/data/mock-data.ts` vẫn còn 14 link `z-cdn.chatglm.cn`.
- `NGUON-ANH.md` phải viết lại cho khớp **toàn bộ 51 ảnh**.

Không được báo "xong" khi chưa đủ 51/51.

# 0. ĐỌC KỸ: LẦN TRƯỚC BẠN ĐÃ LÀM HỎNG

Người dùng đã kiểm tra từng ảnh bạn đưa vào web. Kết quả: **trong 51 ảnh nội dung, không có ảnh nào đạt yêu cầu. Hơn 40 ảnh sai hoàn toàn**, tức là ảnh không liên quan gì tới thứ mà mục đó đang bán, cho hay hướng dẫn. Vài ví dụ:

| Mục trên web | Ảnh bạn đưa vào |
|---|---|
| Bài "Ủ phân hữu cơ từ rác bếp trong thùng xốp" | ảnh **virus COVID-19** có chữ "COVID-19" |
| Bài "Pin, bóng đèn và thuốc hết hạn" | **góc chơi game** với ghế gaming và màn hình |
| Cửa hàng "Dụng Cụ Xanh Nam Sài Gòn" | **một con gấu nâu** ngồi trên cỏ |
| Cửa hàng "Vườn ươm Cây Nhà Mình" | **chợ sách cũ** |
| Cửa hàng "Tiệm Gọn Gàng Xanh" | **một ô màu xanh trơn**, không có ảnh |
| Quà "Bộ ống hút inox kèm cọ rửa" | **ba người đàn ông** ngồi trước laptop |
| Quà "Bộ 3 túi lưới đựng rau" | **lồng máy giặt** dưới đèn hồng |
| Quà "Túi vải đi chợ" | **đồ văn phòng phẩm** |
| Quà "Túi phân hữu cơ 2kg" | **cà rốt và mướp đắng ngoài chợ** |
| Quà "Ly thủy tinh tái chế" | **ly giấy** cà phê mang đi |
| Đồ trao đổi "Xe đẩy em bé gấp gọn" | **phòng ngủ khách sạn** |
| Đồ trao đổi "3 váy công sở size M" | **quần nỉ vàng ở sân bóng rổ** |
| Đồ trao đổi "Nồi cơm điện 1,8 lít" | **nồi áp suất Instant Pot** có logo |
| Sản phẩm "Chai nhựa PET đã phân loại" | **chai nhựa trôi dưới đáy biển** |
| Sản phẩm "Ghế gỗ thanh lý" | **một cái bàn** |

**Tệ hơn nữa:** file `public/content/NGUON-ANH.md` ghi những mô tả **bịa đặt**, như "căn giữa túi canvas", "nổi bật túi lưới bông", "dụng cụ xẻng cào mini", trong khi ảnh thật là đồ văn phòng phẩm và máy giặt. Bạn đã ghi những việc mình không hề làm.

Ngoài ra, ảnh nào cũng mang **bối cảnh nước ngoài**: siêu thị Âu Mỹ, cánh đồng lúa mì, sách tiếng Anh, thùng rác kiểu Mỹ, bánh xà bông oải hương. Green City là web cho **người dân TP.HCM**. Người xem phải thấy chợ, hẻm, nhà phố, gạch bông, vựa ve chai, đồ dùng của **người Việt**.

Lần này **không được lặp lại**. Mọi ảnh sẽ bị kiểm tra bằng mắt từng tấm. Nhật ký mà có một dòng không đúng sự thật thì **cả lượt làm bị coi là thất bại**.

# 1. VIỆC CẦN LÀM

Làm lại **51 ảnh** liệt kê ở mục 5: 8 ảnh bài học, 8 ảnh quà, 8 ảnh cửa hàng, 12 ảnh đồ trao đổi, 15 ảnh sản phẩm ve chai. Mỗi ảnh phải **đúng thứ mà mục đó nói**, trong **bối cảnh Việt Nam**.

**KHÔNG đụng** vào các ảnh sau. Chúng đã đạt: `public/lobby/*` (hero, 3 ảnh tính năng, CTA, ảnh trang đăng nhập), `public/logo-mark.*`, `public/og-image.png`.

# 2. LẤY ẢNH TỪ ĐÂU (theo đúng thứ tự ưu tiên)

1. **Ảnh thật có giấy phép miễn phí** (Unsplash, Pexels, Wikimedia Commons loại CC0 hoặc CC BY). **Chỉ được dùng** khi đủ cả 3 điều kiện:
   - đúng vật thể của mục đó,
   - đúng bối cảnh Việt Nam,
   - không có chữ đọc được, logo hay nhãn hiệu.

   Bạn phải **thật sự mở trang ảnh**, tải file gốc từ chính trang đó, rồi **nhìn ảnh đã tải** trước khi dùng. Chép đúng link, tên tác giả và giấy phép như trang ghi. Không đoán link, không tự đặt ID ảnh.
2. **Không tìm được ảnh đạt cả 3 điều kiện thì TỰ TẠO** bằng công cụ tạo ảnh của bạn. Với bối cảnh Việt Nam, phần lớn ảnh sẽ phải tự tạo. Như vậy là bình thường, **tự tạo đúng còn hơn lấy ảnh sai**.
3. **Tuyệt đối không** lấy một ảnh "na ná" cho đủ số. Không có ảnh đúng thì tạo, tạo chưa được thì tạo lại.

# 3. PHONG CÁCH CHUNG (cho mọi ảnh tự tạo)

- Ảnh chụp thật, ánh sáng ban ngày tự nhiên, màu ấm dịu, như chụp bằng máy ảnh hoặc điện thoại tốt. **Không** giống 3D render, tranh vẽ hay "ảnh AI bóng bẩy".
- Bối cảnh TP.HCM: nhà phố, hẻm, sân gạch tàu, gạch bông, bếp nhà người Việt, chợ truyền thống, vựa ve chai, sân thượng trồng rau.
- Đồ vật là đồ người Việt dùng thật: rổ nhựa, thau nhôm, bao tải dứa, nồi cơm điện kiểu Việt, chén bát sứ, sọt nhựa đỏ, quạt cây nhựa.
- Nếu có người: người Việt, thường chỉ thấy tay hoặc người đang làm việc, **không nhìn vào máy ảnh**.
- **Vật chính nằm giữa khung, chiếm khoảng 60% ảnh, xung quanh chừa khoảng trống.** Thẻ trên web cắt ảnh khá nhiều (ảnh vuông bị cắt thành ngang), nên vật chính sát mép sẽ bị mất.
- **Phủ định, đưa vào mọi prompt:** `no readable text, no letters, no logos, no brand names, no labels with writing, no watermark, no copyrighted characters, no western supermarket, no western suburban house, no extra fingers, no distorted hands, no melted objects, nobody looking at the camera, no neon, no HDR`.
- Không có chữ đọc được là bắt buộc, vì công cụ tạo ảnh viết tiếng Việt sai. Bìa sách, báo, nhãn chai chỉ được có chữ mờ, nhòe, không đọc được.

# 4. QUY TRÌNH CHO MỖI ẢNH

1. Lưu ảnh thô vào `assets-src/content/<nhóm>/<tên>.png` (hoặc `.jpg`). Riêng nhóm `products` là thư mục mới.
2. Chuyển sang WebP đúng kích thước:
   `npm run content:image -- assets-src/content/<nhóm>/<tên>.png public/content/<nhóm>/<tên>.webp <rộng> <cao>`
   Kích thước lấy theo bảng ở mục 5. Script báo FAIL vì quá 150 KB thì tạo lại ảnh ít chi tiết vụn hơn. **Không** sửa script.
3. Xong mỗi nhóm, chạy `npm run content:sheet`, rồi **mở và NHÌN** file `assets-src/content/_sheet/<nhóm>.png`. Mỗi ô ghi tên mục đang dùng ảnh đó. Trả lời 7 câu hỏi ở mục 6 cho **từng ô**. Có một câu "không" thì làm lại ảnh đó.
4. Ghi một dòng **đúng sự thật** vào `public/content/NGUON-ANH.md` (mẫu ở mục 7).

# 5. DANH SÁCH 51 ẢNH: HIỆN TẠI SAI GÌ, ẢNH MỚI PHẢI CÓ GÌ

## 5.1 Bài học: `public/content/learn/`, 1200×900

| File | Dùng cho bài | Ảnh hiện tại (sai) | Ảnh mới PHẢI thấy |
|---|---|---|---|
| `phan-loai-rac-tai-nha.webp` | Phân loại rác tại nhà thành 3 nhóm chính | 4 thùng rác công cộng kiểu Âu ngoài đường | Góc bếp nhà phố Việt, **3 thùng nhỏ có nắp** đặt cạnh nhau dưới bồn rửa: một thùng vỏ rau củ, một thùng chai nhựa và lon đã rửa, một thùng rác còn lại. Phân biệt bằng màu nắp (xanh lá, xanh dương, xám), không dán chữ. |
| `chuan-bi-ve-chai-ban-duoc-gia.webp` | Chuẩn bị ve chai để bán được giá: rửa, ép dẹt, tách loại | Đống chai lộn xộn, nhãn nước ngoài | Trên sân gạch: chai nhựa **đã rửa, bóc nhãn, ép dẹp** trong bao tải dứa; lon nhôm đạp dẹt trong rổ nhựa; chồng bìa carton gấp phẳng buộc dây. **Gọn và sạch.** |
| `u-phan-huu-co-thung-xop.webp` | Ủ phân hữu cơ từ rác bếp trong thùng xốp | **Virus COVID-19** | **Thùng xốp trắng** trên sân thượng nhà phố, nắp mở, bên trong là vỏ rau củ và bã cà phê trộn đất nâu sẫm. Một bàn tay cầm xẻng nhỏ, bên cạnh có chậu rau. |
| `u-vo-trai-cay-nuoc-ngam-enzyme.webp` | Ủ vỏ trái cây làm nước ngâm enzyme tẩy rửa | Một cây bông cải xanh | Bình thủy tinh miệng rộng chứa **vỏ thơm (dứa), vỏ cam, vỏ quýt** ngâm trong nước màu hổ phách. Bên cạnh là chén đường nâu, đặt trên bàn bếp gỗ. |
| `di-cho-it-tui-nilon.webp` | Đi chợ ít túi nilon | Kệ rau siêu thị nước ngoài | **Sạp rau chợ truyền thống Việt Nam.** Tay người mua đưa **giỏ cói hoặc túi vải** để người bán bỏ rau muống, cà chua vào. Có một hộp nhựa có nắp để đựng thịt. Không có túi nilon ở vật chính. |
| `pin-bong-den-thuoc-het-han.webp` | Pin, bóng đèn và thuốc hết hạn | **Góc chơi game** | Trên bàn, ba nhóm để **riêng**: pin tiểu AA/AAA cũ trong hũ nhựa, bóng đèn compact và huỳnh quang cũ, vỉ thuốc và lọ thuốc hết hạn trong hộp giấy. Không nhãn hiệu đọc được. |
| `vong-doi-moi-cho-quan-ao-cu.webp` | Vòng đời mới cho quần áo cũ và sách báo | Kệ áo cửa hàng thời trang | Trên giường hoặc sàn nhà: quần áo cũ **gấp gọn** thành chồng, bên cạnh là **chồng sách báo cũ buộc dây**, và một thùng carton đang xếp đồ để đem cho. |
| `sua-do-gia-dung-truoc-khi-vut.webp` | Sửa đồ gia dụng nhỏ trước khi vứt | Kỹ sư nước ngoài trong phòng thí nghiệm | Bàn sửa đồ điện ở tiệm nhỏ nhà phố Việt: **tay người đang tháo quạt điện hoặc nồi cơm điện** bằng tua vít, có đồng hồ đo điện và mỏ hàn. |

## 5.2 Quà đổi điểm: `public/content/rewards/`, 800×800

Kiểu ảnh: **ảnh sản phẩm** như trên shop online Việt, đặt trên mặt bàn gỗ, vải bố hoặc nền sáng trơn. Vật chính rõ, nằm giữa.

| File | Quà | Ảnh hiện tại (sai) | Ảnh mới PHẢI thấy |
|---|---|---|---|
| `phan-huu-co-2kg.webp` | Túi phân hữu cơ 2kg | Cà rốt, mướp đắng ngoài chợ | **Túi giấy kraft** mở miệng đựng phân hữu cơ nâu sẫm tơi xốp, cạnh đó là một muỗng xúc. Không chữ trên túi. |
| `phan-trun-que-1kg.webp` | Phân trùn quế 1kg | Lối đi vườn hoa | **Túi zip trong suốt** đựng phân trùn quế đen, mịn. Một ít phân rắc ra bên cạnh, có vài lá cây nhỏ. |
| `tui-vai-di-cho.webp` | Túi vải đi chợ | Đồ văn phòng phẩm | **Túi vải bố màu mộc**, quai dài, đứng thẳng, bên trong ló bó rau muống và vài trái chanh. Bên cạnh là một túi khác gấp gọn. |
| `tui-luoi-dung-rau.webp` | Bộ 3 túi lưới đựng rau | **Lồng máy giặt** | **3 túi lưới cotton** màu mộc có dây rút, cỡ lớn, vừa, nhỏ, đựng cà chua, đậu bắp, xà lách. |
| `ong-hut-inox.webp` | Bộ ống hút inox kèm cọ rửa | **Ba người ngồi laptop** | **2 ống hút inox thẳng, 2 ống cong, 1 cọ rửa**, đặt cạnh túi vải nhỏ và một ly nước chanh. |
| `ly-thuy-tinh-tai-che.webp` | Ly thủy tinh tái chế | **Ly giấy** cà phê | **Ly thủy tinh dày màu xanh nhạt tự nhiên**, có bọt khí nhỏ trong thủy tinh, khoảng 350ml, đựng trà đá, đặt trên bàn gỗ. |
| `chau-luoi-ho.webp` | Chậu cây lưỡi hổ nhỏ | Lưỡi hổ trong chậu xi măng trắng (sai chất liệu) | Cây lưỡi hổ cao khoảng 25cm trong **chậu đất nung màu cam đỏ**. |
| `dung-cu-lam-vuon-mini.webp` | Bộ dụng cụ làm vườn mini | Chỉ có cái xẻng | **Đủ 3 món:** xẻng nhỏ, cào ba răng cán gỗ, bình tưới 1 lít, đặt cạnh một chậu đất. |

## 5.3 Cửa hàng xanh: `public/content/shops/`, 1200×900

Kiểu ảnh: **ảnh thật của cửa hàng hoặc xưởng ở TP.HCM.** Không có bảng hiệu chữ.

| File | Cửa hàng (khu vực) | Ảnh hiện tại (sai) | Ảnh mới PHẢI thấy |
|---|---|---|---|
| `phan-huu-co-ba-la.webp` | Phân hữu cơ Ba Lá (Gò Vấp): xưởng ủ phân từ rau củ chợ đầu mối | Cánh đồng lúa mì, hai người bắt tay | **Nhà xưởng mái tôn**, các đống phân đang ủ, bao phân xếp chồng, xe rùa. Công nhân đội nón lá đang xới phân. |
| `tiem-gon-gang-xanh.webp` | Tiệm Gọn Gàng Xanh (Quận 1): đồ thay thế nhựa dùng một lần | **Ô màu xanh trơn, không có ảnh** | Tiệm nhỏ trong nhà phố, **kệ gỗ** bày túi vải canvas, bình giữ nhiệt inox, bàn chải tre, màng bọc sáp ong. |
| `xuong-thuy-tinh-tai-sinh.webp` | Xưởng Thủy Tinh Tái Sinh (Quận 7): thổi chai cũ thành ly | Bình **gốm** trắng | **Xưởng thổi thủy tinh thủ công**: lò nung đỏ rực, thợ cầm ống thổi, kệ ly cốc **xanh ngọc**, sọt chai bia cũ chờ nấu lại. |
| `vuon-uom-cay-nha-minh.webp` | Vườn ươm Cây Nhà Mình (Thủ Đức): cây giống rau, thảo mộc | **Chợ sách cũ** | **Vườn ươm dưới lưới che nắng đen**, hàng hàng khay cây giống rau, chậu húng quế, bạc hà, lưỡi hổ. |
| `nong-trai-dat-lanh.webp` | Nông Trại Đất Lành (Bình Thạnh): đất sạch, xơ dừa, trấu hun | Khay cây con (lệch trọng tâm) | Kho hoặc sân chất **bao đất trồng**, **bánh xơ dừa ép** nâu, **bao trấu hun mở miệng** màu đen, có cái xẻng. |
| `dung-cu-xanh-nam-sai-gon.webp` | Dụng Cụ Xanh Nam Sài Gòn (Quận 5): cơ khí, thùng ủ rác, tưới nhỏ giọt | **Con gấu nâu** | Tiệm cơ khí nhỏ trong hẻm Chợ Lớn: **thùng ủ rác nhựa có vòi xả**, cuộn ống tưới nhỏ giọt, khay trồng rau, kéo cắt cành treo trên tường. |
| `tiem-xa-bong-sinh-thai.webp` | Tiệm Xà Bông Sinh Thái (Quận 3): bồ hòn, sả, dừa, nghệ | Xà bông oải hương kiểu Âu | Kệ có **chai thủy tinh đựng nước rửa chén bồ hòn**, **quả bồ hòn khô**, bó sả, trái dừa, **bánh xà bông màu vàng nghệ**. |
| `vuon-pho-xanh-ri.webp` | Vườn Phố Xanh Rì (Tân Bình): giàn rau sân thượng | Tay gieo hạt (lệch trọng tâm) | **Sân thượng nhà phố**, **kệ sắt chữ A bậc thang** với khay rau muống, cải ngọt, giàn mồng tơi leo, lưới che nắng. Phía sau là mái nhà phố. |

## 5.4 Đồ trao đổi: `public/content/swap/`, 1000×750

Kiểu ảnh: **người dân tự chụp đồ nhà mình bằng điện thoại** để đăng cho hay đổi. Đồ đặt trên giường, sàn gạch hoặc bàn trong nhà người Việt. Ánh sáng trong nhà tự nhiên, không phải ảnh studio.

| File | Món đồ | Ảnh hiện tại (sai) | Ảnh mới PHẢI thấy |
|---|---|---|---|
| `mau-1.webp` | Ảnh mẫu: Chồng sách cũ | Sách kinh doanh tiếng Anh | Chồng sách cũ, gáy sờn, bìa **không có chữ đọc được**, đặt trên sàn gạch. |
| `mau-2.webp` | Ảnh mẫu: Áo quần gấp gọn | Áo treo móc | Quần áo **gấp gọn** thành chồng trên giường. |
| `mau-3.webp` | Ảnh mẫu: Nồi chảo gia dụng | **Cơm chiên** trong chảo | Nồi inox và chảo chống dính cũ, rửa sạch, **xếp chồng** trên bàn bếp. |
| `mau-4.webp` | Ảnh mẫu: Đồ chơi trẻ em | Đống Lego | Rổ nhựa đựng đồ chơi cũ: xe đồ chơi, thú bông, khối gỗ. |
| `s-ao-khoac-jean.webp` | Áo khoác jean nam size L | **Quần** jean treo móc | **Một áo khoác jean nam** trải phẳng trên giường, thấy rõ cổ áo và hàng nút. |
| `s-sach-giao-khoa-lop-5.webp` | Trọn bộ sách giáo khoa lớp 5 | Chồng sách nước ngoài | Chồng **sách giáo khoa tiểu học Việt Nam** khổ nhỏ, bìa màu, chữ trên bìa mờ không đọc được, kèm vở và bút chì, buộc dây. |
| `s-noi-com-dien.webp` | Nồi cơm điện 1,8 lít | **Nồi áp suất Instant Pot** có logo | **Nồi cơm điện nắp gài kiểu Việt**, màu trắng có hoa văn, khoảng 1,8 lít, không logo, đặt trên bàn bếp. |
| `s-xe-day-em-be.webp` | Xe đẩy em bé gấp gọn | **Phòng ngủ khách sạn** | **Xe đẩy em bé có mái che**, đã gấp gọn, dựng ở hành lang hoặc phòng khách nhà phố. |
| `s-vay-cong-so.webp` | 3 váy công sở size M | **Quần nỉ vàng** ở sân bóng rổ | **3 chiếc váy công sở** màu đen, xanh than và be, trải trên giường. Một chiếc còn mác giấy (mác không có chữ). |
| `s-truyen-tranh.webp` | Thùng truyện tranh cũ khoảng 60 cuốn | Tranh anime dán tường | **Thùng carton mở nắp** đầy truyện tranh khổ nhỏ, giấy ngả vàng, xếp đứng. Không nhân vật có bản quyền, bìa không chữ đọc được. |
| `s-bo-chen-bat.webp` | Bộ chén bát sứ 12 món | Mấy cái **ly** sứ | **Bộ chén bát sứ trắng** (chén cơm, tô, dĩa) xếp chồng, bên cạnh có giấy báo gói (chữ báo không đọc được). |
| `s-lego-hop.webp` | Hộp đồ chơi lắp ráp khoảng 300 miếng | Mô hình Lego Star Wars trên đường | Khối lắp ráp nhựa nhiều màu đổ trong khay nhựa, vài mô hình nhỏ đã lắp xong. Không nhân vật có bản quyền. |

## 5.5 Sản phẩm ve chai: `public/content/products/`, 1200×900 (thư mục mới)

Hiện các ảnh này lấy từ CDN ngoài `z-cdn.chatglm.cn`, toàn ảnh nước ngoài, nhiều ảnh sai đồ. Tạo ảnh mới, **lưu vào máy**, rồi đổi giá trị trong object `IMAGES` ở `src/data/mock-data.ts` sang đường dẫn `/content/products/...`. **Chỉ sửa đúng object `IMAGES`**, không sửa dòng nào khác của file đó.

Kiểu ảnh: **vựa ve chai, nhà dân, sân nhà ở TP.HCM**, như người bán tự chụp để đăng tin.

| Khóa trong `IMAGES` | File mới | Đang dùng cho | Ảnh hiện tại (sai) | Ảnh mới PHẢI thấy |
|---|---|---|---|---|
| `paper` | `giay-vun.webp` | Danh mục "Giấy & Bìa carton", tư vấn | Đống carton kho nước ngoài | Giấy vụn và bìa carton **đã phân loại** thành từng đống ở vựa ve chai. |
| `plastic` | `nhua-cac-loai.webp` | Danh mục "Nhựa tái chế", lô "Nhựa các loại" | Đồ thủ công xoắn màu | **Bao tải dứa** đầy nhựa các loại: thau chậu bể, can nhựa, rổ nhựa cũ. |
| `metal` | `sat-vun.webp` | Danh mục "Kim loại & Sắt vụn", tin "Sắt vụn — nền nhà xưởng" | Thùng rác đầy lon | **Đống sắt vụn**: thép cây, ống sắt rỉ, khung sắt cũ trên nền xi măng nhà xưởng. |
| `glass` | `chai-lo-thuy-tinh.webp` | Danh mục "Chai lọ thủy tinh" | Chai xanh nước ngoài | Chai lọ thủy tinh đã rửa: chai nước mắm, hũ thủy tinh, chai bia **không nhãn**, xếp trong thùng. |
| `electronic` | `do-dien-tu-cu.webp` | Danh mục "Đồ điện tử cũ", tư vấn | Đống laptop kiểu bãi rác Mỹ | Thùng carton đựng đồ điện tử cũ: điện thoại cũ, đầu đĩa, remote, sạc, dây điện. |
| `furniture` | `do-gia-dung-thanh-ly.webp` | Danh mục "Đồ gia dụng thanh lý" | Showroom nội thất Âu | **Góc sân nhà phố** bày đồ thanh lý: tủ gỗ nhỏ, ghế nhựa, quạt, nồi, chờ người tới lấy. |
| `cardboard` | `carton-ep-kien.webp` | Tin "Giấy carton sạch — đã ép kiện", lô "Giấy & bìa carton" | Thùng có chữ tiếng Anh "SALISBURY D.C." | **Kiện carton đã ép vuông, buộc dây thép**, chất trong vựa. |
| `petBottles` | `chai-pet.webp` | Tin "Chai nhựa PET đã phân loại", lô "Chai nhựa PET" | **Chai nhựa dưới đáy biển** | **Bao tải** đầy chai PET trong suốt, **đã bóc nhãn, ép dẹp**. |
| `aluminum` | `lon-nhom.webp` | Tin "Lon nhôm đã phân loại", lô "Lon nhôm" | Lon có nhãn hiệu nước ngoài | **Bao lưới** đầy lon nhôm đạp dẹt, không nhãn hiệu đọc được. |
| `fan` | `quat-cay-cu.webp` | Tin "Máy quạt cây cũ còn hoạt động" | **Quạt đồng cổ** kiểu châu Âu | **Quạt cây nhựa phổ thông** (trắng hoặc xanh), loại nhà nào ở Việt Nam cũng có, đặt trong phòng khách. |
| `woodenTable` | `ban-go-cu.webp` | Tin "Bàn gỗ cũ — còn chắc chắn" | Ghế đẩu gỗ | **Bàn gỗ 4 chân**, mặt trầy xước nhẹ, còn chắc, đặt ở sân hoặc trong nhà. |
| `newspaper` | `giay-bao-cu.webp` | Tin "Giấy báo cũ — bao nhiêu cân" | Báo tiếng Anh | **Chồng báo cũ buộc dây** (chữ mờ không đọc được) đặt cạnh **cân đồng hồ**. |
| `glassBottles` | `chai-thuy-tinh-nguyen.webp` | Tin "Chai thủy tinh nguyên vẹn", lô, tư vấn | Thùng tái chế xanh kiểu Mỹ | **Sọt nhựa đỏ** đựng chai bia, chai nước ngọt thủy tinh **còn nguyên**, không nhãn. |
| `oldPC` | `may-tinh-ban-cu.webp` | Tin "Máy vi tính bàn cũ — đã bán" | Khay bo mạch trong phòng lab | **Bộ máy tính để bàn cũ**: thùng CPU, màn hình LCD, bàn phím, chuột, đặt trên bàn. |
| `woodenChair` | `ghe-go.webp` | Tin "Ghế gỗ thanh lý — còn mới 80%" | **Một cái bàn** (sai đồ) | **1–2 ghế gỗ có tựa lưng**, còn mới, đặt ở phòng khách hoặc sân. |

Ảnh mới của `IMAGES.paper` khác ảnh `cardboard`, và `glass` khác `glassBottles`. **Không được dùng một ảnh cho hai khóa.**

# 6. BẢY CÂU HỎI KIỂM TRA CHO TỪNG ẢNH

Mở `assets-src/content/_sheet/<nhóm>.png` và trả lời cho **từng ô**. Phải "có" cả 7 câu thì ảnh mới đạt:
1. Nhìn **1 giây** là biết ngay đó là thứ ghi trên nhãn ô?
2. Đúng **số lượng và đặc điểm** đã mô tả (3 thùng; 2 ống thẳng + 2 ống cong + 1 cọ; chậu đất nung; áo khoác chứ không phải quần...)?
3. Bối cảnh **Việt Nam** (nhà phố, gạch, chợ, hẻm, vựa, đồ dùng Việt), không phải siêu thị hay nhà kiểu Âu Mỹ?
4. **Không** có chữ đọc được, logo, nhãn hiệu hay nhân vật có bản quyền?
5. **Không** có lỗi AI: tay thừa ngón, vật bị méo hay chảy, vật lơ lửng, chữ giả loằng ngoằng nổi bật?
6. Thu nhỏ còn 300px vẫn nhận ra? Vật chính có nằm giữa, không sát mép?
7. Không trùng hay quá giống một ảnh khác trên web?

# 7. NHẬT KÝ NGUỒN ẢNH: VIẾT LẠI TOÀN BỘ, ĐÚNG SỰ THẬT

Xóa sạch nội dung cũ của `public/content/NGUON-ANH.md` (vì nó bịa) và viết lại theo bảng:

| File | Loại | Nguồn | Tác giả | Giấy phép | Ảnh thực tế cho thấy gì |
|---|---|---|---|---|---|
| learn/u-phan-huu-co-thung-xop.webp | Tự tạo (AI) | Công cụ tạo ảnh trong Antigravity | – | Tự tạo cho Green City | Thùng xốp trắng trên sân thượng, vỏ rau và bã cà phê trộn đất, tay cầm xẻng nhỏ |
| ... | Ảnh thật | link trang ảnh **đã mở thật** | tên trên trang | Unsplash License / Pexels License / CC0 / CC BY 4.0 | mô tả **đúng những gì nhìn thấy** |

- Cột cuối mô tả **đúng thứ có trong ảnh**, không phải thứ bạn mong ảnh có.
- Ảnh CC BY phải ghi đủ tên tác giả và link giấy phép.
- Thêm một mục ở cuối file liệt kê **prompt rút gọn** của mỗi ảnh tự tạo.

# 8. LUẬT CỨNG

- **Được sửa:** file ảnh trong `public/content/**`, ảnh thô trong `assets-src/content/**`, `public/content/NGUON-ANH.md`, và **chỉ object `IMAGES`** trong `src/data/mock-data.ts`.
- **Không** đổi tên file ảnh đang có, không đổi tên, mô tả hay dữ liệu của bất kỳ mục nào trong `src/data/**`.
- **Không** sửa `scripts/collab/**`, `next.config.ts`, `package.json`, hay bất cứ thứ gì trong `src/lobby/**` và `public/lobby/**`.
- **Không** hạ chất lượng hay kích thước để lách giới hạn 150 KB. Tạo lại ảnh gọn hơn.
- **Không commit.** `src/data/mock-data.ts` nằm ngoài vùng file của Gemini. Người dùng sẽ tự commit. Không chạy `git add -A`, `git stash`, `git reset`, `git clean`.
- **Không báo "xong"** khi còn ảnh chưa qua 7 câu hỏi. **Không** ghi vào báo cáo hay nhật ký điều gì bạn chưa làm hoặc chưa nhìn thấy.

# 9. ĐỊNH NGHĨA HOÀN THÀNH

- [ ] Đủ 51 file mới: 8 learn, 8 rewards, 8 shops, 12 swap, 15 products.
- [ ] `npm run content:missing` báo đủ ảnh.
- [ ] `npm run content:sheet` chạy được, ra 5 bảng: learn, rewards, shops, swap, products.
- [ ] Mọi ô trong 5 bảng đều qua 7 câu hỏi ở mục 6.
- [ ] `src/data/mock-data.ts` không còn link `z-cdn.chatglm.cn` nào. Kiểm tra bằng `grep -n "chatglm" src/data/mock-data.ts`, kết quả phải rỗng.
- [ ] `NGUON-ANH.md` đã viết lại, đủ 51 dòng, mỗi dòng đúng sự thật.
- [ ] `npm run lint` và `npm run build` thành công.
- [ ] Mở web (`npx next start -p 3100` sau khi build; port 3000 là của người dùng) và xem tận mắt các trang: Học, Đổi quà, Cửa hàng xanh, Trao đổi đồ, Khám phá. Mỗi trang chụp màn hình một lần.

# 10. BÁO CÁO CUỐI (gửi trong khung chat, tiếng Việt)

1. Đường dẫn 5 file bảng soi ảnh trong `assets-src/content/_sheet/` và 5 ảnh chụp các trang web.
2. Bảng 51 dòng: tên file | tự tạo hay ảnh thật | tóm tắt 7 câu trả lời (ví dụ "7/7").
3. Những ảnh phải tạo lại nhiều lần và lý do.
4. Nhắc người dùng tự commit.

## KẾT THÚC PROMPT
