import axios from "axios";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

export async function getLineProfileLiff(lineUserId: string) {
  const res = await axios.get(
    `https://api.line.me/v2/bot/profile/${lineUserId}`,
    {
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );

  return res.data as {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  };
}
