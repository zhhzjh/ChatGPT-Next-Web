// export const BASE_URL = "http://localhost:3100";
// export const BASE_URL = process.env.SERVER_API_URL || "https://api.nanshan518.com";
export const BASE_URL = "https://api.nanshan518.com";

export const API_USER = {
  LOGIN: "/user/login",
  DETAIL: "/user/detail",
  UPDATE: "/user/update",
  SEARCH: "/user/search",
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
  GET_GROUPS: "note/groups",
};

export const API_GROUP = {
  CREATE: "/group/create", // 新建group
  GET: "/group/get", // 读取用户group
  GET_MEMBERS: "/group/members", // 读取group成员
  GET_NOTES: "/group/notes", // 读取group笔记
  ADD_MEMBERS: "/group/add/members", // 添加成员至group
  UPDATE_MEMBERS: "/group/update/members", // 更新members与group关系
  LEAVE: "/group/leave", // 退出群组
  DESTORY: "/group/destory", // 解散群组
  ADD_NOTE: "/group/add/note", // 添加笔记至group
  UPDATE_NOTES: "/group/update/notes", //更新笔记与group关系
};

export const EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;
