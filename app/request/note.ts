import { BaseMessage, BaseNote, Note } from "../store";
import { Group } from "../store/group";
import { API_NOTE } from "./constant";
import { HttpClient } from "./fetch";

export const createNotes = async (
  note: BaseNote,
  messages: BaseMessage[],
  groupId?: string,
) => {
  const requestMessages = messages.map((message) => {
    const { role, content, chatSessionId } = message;
    return { role, content, chatSessionId };
  });
  const res = await HttpClient.request({
    method: "POST",
    url: API_NOTE.CREATE,
    data: { messages: requestMessages, note, groupId },
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

export const getNoteDetail = async (id: string): Promise<Note> => {
  const res = await HttpClient.get(`${API_NOTE.GET_DETAIL}?id=${id}`);
  console.log("getNoteDetail:", res);
  return res as unknown as Note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const res = await HttpClient.post(API_NOTE.DELETE, { id });
  console.log("deleted:", id, res);
  return res as unknown as Note;
};

export const updateNote = async (note: Note): Promise<Note> => {
  const res = await HttpClient.post(API_NOTE.UPDATE, { note });
  return res as unknown as Note;
};

export const getNoteGroups = async (id: string): Promise<Group[]> => {
  const res = await HttpClient.get(`${API_NOTE.GET_GROUPS}?id=${id}`);
  return res as unknown as Group[];
};
