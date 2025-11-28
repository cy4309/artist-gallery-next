"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { getOrgData } from "@/services/orgDataService";
import MapTw from "@/containers/evnets/MapTw";
import Carousel from "@/components/Carousel";
import BaseButton from "@/components/BaseButton";

// ---- 型別定義 ----

export interface OrgData {
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
    // setClickedId(null);
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

// return (
//   <>
//     {/* {orgData.map((event) => (
//       <section key={event.UID + event.category}>
//         <span>title: {event.title}</span>
//       </section>
//     ))} */}
//     <main className="container px-4 px-lg-5">
//       {/* <!-- Heading Row--> */}
//       <div className="row gx-4 gx-lg-5 align-items-center my-5">
//         <div className="col-lg-7">
//           <img
//             className="img-fluid rounded mb-4 mb-lg-0"
//             src="https://dummyimage.com/900x400/dee2e6/6c757d.jpg"
//             alt="..."
//           />
//         </div>
//         <div className="col-lg-5">
//           <h1 className="font-weight-light">Hightlights of the week</h1>
//           {/* <!-- sourceWebName
//         title
//         startDate
//         endDate --> */}
//           {/* <!-- <p v-for="data in data" :key="data.length">title: {{ data.title }}</p> --> */}
//           {/* <!-- <p>
//           This is a template that is great for small businesses. It doesn't
//           have too much fancy flare to it, but it makes a great use of the
//           standard Bootstrap core components. Feel free to use this template
//           for any project you want!
//         </p> --> */}
//           <a className="btn btn-primary moreInfoBtn" href="#!">
//             More Info
//           </a>
//         </div>
//       </div>

//       {/* <!-- Call to Action--> */}
//       <div className="card text-white bg-secondary my-5 py-4 text-center">
//         <div className="card-body">
//           <p className="text-white m-0">
//             This call to action card is a great place to showcase some
//             important information or display a clever tagline!
//           </p>
//         </div>
//       </div>

//       {/* <!-- Content Row--> */}
//       <div className="row gx-4 gx-lg-5">
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               {/* <!-- <h2 className="card-title" v-for="data in data" :key="data.length"> --> */}
//               <h2 className="card-title">
//                 Card One
//                 {/* <!-- {{ data.sourceWebName }} --> */}
//               </h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem
//                 magni quas ex numquam, maxime minus quam molestias corporis
//                 quod, ea minima accusamus.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               <h2 className="card-title">Card Two</h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod
//                 tenetur ex natus at dolorem enim! Nesciunt pariatur voluptatem
//                 sunt quam eaque, vel, non in id dolore voluptates quos
//                 eligendi labore.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               <h2 className="card-title">Card Three</h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem
//                 magni quas ex numquam, maxime minus quam molestias corporis
//                 quod, ea minima accusamus.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               <h2 className="card-title">Card Three</h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem
//                 magni quas ex numquam, maxime minus quam molestias corporis
//                 quod, ea minima accusamus.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               <h2 className="card-title">Card Three</h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem
//                 magni quas ex numquam, maxime minus quam molestias corporis
//                 quod, ea minima accusamus.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4 mb-5">
//           <div className="card h-100">
//             <div className="card-body">
//               <h2 className="card-title">Card Three</h2>
//               <p className="card-text">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem
//                 magni quas ex numquam, maxime minus quam molestias corporis
//                 quod, ea minima accusamus.
//               </p>
//             </div>
//             <div className="card-footer">
//               <a className="btn btn-primary btn-sm moreInfoBtn" href="#!">
//                 More Info
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   </>
// );
