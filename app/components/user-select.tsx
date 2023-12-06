import { useEffect, useState } from "react";
import { List, ListItem, Modal, showToast } from "./ui-lib";
import { IMember, IUser } from "../store/user";
import { searchUser } from "../request/user";
import { useDebouncedCallback } from "use-debounce";
import { IconButton } from "./button";
import {
  addGroupMember,
  createGroup,
  destoryGroup,
  getGroupMembers,
  leaveGroup,
  updateGroupMember,
} from "../request/group";
import CancelIcon from "../icons/cancel.svg";
import styles from "./user-select.module.scss";
import { createRoot } from "react-dom/client";
import { Group } from "../store/group";

export type SearchUserProps = {
  user: IUser;
  group?: Group;
  onCreated?: () => void;
};

const _SearchUser = ({
  group,
  onChange,
}: {
  group?: Group;
  onChange: (data: IMember[]) => void;
}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectUsers, setSelectUsers] = useState<IMember[]>([]);
  const [newUsers, setNewUsers] = useState<string[]>([]);
  const debounceSearch = useDebouncedCallback((key: string) => {
    if (!key) {
      setUsers([]);
      return;
    }
    searchUser(key).then((data) => {
      setUsers(data);
    });
  }, 500);

  useEffect(() => {
    if (group?.id) {
      getGroupMembers(group.id).then((data) => setSelectUsers(data));
    }
  }, [group?.id]);

  const updateUser = (data: IMember[]) => {
    onChange(data);
    setSelectUsers(data);
  };
  return (
    <div className={styles["user-select"]}>
      <input
        className={styles["search-input"]}
        placeholder="搜索（用户名、用户昵称）"
        onChange={(e) => {
          debounceSearch(e.target.value);
        }}
      />
      <div className={styles["user-selected"]}>
        {selectUsers.map((member) => {
          const hasAuth =
            (group?.auth ?? -1) > 0 || newUsers.indexOf(member.id) > -1;
          return (member.flag ?? -1) >= 0 ? (
            <div
              key={member.id}
              onClick={() => {
                if ((member.flag ?? -1) > 0 || !hasAuth) return;
                updateUser(
                  selectUsers.map((sel) =>
                    sel.id === member.id ? { ...sel, flag: -1 } : sel,
                  ),
                );
              }}
              className={styles["user-selected-item"]}
            >
              <span>{member.nickname || member.name}</span>
              {(member.flag ?? -1) < 1 && hasAuth && (
                <div className={styles["close"]}>x</div>
              )}
            </div>
          ) : null;
        })}
      </div>
      <div className="user-list">
        <List>
          {users.map((user) => {
            const member = selectUsers.find((sel) => sel.id === user.id);
            const selected = (member?.flag ?? -1) > -1;
            const hasAuth =
              (group?.auth ?? -1) > 0 || newUsers.indexOf(user.id) > -1;
            return (
              <ListItem
                className={`${styles["user-item"]} ${
                  selected ? styles["user-selected"] : ""
                }`}
                title={user.nickname || user.name}
                key={user.id}
                onClick={() => {
                  if (selected && !hasAuth) return;
                  updateUser(
                    member
                      ? selectUsers.map((sel) =>
                          sel.id === user.id
                            ? { ...sel, flag: selected ? -1 : 0 }
                            : sel,
                        )
                      : selectUsers.concat([{ ...user, flag: 0 }]),
                  );
                  !member && setNewUsers(newUsers.concat([user.id]));
                }}
              >
                {selected ? (
                  <div
                    style={{
                      height: 10,
                      width: 10,
                      backgroundColor: "var(--primary)",
                      borderRadius: 10,
                    }}
                  ></div>
                ) : (
                  <></>
                )}
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
};

export const showUserSelect = ({ user, group, onCreated }: SearchUserProps) => {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };
  let userData: IMember[] = [];
  const onCreateGroup = () => {
    if (userData?.length > 0) {
      createGroup(
        userData
          .filter((user) => (user.flag ?? -1) > -1)
          .map((user) => user.id),
      ).then(() => {
        onCreated?.();
        closeModal();
      });
    } else {
      showToast("请选择一个用户");
    }
  };

  const onSaveGroup = () => {
    (group?.auth ?? 0) > 0
      ? updateGroupMember(group?.id ?? "", userData).then(() => closeModal())
      : addGroupMember(
          group?.id ?? "",
          userData
            .filter((user) => (user.flag ?? -1) >= 0)
            .map((user) => user.id),
        ).then(() => closeModal());
  };

  const quitOrCloseGroup = () => {
    if (!group?.id) {
      closeModal();
      return;
    }
    (group?.auth ?? 0) > 0
      ? destoryGroup(group.id).then(() => {
          onCreated?.();
          closeModal();
        })
      : leaveGroup(group.id).then(() => {
          onCreated?.();
          closeModal();
        });
  };

  root.render(
    <Modal
      title={group?.name || "新建群组"}
      actions={
        !group
          ? [
              <IconButton
                key="cancel"
                text={"取消"}
                onClick={() => {
                  closeModal();
                }}
                icon={<CancelIcon />}
                bordered
                shadow
                tabIndex={0}
              ></IconButton>,
              <IconButton
                key="create"
                type={"primary"}
                text="创建群组"
                onClick={() => onCreateGroup()}
              />,
            ]
          : [
              <IconButton
                key="leave"
                text={(group?.auth ?? 0) > 0 ? "解散群组" : "退出群组"}
                onClick={quitOrCloseGroup}
                icon={<CancelIcon />}
                bordered
                shadow
                tabIndex={0}
              ></IconButton>,
              <IconButton
                key="cancel"
                text={"取消"}
                onClick={() => {
                  closeModal();
                }}
                icon={<CancelIcon />}
                bordered
                shadow
                tabIndex={0}
              ></IconButton>,
              <IconButton
                key="save"
                type={"primary"}
                text="保存群组"
                onClick={() => onSaveGroup()}
              />,
            ]
      }
      onClose={closeModal}
    >
      <_SearchUser
        group={group}
        onChange={(data) => {
          console.log("useMemo:", data);
          userData = data.concat();
        }}
      />
    </Modal>,
  );
};
