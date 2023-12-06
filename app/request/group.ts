import { Note } from "../store";
import { Group } from "../store/group";
import { IMember } from "../store/user";
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

/**
 * 获取群组全部成员
 * @param groupId string
 * @returns
 */
export const getGroupMembers = async (groupId: string) => {
  const res = await HttpClient.get(
    `${API_GROUP.GET_MEMBERS}?groupId=${groupId}`,
  );
  return res as unknown as IMember[];
};

/**
 * 更新群组成员关系
 * @param groupId
 * @param members
 * @returns
 */
export const updateGroupMember = async (
  groupId: string,
  members: IMember[],
) => {
  const res = await HttpClient.post(API_GROUP.UPDATE_MEMBERS, {
    groupId,
    relations: members.map((member) => {
      return { userId: member.id, flag: member.flag ?? -1 };
    }),
  });
  return res;
};

/**
 * 新增群组成员
 * @param groupId
 * @param members
 * @returns
 */
export const addGroupMember = async (groupId: string, userIds: string[]) => {
  const res = await HttpClient.post(API_GROUP.ADD_MEMBERS, {
    groupId,
    userIds: userIds.join(","),
  });
  return res;
};

/**
 * 退出群组
 * @param groupId
 * @param members
 * @returns
 */
export const leaveGroup = async (groupId: string) => {
  if (!groupId) return;
  const res = await HttpClient.post(API_GROUP.LEAVE, {
    groupId,
  });
  return res;
};

/**
 * 解散群组
 * @param groupId
 * @param members
 * @returns
 */
export const destoryGroup = async (groupId: string) => {
  if (!groupId) return;
  const res = await HttpClient.post(API_GROUP.DESTORY, {
    groupId,
  });
  return res;
};
