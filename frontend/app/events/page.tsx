"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { getOrgData } from "@/services/orgDataService";
import MapTw from "@/containers/evnets/MapTw";
import Carousel from "@/components/Carousel";
import BaseButton from "@/components/BaseButton";

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

export default function EventsPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<OrgData[]>([]);
  const [isMapClicked, setIsMapClicked] = useState(false);

  // 依照 orgData + clickedId 動態算出當前城市對應活動
  const nowData = useMemo(() => {
    if (!clickedId) return [];
    return orgData.filter((data) => data.cityName.includes(clickedId));
  }, [clickedId, orgData]);

  // ---- 取得活動資料 ----
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

  // ---- Map 互動 ----
  const handleMapHover = (id: string | null) => {
    setHoveredId(id);
  };

  const handleMapClick = (id: string) => {
    // 只在這裡更新 clickedId，避免在同一個 callback 裡連續 setState 太多次
    setClickedId(id);
  };

  // 當 clickedId 更新時，延遲 500ms 再打開下方 Carousel 區塊（對應你原本的 setTimeout）
  useEffect(() => {
    if (!clickedId) return;

    const timer = setTimeout(() => {
      setIsMapClicked(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [clickedId]);

  const handleCloseList = () => {
    setIsMapClicked(false);
    // 如果你希望關閉時清掉 clickedId，可以一起做：
    setClickedId(null);
  };

  return (
    <>
      <div className="container flex justify-center items-center mx-auto">
        {/* 地圖初始畫面 */}
        {!isMapClicked && (
          <div className="fixed inset-0 flex flex-col justify-center items-center">
            {hoveredId && (
              <BaseButton className="my-4">
                <h5 className="text-center text-xl font-bold">
                  - {hoveredId} -
                </h5>
              </BaseButton>
            )}

            <section className="mt-4 scale-125">
              <MapTw onHover={handleMapHover} onClick={handleMapClick} />
            </section>
          </div>
        )}

        {/* 點城市後的活動列表 / 輪播 */}
        {isMapClicked &&
          (nowData.length > 0 ? (
            <div className="flex flex-col justify-center items-center">
              <div className="m-4 w-full flex justify-center items-center">
                <BaseButton onClick={handleCloseList}>
                  <CloseCircleOutlined />
                  <h5 className="mx-4 text-center text-xl font-bold">
                    - {clickedId} -
                  </h5>
                </BaseButton>
              </div>

              <Carousel
                key={clickedId} // ⭐ 城市一變 → Carousel 整個 remount
                autoplay={false}
                autoplayDelay={3000}
                baseWidth={300}
                items={nowData}
                loop={true}
                pauseOnHover={true}
                round={false}
              />
            </div>
          ) : (
            <div className="m-4 w-full flex flex-col justify-center items-center">
              <BaseButton onClick={handleCloseList}>
                <CloseCircleOutlined />
                <h5 className="mx-4 text-center text-xl font-bold">
                  - {clickedId} -
                </h5>
              </BaseButton>
              <p className="my-4 text-center">
                No events found for the selected city.
              </p>
            </div>
          ))}
      </div>
      {/* <div className="container mt-4">
        {now_data.length > 0 ? (
          now_data.map((data) => (
            <Card key={data.actId} hoverable className="mb-4">
              <Meta title={data.actName} description={data.description} />
              <p>{data.address}</p>
              <p>{data.endTime}</p>
            </Card>
          ))
        ) : (
          <p className="text-center">No events found for the selected city.</p>
        )}
      </div> */}
    </>
  );
}
