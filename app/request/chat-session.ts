import { ChatConfig } from "../store";
import { Mask } from "../store/mask";
import { API_CHAT_SESSION, BASE_URL } from "./constant";

export const createChatSession = async (mask?: Mask) => {
  const param = { maskId: mask?.id };
  const res = await fetch(BASE_URL + API_CHAT_SESSION.CREATE, {
    body: JSON.stringify(param),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  console.log("createChatSession:", res);
  return res;
};

export const updateChatSession = async (config: ChatConfig) => {
  const res = await fetch(BASE_URL + API_CHAT_SESSION.UPDATE, {
    body: JSON.stringify(config),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  console.log("updateChatSession:", res);
  return res;
};

export const getChatSession = async (id: string) => {
  console.log("getChatSession:", id);
  const res = await fetch(BASE_URL + API_CHAT_SESSION.GET, {
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const config = await res.json();
  console.log("getedChatSession:", config);
  return config;
};
