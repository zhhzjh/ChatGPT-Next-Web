import { showToast } from "../components/ui-lib";
import Cookies from "js-cookie";
import { API_USER, BASE_URL, EXPIRE_TIME } from "./constant";
import { HttpClient } from "./fetch";
export const login = async (user: { email: string; password: string }) => {
  const result = (await HttpClient.request({
    method: "POST",
    url: API_USER.LOGIN,
    data: user,
  })) as any;
  if (result?.token) {
    Cookies.set("token", result?.token, {
      expires: new Date(new Date().getTime() + EXPIRE_TIME),
    });
  }
  return result;
  // if (result.status === 200) {
  //   const user = await result.json();
  //   return user;
  // } else {
  //   showToast(result.statusText || "login error");
  //   return null;
  // }
};
