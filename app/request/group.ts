import { Note } from "../store";
import { Group } from "../store/group";
import { API_GROUP } from "./constant";
import { HttpClient } from "./fetch";

/**
 * 创建群组
 * @param userIds 加入群组用户id
 * @param name 群组名称
 * @returns
 */
export const createGroup = async (userIds: string[], name?: string) => {
  const res = await HttpClient.post(API_GROUP.CREATE, {
    userIds: userIds.join(","),
    name,
  });
  return res as unknown as Group;
};

/**
 * 获取我的群组列表
 * @returns
 */
export const getMyGroup = async () => {
  const res = await HttpClient.get(API_GROUP.GET);
  return res as unknown as Group[];
};

/**
 * 获取当前群组下所有notes
 * @param groupId string
 * @returns
 */
export const getGroupNotes = async (groupId: string) => {
  const res = await HttpClient.get(`${API_GROUP.GET_NOTES}?groupId=${groupId}`);
  return res as unknown as Note[];
};

/**
 * 更新笔记与群组关系
 * @param params
 * @returns
 */
export const updateNoteToGroups = async (
  params: {
    noteId: string;
    groupId: string;
    flag: number;
  }[],
) => {
  const res = await HttpClient.post(API_GROUP.UPDATE_NOTES, params);
  return res as unknown as Group[];
};
