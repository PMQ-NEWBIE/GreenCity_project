import type {
  ArticleTopic,
  GreenShopKind,
  PointReason,
  PointStatus,
  RedemptionStatus,
  RewardCategory,
  SwapCategory,
  SwapCondition,
  SwapStatus,
  WasteGroup,
} from "@/types/features";
import type { UserRole } from "@/types";

export const POINT_REASON_LABEL: Record<PointReason, string> = {
  welcome: "Điểm chào mừng",
  home_pickup: "Thu gom tận nhà",
  bin_dropoff: "Bỏ đồ vào thùng",
  litter_report: "Báo điểm rác",
  bin_full_report: "Báo thùng đầy",
  redeem: "Đổi quà",
  admin_adjust: "Điều chỉnh",
};

export const POINT_STATUS_LABEL: Record<PointStatus, string> = {
  pending: "Chờ xác minh",
  confirmed: "Đã ghi nhận",
  rejected: "Không được duyệt",
};

export const REWARD_CATEGORY_LABEL: Record<RewardCategory, string> = {
  "phan-bon": "Phân bón",
  "tui-vai": "Túi vải",
  "do-dung": "Đồ dùng",
  "cay-giong": "Cây giống",
};

export const REDEMPTION_STATUS_LABEL: Record<RedemptionStatus, string> = {
  ready: "Chờ nhận",
  collected: "Đã nhận",
  expired: "Hết hạn",
};

export const SWAP_CATEGORY_LABEL: Record<SwapCategory, string> = {
  "quan-ao": "Quần áo",
  sach: "Sách",
  "gia-dung": "Đồ gia dụng",
  "do-tre-em": "Đồ trẻ em",
  khac: "Khác",
};

export const SWAP_CONDITION_LABEL: Record<SwapCondition, string> = {
  "nhu-moi": "Như mới",
  tot: "Còn tốt",
  "da-dung": "Đã dùng nhiều",
};

export const SWAP_STATUS_LABEL: Record<SwapStatus, string> = {
  open: "Đang mở",
  reserved: "Đã có người hẹn",
  done: "Đã trao đổi",
};

export const WASTE_GROUPS: Record<WasteGroup, { label: string; description: string }> = {
  "tai-che": {
    label: "Tái chế được",
    description: "Giấy, nhựa, kim loại, thủy tinh còn sạch. Gom riêng để bán ve chai hoặc bỏ thùng tái chế.",
  },
  "thuc-pham": {
    label: "Rác thực phẩm",
    description: "Thức ăn thừa, vỏ rau củ trái cây, bã trà, bã cà phê. Ủ thành phân được.",
  },
  khac: {
    label: "Rác còn lại",
    description: "Không tái chế được và không phải thức ăn: tã, khăn giấy bẩn, túi nilon dính dầu mỡ.",
  },
  "nguy-hai": {
    label: "Rác nguy hại",
    description: "Pin, bóng đèn, thuốc hết hạn, bình xịt, hóa chất. Gom riêng, không bỏ chung với rác khác.",
  },
  "cong-kenh": {
    label: "Đồ cồng kềnh",
    description: "Bàn ghế, nệm, tủ, đồ điện lớn. Hẹn người tới thu gom riêng.",
  },
};

export const ARTICLE_TOPIC_LABEL: Record<ArticleTopic, string> = {
  "phan-loai": "Phân loại rác",
  "u-phan": "Ủ phân",
  "giam-rac": "Giảm rác",
  "tai-su-dung": "Tái sử dụng",
};

export const GREEN_SHOP_KIND_LABEL: Record<GreenShopKind, string> = {
  "phan-bon": "Phân bón hữu cơ",
  "lam-vuon": "Dụng cụ làm vườn",
  "san-pham-xanh": "Sản phẩm xanh",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  resident: "Người dân",
  partner: "Người thu mua",
  collaborator: "Cộng tác viên",
  business: "Doanh nghiệp tái chế",
  operator: "Ban điều hành",
};
