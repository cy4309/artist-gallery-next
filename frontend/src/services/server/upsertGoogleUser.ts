import { GAS_ACTION } from "@/types/gas/actionConstants";
import { UserInitPayload } from "@/types/user";
import { postToDataBackend } from "@/services/server/dataBackendClient";

export async function upsertGoogleUser(user: UserInitPayload) {
  const checkRes = await postToDataBackend<{
    exists?: boolean;
    user?: UserInitPayload & { picture?: string };
  }>({
    action: GAS_ACTION.CHECK_GOOGLE_USER,
    email: user.email,
  });

  if (!checkRes?.exists) {
    const createRes = await postToDataBackend<{
      user?: UserInitPayload & { picture?: string };
    }>({
      action: GAS_ACTION.CREATE_GOOGLE_USER,
      user,
    });
    const created = createRes?.user ?? user;
    return {
      ...created,
      picture: created.picture || user.picture,
    };
  }

  const updateRes = await postToDataBackend<{
    user?: UserInitPayload & { picture?: string };
  }>({
    action: GAS_ACTION.UPDATE_GOOGLE_USER,
    user,
  });

  const updated = updateRes?.user ?? user;
  return {
    ...updated,
    picture: updated.picture || user.picture,
  };
}
