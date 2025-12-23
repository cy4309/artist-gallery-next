import { FavoriteExtraPayload } from "./shared";

export interface ToggleFavoriteServerPayload extends FavoriteExtraPayload {
  eventId: string;
}
