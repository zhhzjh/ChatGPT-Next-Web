// export const BASE_URL = "http://localhost:3100";
// export const BASE_URL = "http://10.7.95.222:3100";
export const BASE_URL = "https://api.nanshan518.com";

export const API_USER = {
  LOGIN: "/user/login",
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
};

export const API_NOTE = {
  CREATE: "/note/create",
  GET: "/note/get",
  GETDETAIL: "/note/get/detail",
};

export const EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;
