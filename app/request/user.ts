import { showToast } from "../components/ui-lib";
import Cookies from "js-cookie";
import { API_USER, BASE_URL, EXPIRE_TIME } from "./constant";
import { HttpClient } from "./fetch";
import { IUser } from "../store/user";

/**
 * 登录接口
 * @param user { name: string; password: string }
 * @returns
 */
export const login = async (user: { name: string; password: string }) => {
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
};

/**
 * 获取用户信息
 * @param user { name: string; password: string }
 * @returns
 */
export const getUserDetail = async (): Promise<IUser> => {
  const result = (await HttpClient.get(API_USER.DETAIL)) as any;
  return result as IUser;
};

/**
 * 更新用户信息
 * @param user { name: string; password: string }
 * @returns
 */
export const updateUserDetail = async (user: IUser): Promise<IUser> => {
  const result = (await HttpClient.patch(API_USER.UPDATE, user)) as any;
  return result as IUser;
};
