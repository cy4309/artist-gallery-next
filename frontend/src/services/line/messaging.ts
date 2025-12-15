type PushTextMessageParams = {
  lineUserId: string;
  text: string;
};

export async function pushLineTextMessage({
  lineUserId,
  text,
}: PushTextMessageParams) {
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
          type: "text",
          text,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[LINE Messaging] push error:", errorText);
    throw new Error("LINE push message failed");
  }
}
