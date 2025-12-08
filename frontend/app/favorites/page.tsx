"use client";

import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import type { CarouselItem } from "@/components/Carousel";
import { getOrgData } from "@/services/orgDataService";
import FavoriteButton from "@/components/FavoriteButton";
import { Card, Row, Col, Typography, Empty } from "antd";

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
  const { favorites, user, loading } = useUser();
  const [eventList, setEventList] = useState<CarouselItem[]>([]);
  const [orgData, setOrgData] = useState<OrgData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 1) 抓文化部活動列表
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await getOrgData();
        // 若 getOrgData 沒有型別，可以這樣註記：
        // const response = (await getOrgData()) as OrgData[];
        setOrgData(response as OrgData[]);
      } catch (error) {
        console.error("Failed to fetch org data:", error);
      }
    };

    fetchOrgData();
  }, []);

  // 2) 過濾收藏活動
  useEffect(() => {
    if (orgData.length === 0) return;
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

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>請先登入</div>;
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
                className="text-blue-500 dark:text-blue-300 text-sm"
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
