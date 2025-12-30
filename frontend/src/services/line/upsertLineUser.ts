import axios from "axios";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { UserInitPayload } from "@/types/user";

const GAS_URL = process.env.GAS_URL!;

/**
 * LINE User Upsert
 * - follow / login 都只能走這條
 */
export async function upsertLineUser(user: UserInitPayload) {
  // 1️⃣ 檢查是否存在
  const checkRes = await axios.post(GAS_URL, {
    action: GAS_ACTION.CHECK_LINE_USER,
    userId: user.id,
  });

  // 2️⃣ 不存在 → 建立
  if (!checkRes.data?.exists) {
    const createRes = await axios.post(GAS_URL, {
      action: GAS_ACTION.CREATE_LINE_USER,
      user,
    });

    return createRes.data?.user ?? user;
  }

  // 3️⃣ 已存在 → 更新（補資料）
  const updateRes = await axios.post(GAS_URL, {
    action: GAS_ACTION.UPDATE_LINE_USER,
    user,
  });

  return updateRes.data?.user ?? user;
}
