// export const BASE_URL = "http://localhost:3100";
// export const BASE_URL = "http://10.7.94.182:3100";
export const BASE_URL = "https://api.nanshan518.com";

export const API_USER = {
  LOGIN: "/user/login",
  DETAIL: "/user/detail",
  UPDATE: "/user/update",
};

export const API_MASK = {
  CREATE: "/mask/create",
  UPDATE: "/mask/update",
  GET: "/mask/get",
};

export const API_CHAT_SESSION = {
  CREATE: "/session/chat/create",
  UPDATE: "/session/chat/update",
  GET: "/session/chat/get",
};

export const API_MESSAGE = {
  CREATE: "/message/create",
  GET: "/message/get",
  UPDATE: "/message/update",
  DELETE: "/message/delete",
};

export const API_NOTE = {
  CREATE: "/note/create",
  DELETE: "/note/delete",
  UPDATE: "/note/update",
  GET: "/note/get",
  GET_DETAIL: "/note/get/detail",
};

export const EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;
