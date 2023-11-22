import axios, {
  Axios,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosHeaders,
} from "axios";
import { Path } from "../constant";
import { BASE_URL } from "./constant";
import Router from "next/router";
import { showToast } from "../components/ui-lib";
import Cookies from "js-cookie";

type WithCookieAxiosRequestConfig = AxiosRequestConfig & {
  cookie?: string;
  headers?: AxiosRequestHeaders;
};

interface AxiosInstance extends Axios {
  request<T>(config: WithCookieAxiosRequestConfig): Promise<T>;
}

const isBrowser = typeof window !== "undefined";

export const HttpClient = axios.create({
  baseURL: BASE_URL,
  timeout:
    process.env.NODE_ENV === "production" ? 10 * 60 * 1000 : 10 * 60 * 1000,
  withCredentials: true,
}) as AxiosInstance;

HttpClient.interceptors.request.use((config: WithCookieAxiosRequestConfig) => {
  let { headers } = config;
  if (!headers) {
    headers = new AxiosHeaders({
      "Content-Type": "application/json",
    });
  }
  console.log("config:", config.cookie, Cookies.get("token"));
  const token = Cookies.get("token");
  // if (token) {
  //   if (typeof window === "undefined" && !config.headers?.cookie) {
  //     headers;
  //   }
  // }

  return { ...config, headers };
});

HttpClient.interceptors.response.use(
  (data) => {
    console.log("onResponse:", data);
    if (+data.status !== 200 || data.data.status === "error") {
      return null;
    }
    return data.data;
  },
  async (err) => {
    if (err && err.response && err.response.status) {
      const status = err.response.status;

      const noToastMsgs = [
        "User login when not registered.",
        "This email has already been registered.",
      ];
      switch (status) {
        case 504:
        case 404:
          isBrowser &&
            console.log(
              err.response && err.response.data && err.response.data.message,
            );
          break;
        case 401:
          showToast("need login");
          if (isBrowser) {
            console.log("catch 401");
            // Router.push(Path.Login);
          }
          break;
        case 429:
        case 400:
        default:
          console.log("errer:", status);
          break;
      }
      return Promise.reject({
        statusCode: err.response.status,
        message: err.response.data.message,
      });
    }

    return Promise.reject(err);
  },
);
