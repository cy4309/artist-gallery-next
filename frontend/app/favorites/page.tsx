"use client";

import { useUser } from "@/hooks/useUser";
import { useLiff } from "@/components/LiffProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CarouselItem } from "@/components/Carousel";
import { getOrgData } from "@/services/client/orgDataClient";
import FavoriteButton from "@/components/FavoriteButton";
import { Card, Row, Col, Typography, Empty } from "antd";
import LoadingIndicator from "@/components/LoadingIndicator";

export interface OrgData {
  actId: number;
  cityName: string;
  actName: string;
  startTime: string;
  endTime: string;
  address: string;
  imageUrl: string;
  description: string;
  website: string;
}

export default function FavoritesPage() {
  const { Title, Text, Paragraph } = Typography;
  const router = useRouter();

  const { user, favorites, loading, reloadFavorites, loadUser } = useUser();
  const { isInClient, ready: liffReady } = useLiff();

  const [eventList, setEventList] = useState<CarouselItem[]>([]);
  const [orgData, setOrgData] = useState<OrgData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // --------------------------------------------------
  // 0️⃣ Auth Guard（⭐重點修正在這）
  // --------------------------------------------------
  useEffect(() => {
    if (!liffReady || loading) return;

    // A) LINE 官方帳號入口（LIFF）＋尚未登入 → 自動 LINE Login
    if (isInClient && !user) {
      const returnTo = "/favorites";
      window.location.href = `/api/auth/login-line?returnTo=${encodeURIComponent(
        returnTo
      )}`;
      return;
    }

    // B) 非 LIFF ＋尚未登入 → 導到登入頁
    if (!isInClient && !user) {
      router.replace("/auth");
    }
  }, [liffReady, loading, isInClient, user, router]);

  /**************************************************
   * 初始化讀 user（server-side session）
   **************************************************/
  useEffect(() => {
    loadUser();
  }, []);

  // --------------------------------------------------
  // 1️⃣ 抓文化部活動列表
  // --------------------------------------------------
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await getOrgData();
        setOrgData(response as OrgData[]);
      } catch (error) {
        console.error("Failed to fetch org data:", error);
      }
    };

    fetchOrgData();
  }, []);

  // --------------------------------------------------
  // 2️⃣ 重新抓收藏（登入後）
  // --------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;
    reloadFavorites(user.id);
  }, [user?.id, reloadFavorites]);

  // --------------------------------------------------
  // 3️⃣ 過濾收藏活動
  // --------------------------------------------------
  useEffect(() => {
    if (!orgData.length) return;

    if (!favorites || favorites.length === 0) {
      setEventList([]);
      setLoadingEvents(false);
      return;
    }

    const matched = orgData.filter((ev) =>
      favorites.includes(String(ev.actId))
    );

    setEventList(matched);
    setLoadingEvents(false);
  }, [orgData, favorites]);

  // --------------------------------------------------
  // 4️⃣ Loading / Redirect 中狀態
  // --------------------------------------------------
  if (loading || !liffReady) return <LoadingIndicator />;
  if (!user) return null; // redirect 中，不顯示「請先登入」

  // --------------------------------------------------
  // 5️⃣ 正常顯示收藏
  // --------------------------------------------------
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2} className="mb-6">
        我的收藏
      </Title>

      {loadingEvents && <Text type="secondary">Loading events…</Text>}

      {!loadingEvents && eventList.length === 0 && (
        <Empty description="沒有收藏項目" />
      )}

      <Row gutter={[24, 24]}>
        {eventList.map((item) => (
          <Col xs={24} md={12} lg={8} key={item.actId}>
            <Card
              hoverable
              cover={
                <div className="relative">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={`https://cloud.culture.tw/${item.imageUrl}`}
                    alt={item.actName}
                    className="h-52 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <FavoriteButton eventId={String(item.actId)} />
                  </div>
                </div>
              }
            >
              <Title level={5}>{item.actName}</Title>

              <Text type="secondary" className="block mb-1">
                {item.startTime.split(",")[0]} - {item.endTime.split(",")[0]}
              </Text>

              <Text className="block text-sm mb-2">{item.address}</Text>

              <Paragraph ellipsis={{ rows: 3 }}>
                {item.description || "（無描述內容）"}
              </Paragraph>

              <a
                href={item.website}
                target="_blank"
                className="text-primaryBlue dark:text-blue-300 text-sm"
              >
                查看活動官網 →
              </a>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

// "use client";

// import { useUser } from "@/hooks/useUser";
// import { useState, useEffect } from "react";
// import type { CarouselItem } from "@/components/Carousel";
// import { getOrgData } from "@/services/orgDataService";
// import FavoriteButton from "@/components/FavoriteButton";
// import { Card, Row, Col, Typography, Empty } from "antd";
// import LoadingIndicator from "@/components/LoadingIndicator";

// export interface OrgData {
//   actId: number;
//   cityName: string;
//   actName: string;
//   startTime: string;
//   endTime: string;
//   address: string;
//   imageUrl: string;
//   description: string;
//   website: string;
// }

// export default function FavoritesPage() {
//   const { Title, Text, Paragraph } = Typography;
//   const { favorites, user, loading, reloadFavorites } = useUser();
//   const [eventList, setEventList] = useState<CarouselItem[]>([]);
//   const [orgData, setOrgData] = useState<OrgData[]>([]);
//   const [loadingEvents, setLoadingEvents] = useState(true);

//   // 1) 抓文化部活動列表
//   useEffect(() => {
//     const fetchOrgData = async () => {
//       try {
//         const response = await getOrgData();
//         // 若 getOrgData 沒有型別，可以這樣註記：
//         // const response = (await getOrgData()) as OrgData[];
//         setOrgData(response as OrgData[]);
//       } catch (error) {
//         console.error("Failed to fetch org data:", error);
//       }
//     };

//     fetchOrgData();
//   }, []);

//   // 2) 過濾收藏活動
//   useEffect(() => {
//     if (orgData.length === 0) return;
//     if (!favorites || favorites.length === 0) {
//       setEventList([]);
//       setLoadingEvents(false);
//       return;
//     }

//     const matched = orgData.filter((ev) =>
//       favorites.includes(String(ev.actId))
//     );

//     setEventList(matched);
//     setLoadingEvents(false);
//   }, [orgData, favorites]);

//   useEffect(() => {
//     if (!user?.id) return;
//     reloadFavorites(user.id);
//   }, [user?.id]);

//   if (loading) return <LoadingIndicator />;
//   if (!user) return <div>請先登入</div>;
//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <Title level={2} className="mb-6">
//         我的收藏
//       </Title>

//       {loadingEvents && <Text type="secondary">Loading events…</Text>}

//       {!loadingEvents && eventList.length === 0 && (
//         <Empty description="沒有收藏項目" />
//       )}

//       <Row gutter={[24, 24]}>
//         {eventList.map((item) => (
//           <Col xs={24} md={12} lg={8} key={item.actId}>
//             <Card
//               hoverable
//               cover={
//                 <div className="relative">
//                   <img
//                     src={`https://cloud.culture.tw/${item.imageUrl}`}
//                     alt={item.actName}
//                     className="h-52 w-full object-cover"
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
