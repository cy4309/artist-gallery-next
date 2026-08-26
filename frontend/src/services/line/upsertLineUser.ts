import { GAS_ACTION } from "@/types/gas/actionConstants";
import { UserInitPayload } from "@/types/user";
import { postToDataBackend } from "@/services/server/dataBackendClient";

/**
 * LINE User Upsert
 * - follow / login 都只能走這條
 */
export async function upsertLineUser(user: UserInitPayload) {
  const checkRes = await postToDataBackend<{
    exists?: boolean;
    user?: UserInitPayload;
  }>({
    action: GAS_ACTION.CHECK_LINE_USER,
    userId: user.id,
  });

  if (!checkRes?.exists) {
    const createRes = await postToDataBackend<{ user?: UserInitPayload }>({
      action: GAS_ACTION.CREATE_LINE_USER,
      user,
    });
    return createRes?.user ?? user;
  }

  const updateRes = await postToDataBackend<{ user?: UserInitPayload }>({
    action: GAS_ACTION.UPDATE_LINE_USER,
    user,
  });

  return updateRes?.user ?? user;
}
