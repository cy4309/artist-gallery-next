import { FavoriteExtraPayload } from "./shared";

export type ToggleFavoriteClientPayload = {
  eventId: string;
} & FavoriteExtraPayload;

export type ToggleFavoriteClientResponse = {
  success: boolean;
  isFavorite?: boolean;
};
