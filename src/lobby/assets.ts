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
  /** Lớp 1 (chế độ tối) — thành phố Sài Gòn về đêm rực rỡ ánh đèn */
  skyNight: {
    src: "/lobby/hero-layer-1-sky-night.webp",
    width: 2560,
    height: 1440,
    alt: "Quang cảnh khu phố Sài Gòn về đêm rực rỡ ánh đèn",
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
  /** Hero ĐIỆN THOẠI (< 768px) — MỘT ảnh dọc chụp liền khối: xe đạp ve chai dựng trên vỉa hè hẻm Sài Gòn,
   *  nửa trên là trời / hẻm mờ sáng để đặt chữ. Thay cho lớp 1 + lớp 4 khi MOBILE_HERO_READY = true. */
  mobileHero: {
    src: "/lobby/hero-mobile.webp",
    width: 1080,
    height: 1920,
    alt: "Xe đạp ve chai chở bìa carton và bao chai nhựa dựng bên vỉa hè hẻm Sài Gòn buổi sớm",
    transparent: false,
    maxKB: 260,
  },
  /** Lớp 5 — tán lá và sương mỏng sát mép dưới; 40% phía trên trong suốt hoàn toàn
   *  (lớp này cao 30% màn hình, không được che nút "Bán ve chai ngay") */
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

/**
 * Bật true khi public/lobby/hero-mobile.webp đã qua `npm run assets:verify`.
 * false: điện thoại ghép bầu trời + xe đạp tách nền, có dải sương và bóng đổ để xe đứng trên mặt đất
 * (ảnh bầu trời chụp từ trên mái nhà nên xe đặt thẳng lên đó trông như đang bay).
 */
export const MOBILE_HERO_READY = true;

/**
 * Ảnh hero dọc tách 2 lớp (npm run assets:split-mobile-hero) để xe đạp chạy đi được khi đổi sang tối trên điện thoại:
 * nền không có xe + lớp xe (kèm bóng) trong suốt cùng khung 1080×1920. Chồng lên nhau nhìn y như mobileHero.
 */
export const MOBILE_HERO_LAYERS = {
  empty: "/lobby/hero-mobile-empty.webp",
  bike: "/lobby/hero-mobile-bike.webp",
  /** Đường chân trời (trời giáp mặt đường) theo tỉ lệ chiều cao ảnh — 1288/1920, khớp HORIZON trong split-mobile-hero.mjs.
   *  Sang tối, nền ngày tách đôi tại đây: nửa trên trượt lên, nửa dưới trượt xuống. */
  horizon: 1288 / 1920,
} as const;


/** Hạt nhiễu film grain (ô 128px lặp lại) — đã tạo sẵn, không cần thay. */
export const GRAIN_TILE = "/lobby/grain.png";
