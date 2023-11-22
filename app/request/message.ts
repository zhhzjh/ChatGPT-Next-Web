import { BaseMessage } from "../store";
import { API_MESSAGE } from "./constant";
import { HttpClient } from "./fetch";

export const createMessages = async (messages: BaseMessage[]) => {
  const requestMessages = messages.map((message) => {
    const { role, content, chatSessionId } = message;
    return { role, content, chatSessionId };
  });
  const res = await HttpClient.request({
    method: "POST",
    url: API_MESSAGE.CREATE,
    data: requestMessages,
  });
  console.log("createMessages:", res);
  return res;
};

export const getMessages = async (sessionId: string) => {
  const res = await HttpClient.request({
    method: "GET",
    url: API_MESSAGE.GET,
    params: {
      sessionId,
    },
  });
  console.log("getMessages:", res);
  return res;
};
