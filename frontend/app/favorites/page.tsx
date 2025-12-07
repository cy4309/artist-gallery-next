"use client";

import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import type { CarouselItem } from "@/components/Carousel";

export default function FavoritesPage() {
  const { favorites, user, loading } = useUser();
  const [eventList, setEventList] = useState<CarouselItem[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const results = [];

      for (const eventId of favorites) {
        const res = await fetch(`/api/event/${eventId}`);
        const json = await res.json();
        if (json.event) results.push(json.event);
      }

      setEventList(results);
    }

    if (favorites.length > 0) fetchEvents();
  }, [favorites]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>請先登入</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">我的收藏</h1>

      {eventList.length === 0 && (
        <div className="text-gray-500 text-sm">沒有收藏項目</div>
      )}

      {eventList.map((item) => (
        <div key={item.actId} className="mb-4 p-4 bg-white shadow rounded">
          <h2 className="font-bold">{item.actName}</h2>
          <p>
            {item.startTime} - {item.endTime}
          </p>
        </div>
      ))}
    </div>
  );
}
