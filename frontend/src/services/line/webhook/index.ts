// event router

import { handleMessageEvent } from "./message";
import { handleFollowEvent } from "./follow";
import { handlePostbackEvent } from "./postback";

export async function handleLineEvents(events: any[] = []) {
  for (const event of events) {
    try {
      switch (event.type) {
        case "message": // reply
          await handleMessageEvent(event);
          break;

        case "follow": // push
          await handleFollowEvent(event);
          break;

        case "postback": // reply
          await handlePostbackEvent(event);
          break;

        default:
          console.log("[LINE] Unhandled event:", event.type);
      }
    } catch (err) {
      console.error("[LINE event error]", event.type, err);
    }
  }
}
