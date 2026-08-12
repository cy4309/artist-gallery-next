export type PushPlatform = "ios" | "android";

export type RegisterPushTokenPayload = {
  userId?: string;
  expoPushToken: string;
  platform: PushPlatform;
};
