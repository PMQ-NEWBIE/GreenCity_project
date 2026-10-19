/**
 * HỢP ĐỒNG giữa Claude (nền móng, tính năng nâng cao) và Gemini (giao diện tính năng cơ bản).
 *
 * File này CHỈ re-export, không chứa logic. Code của Gemini chỉ import dữ liệu/hook từ đây.
 * Luật: sau tag `nen-mong` chỉ được THÊM export; không đổi tên, không xóa, không đổi kiểu.
 * Thay đổi đi qua nhánh main và được ghi vào docs/collab/claude-thong-bao.md.
 */

// Đường dẫn và khu vực
export { ROUTES } from "@/lib/routes";
export { AREAS } from "@/types";
export type { Area, DemoUser, UserRole } from "@/types";

// Người dùng và thông báo
export { useCurrentUser, useToast } from "@/store/hooks";

// Định dạng
export { formatDate, formatDateTime, formatRelativeTime } from "@/utils/format";
export { compressImage } from "@/lib/image";

// Điểm thưởng
export type { PointReason, PointStatus, PointEntry, PointRule } from "@/types/features";
export { POINT_RULES } from "@/data/point-rules";
export { POINT_REASON_LABEL, POINT_STATUS_LABEL } from "@/data/labels";
export { usePoints } from "@/store/hooks";

// Đổi quà
export type { RewardCategory, Reward, RedemptionStatus, Redemption, RedeemResult } from "@/types/features";
export { REWARD_CATEGORY_LABEL, REDEMPTION_STATUS_LABEL } from "@/data/labels";
export { useRewards } from "@/store/hooks";

// Trao đổi đồ
export type { SwapCategory, SwapCondition, SwapStatus, SwapItem, NewSwapItem } from "@/types/features";
export { SWAP_CATEGORY_LABEL, SWAP_CONDITION_LABEL, SWAP_STATUS_LABEL } from "@/data/labels";
export { SWAP_SAMPLE_IMAGES } from "@/data/swap-seed";
export { useSwap } from "@/store/hooks";

// Kiến thức (dữ liệu do Gemini viết trong src/data/knowledge.ts)
export type { WasteGroup, ArticleTopic, ArticleBlock, Article, SortingGuideItem } from "@/types/features";
export { WASTE_GROUPS, ARTICLE_TOPIC_LABEL } from "@/data/labels";

// Gian hàng xanh (dữ liệu do Gemini viết trong src/data/green-shops.ts)
export type { GreenShopKind, GreenShop, GreenShopProduct } from "@/types/features";
export { GREEN_SHOP_KIND_LABEL } from "@/data/labels";
