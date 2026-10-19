import Image from "next/image";
import { LOBBY_ASSETS, type LobbyAsset } from "../assets";

interface Feature {
  title: string;
  text: string;
  steps: string[];
  image: LobbyAsset;
}

const FEATURES: Feature[] = [
  {
    title: "Bán đồ cũ trong một phút",
    text: "Chụp một tấm ảnh, ghi giá và khu vực. Người thu mua quanh bạn thấy tin ngay và gọi lại hẹn giờ.",
    steps: ["Chụp ảnh", "Ghi giá", "Đăng tin"],
    image: LOBBY_ASSETS.feature1,
  },
  {
    title: "Tìm đúng loại, đúng khu",
    text: "Cần giấy carton, lon nhôm hay vài chiếc quạt cũ để tháo linh kiện? Lọc theo loại, theo giá, theo quận — khỏi đi hỏi từng vựa.",
    steps: ["Chọn loại", "Lọc khu vực", "Gọi người bán"],
    image: LOBBY_ASSETS.feature2,
  },
  {
    title: "Gọi người tới tận nhà",
    text: "Đồ cồng kềnh, mấy bao ve chai, hay chỉ muốn dọn nhà cho gọn? Gửi một yêu cầu, người thu gom gần nhất tới cân và trả tiền tại chỗ.",
    steps: ["Chọn loại đồ", "Chọn giờ rảnh", "Chờ cuộc gọi"],
    image: LOBBY_ASSETS.feature3,
  },
];

export function LobbyFeatures() {
  return (
    <section
      id="tinh-nang"
      data-features
      aria-labelledby="features-title"
      className="relative scroll-mt-20 bg-gradient-to-b from-gc-100 to-gc-200 px-5 pb-24 pt-20 sm:px-6 md:pt-28 lg:px-10 lg:pb-32"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="features-title" className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-gc-900">
          Ba việc bạn làm được ngay hôm nay
        </h2>

        <ol className="mt-14 flex flex-col gap-20 md:mt-20 md:gap-28">
          {FEATURES.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={f.title} data-feature className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                <div
                  data-feature-media
                  className={`overflow-hidden rounded-3xl bg-gc-200 shadow-xl shadow-gc-950/5 ring-1 ring-gc-800/10 md:col-span-7 ${flip ? "md:order-2" : ""}`}
                >
                  <div data-feature-img className="relative aspect-[4/3]">
                    <Image
                      src={f.image.src}
                      alt={f.image.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 58vw"
                      quality={70}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div data-feature-text className={`md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                  <span aria-hidden="true" className="font-brand text-[64px] leading-none text-gc-400">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold leading-tight tracking-[-0.01em] text-gc-900">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-gc-800">{f.text}</p>
                  <p className="mt-5 text-[14px] font-semibold text-gc-700">
                    <span className="sr-only">Cách làm: </span>
                    {f.steps.join(" → ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
