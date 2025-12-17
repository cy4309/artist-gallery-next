//* 第三方服務（server only）

type FavoriteFlexParams = {
  title: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  lineUserId: string;
  imageUrl?: string;
};

export async function pushFavoriteFlexMessage({
  title,
  eventStartDate,
  eventEndDate,
  eventLocation,
  eventUrl,
  lineUserId,
  imageUrl,
}: FavoriteFlexParams) {
  // ⭐ 組合日期顯示文字
  const dateText =
    eventStartDate && eventEndDate
      ? `${eventStartDate} - ${eventEndDate}`
      : eventStartDate
      ? eventStartDate
      : undefined;

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [
        {
          type: "flex",
          altText: `已加入收藏：${title}`,
          contents: {
            type: "bubble",
            hero: imageUrl
              ? {
                  type: "image",
                  url: imageUrl,
                  size: "full",
                  aspectRatio: "20:13",
                  aspectMode: "cover",
                }
              : undefined,
            body: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: title,
                  wrap: true,
                  weight: "bold",
                  size: "md",
                },
                ...(dateText
                  ? [
                      {
                        type: "text",
                        text: `🗓 ${dateText}`,
                        size: "sm",
                        color: "#666666",
                        wrap: true,
                      },
                    ]
                  : []),
                ...(eventLocation
                  ? [
                      {
                        type: "text",
                        text: `📍 ${eventLocation}`,
                        size: "sm",
                        color: "#666666",
                        wrap: true,
                      },
                    ]
                  : []),
              ],
            },
            footer: eventUrl
              ? {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "button",
                      style: "primary",
                      action: {
                        type: "uri",
                        label: "查看活動",
                        uri: eventUrl,
                      },
                    },
                  ],
                }
              : undefined,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[LINE Flex] push error:", err);
    throw new Error("Failed to push LINE Flex message");
  }
}

export async function replyTextMessage(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}
