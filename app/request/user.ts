import { showToast } from "../components/ui-lib";
import { API_USER, BASE_URL } from "./constant";

export const login = async (user: { username: string; password: string }) => {
  const result = await fetch(BASE_URL + API_USER.LOGIN, {
    body: JSON.stringify({ ...user }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (result.status === 200) {
    const user = await result.json();
    return user;
  } else {
    showToast(result.statusText || "login error");
    return null;
  }
};
