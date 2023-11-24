import { BaseMessage, BaseNote } from "../store";
import { API_MESSAGE, API_NOTE } from "./constant";
import { HttpClient } from "./fetch";

export const createNotes = async (note: BaseNote, messages: BaseMessage[]) => {
  const requestMessages = messages.map((message) => {
    const { role, content, chatSessionId } = message;
    return { role, content, chatSessionId };
  });
  const res = await HttpClient.request({
    method: "POST",
    url: API_NOTE.CREATE,
    data: { messages: requestMessages, note },
  });
  console.log("createNotes:", res);
  return res;
};

export const getNote = async () => {
  const res = await HttpClient.request({
    method: "GET",
    url: API_NOTE.GET,
  });
  console.log("getNote:", res);
  return res;
};
