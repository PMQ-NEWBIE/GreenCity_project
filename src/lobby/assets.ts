/**
 * ẢNH CỦA LOBBY (và panel trang đăng nhập).
 * Muốn thay ảnh: ghi đè đúng file trong public/lobby/ với đúng tên, kích thước, định dạng dưới đây.
 * Không cần sửa code. Nếu đổi tỉ lệ khung ảnh thì cập nhật width/height tương ứng.
 *
 * alt rỗng ("") = ảnh trang trí, trình đọc màn hình bỏ qua.
 */
export interface LobbyAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Cần nền trong suốt (WebP có alpha) */
  transparent: boolean;
  /** Dung lượng mục tiêu tối đa */
  maxKB: number;
}

export const LOBBY_ASSETS = {
  /** Lớp 1 — bầu trời / phố buổi sớm, phủ kín khung */
  sky: {
    src: "/lobby/hero-layer-1-sky.webp",
    width: 2560,
    height: 1440,
    alt: "Quang cảnh khu phố Sài Gòn dưới bầu trời sáng sớm",
    transparent: false,
    maxKB: 300,
  },
  /** Lớp 4 — vật thể chính đã tách nền: xe đạp ve chai chở đầy giấy, chai, lon */
  subject: {
    src: "/lobby/hero-layer-4-subject.webp",
    width: 1600,
    height: 1600,
    alt: "Xe đạp ve chai chất gọn bìa carton, bao chai nhựa và rổ lon nhôm",
    transparent: true,
    maxKB: 300,
  },
  /** Lớp 5 — tán lá và sương mỏng sát mép dưới; 40% phía trên trong suốt hoàn toàn
   *  (lớp này cao 30% màn hình, không được che nút "Bắt đầu ngay") */
  foreground: {
    src: "/lobby/hero-layer-5-foreground.webp",
    width: 2560,
    height: 800,
    alt: "",
    transparent: true,
    maxKB: 250,
  },
  feature1: {
    src: "/lobby/feature-1-ban-do-cu.webp",
    width: 1200,
    height: 900,
    alt: "Người dùng cầm điện thoại chụp ảnh chồng bìa carton buộc gọn để đăng bán",
    transparent: false,
    maxKB: 180,
  },
  feature2: {
    src: "/lobby/feature-2-tim-mua.webp",
    width: 1200,
    height: 900,
    alt: "Các bao phế liệu chai nhựa, lon nhôm và báo cũ phân loại ngăn nắp trên vỉa hè Sài Gòn",
    transparent: false,
    maxKB: 180,
  },
  feature3: {
    src: "/lobby/feature-3-thu-gom.webp",
    width: 1200,
    height: 900,
    alt: "Người thu gom chuyển bao ve chai lên xe kéo trong con hẻm Sài Gòn buổi sớm",
    transparent: false,
    maxKB: 180,
  },
  /** Nền khối CTA cuối trang (tông xanh tối) */
  ctaBackground: {
    src: "/lobby/cta-background.webp",
    width: 2400,
    height: 1200,
    alt: "",
    transparent: false,
    maxKB: 220,
  },
  /** Ảnh dọc bên trái trang đăng nhập / đăng ký */
  authPanel: {
    src: "/lobby/auth-panel.webp",
    width: 1400,
    height: 1800,
    alt: "Người phụ nữ trao bó báo cũ cho người thu gom ve chai trong con hẻm Sài Gòn",
    transparent: false,
    maxKB: 220,
  },
} as const satisfies Record<string, LobbyAsset>;

/** Hạt nhiễu film grain (ô 128px lặp lại) — đã tạo sẵn, không cần thay. */
export const GRAIN_TILE = "/lobby/grain.png";
