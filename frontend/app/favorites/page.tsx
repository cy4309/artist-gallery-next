"use client";

import { useUser } from "@/hooks/useUser";
import { useLiff } from "@/components/LiffProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Card, Row, Col, Typography, Empty, Tag } from "antd";
import { fetchFavoriteList } from "@/services/client/favoriteClient";
import type { FavoriteRecord } from "@/types/favorite/shared";
import LoadingIndicator from "@/components/LoadingIndicator";
import { formatDateSmart } from "@/utils/date";
import { useLocale } from "@/locales/contexts/LocaleContext";
import EventCard from "@/components/EventCard";

const { Title, Text } = Typography;

function isEnded(endDate?: string) {
  if (!endDate) return false;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return false;

  // 🔑 將結束時間視為「當天 23:59:59（台灣）」
  const taiwanEndOfDay = new Date(
    end.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }) + "T23:59:59"
  );

  return Date.now() > taiwanEndOfDay.getTime();
}

export default function FavoritesPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading, loadUser } = useUser();
  const { isInClient, ready: liffReady } = useLiff();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [fetching, setFetching] = useState(false);

  // --------------------------------------------------
  // 0️⃣ Auth Guard
  // --------------------------------------------------
  useEffect(() => {
    if (!liffReady || loading) return;

    if (isInClient && !user) {
      window.location.href = `/api/auth/login-line?returnTo=/favorites`;
      return;
    }

    if (!isInClient && !user) {
      router.replace("/auth");
    }
  }, [liffReady, loading, isInClient, user, router]);

  // --------------------------------------------------
  // 1️⃣ 初始化 user
  // --------------------------------------------------
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // --------------------------------------------------
  // 2️⃣ 抓 Favorites（只吃 USER_FAVORITES）
  // --------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        setFetching(true);
        const data = await fetchFavoriteList();

        const sorted = [...data.favorites].sort((a, b) => {
          const aEnded = isEnded(a.eventEndDate);
          const bEnded = isEnded(b.eventEndDate);

          // ① 未結束排前
          if (aEnded !== bEnded) {
            return aEnded ? 1 : -1;
          }

          // ② 收藏時間（新 → 舊）
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          return bt - at;
        });

        setFavorites(sorted);
      } catch (err) {
        console.error("[FavoritesPage] load failed", err);
        setFavorites([]);
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [user?.id]);

  if (!user) return null;
  if (fetching) return <LoadingIndicator />;
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {favorites.length === 0 && <Empty description="沒有收藏項目" />}

      {/* 排序提示 */}
      {favorites.length > 0 && (
        <div className="mb-4 border-b border-gray-400 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            {/* <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" /> */}
            <ClockCircleOutlined />
            {t.favorites.sortedHint}
          </span>
          <span className="opacity-70">{t.favorites.hint}</span>
        </div>
      )}

      <Row gutter={[24, 24]}>
        {favorites.map((item) => {
          const ended = isEnded(item.eventEndDate);

          return (
            <Col xs={24} md={12} lg={8} key={item.eventId}>
              <EventCard
                item={item}
                ended={ended}
                onUnfavorite={() =>
                  setFavorites((prev) =>
                    prev.filter((f) => f.eventId !== item.eventId)
                  )
                }
              />
            </Col>

            // <Col xs={24} md={12} lg={8} key={item.eventId}>
            //   <Card
            //     hoverable={!ended}
            //     cover={
            //       <div className="relative">
            //         <img
            //           className={`h-52 w-full object-cover ${
            //             ended ? "grayscale opacity-70" : ""
            //           }`}
            //           src={item.imageUrl || "/images/placeholder-no-image.png"}
            //           alt={item.eventTitle}
            //         />

            //         <div className="absolute top-2 right-2">
            //           <FavoriteButton
            //             eventId={item.eventId}
            //             onUnfavorite={() => {
            //               setFavorites((prev) =>
            //                 prev.filter((f) => f.eventId !== item.eventId)
            //               );
            //             }}
            //           />
            //         </div>

            //         {ended && (
            //           <Tag color="default" className="absolute top-2 left-2">
            //             已結束
            //           </Tag>
            //         )}
            //       </div>
            //     }
            //   >
            //     <Title level={5}>{item.eventTitle}</Title>

            //     {(item.eventStartDate || item.eventEndDate) && (
            //       <Text type="secondary" className="block mb-1">
            //         {formatDateSmart(item.eventStartDate)}
            //         {item.eventEndDate
            //           ? ` - ${formatDateSmart(item.eventEndDate)}`
            //           : ""}
            //       </Text>
            //     )}

            //     {item.eventLocation && (
            //       <Text className="block text-sm mb-2">
            //         {item.eventLocation}
            //       </Text>
            //     )}

            //     {item.eventUrl && (
            //       <a
            //         href={item.eventUrl}
            //         target="_blank"
            //         rel="noreferrer"
            //         className="text-primaryBlue dark:text-blue-300 text-sm"
            //       >
            //         查看活動官網 →
            //       </a>
            //     )}
            //   </Card>
            // </Col>
          );
        })}
      </Row>
    </div>
  );
}

// "use client";

// import { useUser } from "@/hooks/useUser";
// import { useLiff } from "@/components/LiffProvider";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import type { CarouselItem } from "@/components/Carousel";
// import { getOrgData } from "@/services/client/orgDataClient";
// import FavoriteButton from "@/components/FavoriteButton";
// import { Card, Row, Col, Typography, Empty } from "antd";
// import { OrgEvent } from "@/types/event";

// export default function FavoritesPage() {
//   const router = useRouter();
//   const { Title, Text, Paragraph } = Typography;
//   const { user, favorites, loading, reloadFavorites, loadUser } = useUser();
//   const { isInClient, ready: liffReady } = useLiff();
//   const [eventList, setEventList] = useState<CarouselItem[]>([]);
//   const [orgData, setOrgData] = useState<OrgEvent[]>([]);

//   // --------------------------------------------------
//   // 0️⃣ Auth Guard（⭐重點修正在這）
//   // --------------------------------------------------
//   useEffect(() => {
//     if (!liffReady || loading) return;

//     // A) LINE 官方帳號入口（LIFF）＋尚未登入 → 自動 LINE Login
//     if (isInClient && !user) {
//       const returnTo = "/favorites";
//       window.location.href = `/api/auth/login-line?returnTo=${encodeURIComponent(
//         returnTo
//       )}`;
//       return;
//     }

//     // B) 非 LIFF ＋尚未登入 → 導到登入頁
//     if (!isInClient && !user) {
//       router.replace("/auth");
//     }
//   }, [liffReady, loading, isInClient, user, router]);

//   /**************************************************
//    * 初始化讀 user（server-side session）
//    **************************************************/
//   useEffect(() => {
//     loadUser();
//   }, []);

//   // --------------------------------------------------
//   // 1️⃣ 抓文化部活動列表
//   // --------------------------------------------------
//   useEffect(() => {
//     const fetchOrgData = async () => {
//       try {
//         const response = await getOrgData();
//         setOrgData(response as OrgEvent[]);
//       } catch (error) {
//         console.error("Failed to fetch org data:", error);
//       }
//     };

//     fetchOrgData();
//   }, []);

//   // --------------------------------------------------
//   // 2️⃣ 重新抓收藏（登入後）
//   // --------------------------------------------------
//   useEffect(() => {
//     if (!user?.id) return;
//     reloadFavorites(user.id);
//   }, [user?.id, reloadFavorites]);

//   // --------------------------------------------------
//   // 3️⃣ 過濾收藏活動
//   // --------------------------------------------------
//   useEffect(() => {
//     if (!orgData.length) return;

//     if (!favorites || favorites.length === 0) {
//       setEventList([]);
//       return;
//     }

//     const matched = orgData.filter((ev) =>
//       favorites.includes(String(ev.actId))
//     );

//     setEventList(matched);
//   }, [orgData, favorites]);

//   if (!user) return null; // redirect 中，不顯示「請先登入」
//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       {eventList.length === 0 && <Empty description="沒有收藏項目" />}

//       <Row gutter={[24, 24]}>
//         {eventList.map((item) => (
//           <Col xs={24} md={12} lg={8} key={item.actId}>
//             <Card
//               hoverable
//               cover={
//                 <div className="relative">
//                   <img
//                     className="h-52 w-full object-cover"
//                     loading="lazy"
//                     decoding="async"
//                     src={`https://cloud.culture.tw/${item.imageUrl}`}
//                     alt={item.actName}
//                     onError={(e) => {
//                       (e.currentTarget as HTMLImageElement).src =
//                         "/images/placeholder-no-image.png";
//                     }}
//                   />
//                   <div className="absolute top-2 right-2">
//                     <FavoriteButton eventId={String(item.actId)} />
//                   </div>
//                 </div>
//               }
//             >
//               <Title level={5}>{item.actName}</Title>

//               <Text type="secondary" className="block mb-1">
//                 {item.startTime.split(",")[0]} - {item.endTime.split(",")[0]}
//               </Text>

//               <Text className="block text-sm mb-2">{item.address}</Text>

//               <Paragraph ellipsis={{ rows: 3 }}>
//                 {item.description || "（無描述內容）"}
//               </Paragraph>

//               <a
//                 href={item.website}
//                 target="_blank"
//                 className="text-primaryBlue dark:text-blue-300 text-sm"
//               >
//                 查看活動官網 →
//               </a>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// }
