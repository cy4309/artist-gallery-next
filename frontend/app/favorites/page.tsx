"use client";

import { useUser } from "@/hooks/useUser";
import { useLiff } from "@/components/LiffProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CarouselItem } from "@/components/Carousel";
import { getOrgData } from "@/services/client/orgDataClient";
import FavoriteButton from "@/components/FavoriteButton";
import { Card, Row, Col, Typography, Empty } from "antd";
import { OrgEvent } from "@/types/event";

export default function FavoritesPage() {
  const router = useRouter();
  const { Title, Text, Paragraph } = Typography;
  const { user, favorites, loading, reloadFavorites, loadUser } = useUser();
  const { isInClient, ready: liffReady } = useLiff();
  const [eventList, setEventList] = useState<CarouselItem[]>([]);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);

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
        setOrgData(response as OrgEvent[]);
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
      return;
    }

    const matched = orgData.filter((ev) =>
      favorites.includes(String(ev.actId))
    );

    setEventList(matched);
  }, [orgData, favorites]);

  if (!user) return null; // redirect 中，不顯示「請先登入」
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {eventList.length === 0 && <Empty description="沒有收藏項目" />}

      <Row gutter={[24, 24]}>
        {eventList.map((item) => (
          <Col xs={24} md={12} lg={8} key={item.actId}>
            <Card
              hoverable
              cover={
                <div className="relative">
                  <img
                    className="h-52 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    src={`https://cloud.culture.tw/${item.imageUrl}`}
                    alt={item.actName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/placeholder-no-image.png";
                    }}
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
