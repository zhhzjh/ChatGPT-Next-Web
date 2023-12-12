import { BaseMessage, ChatMessage } from "../store";
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
  return res;
};

export const updateMessage = async (message: ChatMessage) => {
  const res = await HttpClient.post(API_MESSAGE.UPDATE, { message });
  return res;
};

export const deleteMessage = async (id: string) => {
  const res = await HttpClient.post(API_MESSAGE.DELETE, { id });
  return res;
};
