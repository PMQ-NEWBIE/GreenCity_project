# Bản đồ xanh: ghi chú vận hành

- Thư viện: `leaflet` 1.9 + `react-leaflet` 5 (người dùng duyệt ngày 2026-10-19). Chỉ nạp ở trang `/ban-do`, phía trình duyệt.
- Ô bản đồ (tile) đang lấy thẳng từ `tile.openstreetmap.org`, có ghi nguồn "© OpenStreetMap contributors" ở góc bản đồ.
- **Khi chạy thật với nhiều người dùng**: máy chủ tile của OpenStreetMap chỉ dành cho lượng truy cập nhỏ ([chính sách sử dụng](https://operations.osmfoundation.org/policies/tiles/)). Cần chuyển sang một nhà cung cấp tile có hợp đồng (hoặc tự dựng máy chủ tile), rồi đổi `url` và `attribution` trong `src/features/map/LeafletMap.tsx`.
- Nền tối: ô bản đồ được đảo màu bằng CSS (`.dark .gc-map .leaflet-tile-pane` trong `src/app/globals.css`). Nhà cung cấp mới có sẵn kiểu tối thì bỏ quy tắc này.
- Tọa độ thùng, vựa, vườn, gian hàng đều là dữ liệu minh họa.
