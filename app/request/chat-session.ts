import Cookies from "js-cookie";
import { ChatConfig } from "../store";
import { Mask } from "../store/mask";
import { API_CHAT_SESSION, BASE_URL } from "./constant";
import { HttpClient } from "./fetch";
import { useAsyncLoading } from "./use-async-loading";

export const createChatSession = async (mask?: Mask) => {
  const res = await HttpClient.request({
    method: "POST",
    url: API_CHAT_SESSION.CREATE,
    data: { maskId: mask?.id },
  });
  console.log("createChatSession:", res);
  return res;
};

export const updateChatSession = async (config: ChatConfig) => {
  const res = await HttpClient.request({
    method: "POST",
    url: API_CHAT_SESSION.UPDATE,
    data: config,
  });
  console.log("updateChatSession:", res);
  return res;
};

// export const useUpdateChatSession = () => {
//   const [updateChatSession, loading] = useAsyncLoading((config: ChatConfig) =>
//     HttpClient.request({
//       method: "POST",
//       url: API_CHAT_SESSION.UPDATE,
//       data: config,
//     }),
//   );

//   return {
//     updateChatSession,
//     loading,
//   };
// };

export const getChatSession = async (id: string) => {
  const res = (await HttpClient.post(API_CHAT_SESSION.GET, { id })) as {
    mask: Mask;
    noteMask: Mask;
    name: string;
    type: number;
  };
  const { mask, noteMask, name, type } = res;
  return { mask, noteMask, name, type };
};
