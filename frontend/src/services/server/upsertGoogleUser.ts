import axios from "axios";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { UserInitPayload } from "@/types/user";

const GAS_URL = process.env.GAS_URL!;

export async function upsertGoogleUser(user: UserInitPayload) {
  const checkRes = await axios.post(GAS_URL, {
    action: GAS_ACTION.CHECK_GOOGLE_USER,
    email: user.email,
  });

  if (!checkRes.data?.exists) {
    const createRes = await axios.post(GAS_URL, {
      action: GAS_ACTION.CREATE_GOOGLE_USER,
      user,
    });
    const created = createRes.data?.user ?? user;
    return {
      ...created,
      picture: created.picture || user.picture,
    };
  }

  const updateRes = await axios.post(GAS_URL, {
    action: GAS_ACTION.UPDATE_GOOGLE_USER,
    user,
  });

  const updated = updateRes.data?.user ?? user;
  return {
    ...updated,
    picture: updated.picture || user.picture,
  };
}
