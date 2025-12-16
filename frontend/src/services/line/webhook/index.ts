import { handleMessageEvent } from "./message";
import { handleFollowEvent } from "./follow";
import { handlePostbackEvent } from "./postback";

export async function handleLineEvents(events: any[] = []) {
  for (const event of events) {
    switch (event.type) {
      case "message":
        await handleMessageEvent(event);
        break;

      case "follow":
        await handleFollowEvent(event);
        break;

      case "postback":
        await handlePostbackEvent(event);
        break;

      default:
        console.log("[LINE] Unhandled event:", event.type);
    }
  }
}
