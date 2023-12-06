import { useCallback, useEffect, useMemo, useState } from "react";
import { List, ListItem, Modal, showModal, showToast } from "./ui-lib";
import { IUser } from "../store/user";
import { searchUser } from "../request/user";
import { useDebouncedCallback } from "use-debounce";
import { IconButton } from "./button";
import { createGroup } from "../request/group";
import CancelIcon from "../icons/cancel.svg";
import styles from "./user-select.module.scss";
import { createRoot } from "react-dom/client";

export type SearchUserProps = {
  title: string;
  onCreated?: () => void;
};

const _SearchUser = ({ onChange }: { onChange: (data: IUser[]) => void }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectUsers, setSelectUsers] = useState<IUser[]>([]);
  const debounceSearch = useDebouncedCallback((key: string) => {
    if (!key) {
      setUsers([]);
      return;
    }
    searchUser(key).then((data) => {
      setUsers(data);
    });
  }, 500);

  const updateUser = (data: IUser[]) => {
    console.log("onChange:", selectUsers);
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
        {selectUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => {
              updateUser(selectUsers.filter((sel) => sel.id !== user.id));
            }}
            className={styles["user-selected-item"]}
          >
            <span>{user.nickname || user.name}</span>
            <div className={styles["close"]}>x</div>
          </div>
        ))}
      </div>
      <div className="user-list">
        <List>
          {users.map((user) => {
            const selected =
              selectUsers.findIndex((sel) => sel.id === user.id) > -1;
            return (
              <ListItem
                className={`${styles["user-item"]} ${
                  selected ? styles["user-selected"] : ""
                }`}
                title={user.nickname || user.name}
                key={user.id}
                onClick={() => {
                  updateUser(
                    selected
                      ? selectUsers.filter((sel) => sel.id !== user.id)
                      : selectUsers.concat([user]),
                  );
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

/* export const SelectUserModal = ({
  title,
  changeVisible = () => void 0,
  onCreated,
  open = false,
}: SearchUserProps) => {
  const [show, setShow] = useState(open);
  const [selectUsers, setSelectUsers] = useState<IUser[]>([]);

  const onClose = useCallback(() => {
    changeVisible?.(false);
    setShow(false);
  }, [changeVisible]);

  const onCreateGroup = useCallback(() => {
    console.log("onCreateGroup:", selectUsers);
    if (selectUsers?.length > 0) {
      createGroup(selectUsers.map((user) => user.id)).then(() => onCreated?.());
    } else {
      showToast("请选择一个用户");
    }
  }, [onCreated, selectUsers]);

  const content = useMemo(
    () => (
      <_SearchUser
        onChange={(data) => {
          console.log("useMemo:", data);
          setSelectUsers(data);
        }}
      />
    ),
    [setSelectUsers],
  );

  useEffect(() => {
    setShow(open);
    open || onClose();
  }, [onClose, open]);

  useEffect(
    () =>
      show
        ? showModal({
            title,
            onClose,
            children: content,
            actions: [
              <IconButton
                key="confirm"
                type={"primary"}
                text="创建群组"
                onClick={() => onCreateGroup()}
              />,
            ],
          })
        : void 0,
    [content, onClose, onCreateGroup, show, title],
  );
  return <></>;
}; */

export const showUserSelect = ({ title, onCreated }: SearchUserProps) => {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };
  let userData: IUser[] = [];
  const onCreateGroup = () => {
    console.log("onCreateGroup:", userData);
    if (userData?.length > 0) {
      createGroup(userData.map((user) => user.id)).then(() => {
        onCreated?.();
        closeModal();
      });
    } else {
      showToast("请选择一个用户");
    }
  };
  root.render(
    <Modal
      title={title}
      actions={[
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
          key="confirm"
          type={"primary"}
          text="创建群组"
          onClick={() => onCreateGroup()}
        />,
      ]}
      onClose={closeModal}
    >
      <_SearchUser
        onChange={(data) => {
          console.log("useMemo:", data);
          userData = data.concat();
        }}
      />
    </Modal>,
  );
};
