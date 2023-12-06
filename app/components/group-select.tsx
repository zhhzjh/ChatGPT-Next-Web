import { createRoot } from "react-dom/client";
import { List, ListItem, Modal } from "./ui-lib";
import { IconButton } from "./button";
import CancelIcon from "../icons/cancel.svg";
import ConfirmIcon from "../icons/confirm.svg";
import { updateNoteToGroups, getMyGroup } from "../request/group";
import { getNoteGroups } from "../request/note";
import { useEffect, useState } from "react";
import { Group } from "../store/group";
import styles from "./group-select.module.scss";

type IProps = {
  noteId: string;
  onChange: (data: Group[]) => void;
};
const GroupsSelect = ({ noteId, onChange }: IProps) => {
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [noteGroups, setNoteGroups] = useState<Group[]>([]);
  useEffect(() => {
    getMyGroup().then((data) => {
      setAllGroups(data);
      getNoteGroups(noteId).then((groups) => {
        onChange?.(groups);
        setNoteGroups(groups);
      });
    });
  }, [noteId, onChange]);

  const selectGroup = (selGroup: Group, remove: boolean) => {
    let newGroup = [];
    if (noteGroups?.findIndex((group) => group.id === selGroup.id) > -1) {
      newGroup = noteGroups.map((group) => {
        if (group.id === selGroup.id) {
          return { ...group, flag: remove ? -1 : 0 };
        } else {
          return { ...group };
        }
      });
    } else {
      newGroup = noteGroups.concat([{ ...selGroup, flag: remove ? -1 : 0 }]);
    }
    onChange?.(newGroup);
    setNoteGroups(newGroup);
  };

  return (
    <List>
      {allGroups?.map((group) => {
        const selected =
          noteGroups?.findIndex(
            (sel) =>
              sel.id === group.id && sel.flag !== void 0 && sel.flag > -1,
          ) > -1;
        return (
          <ListItem
            className={`${styles["user-item"]} ${
              selected ? styles["user-selected"] : ""
            }`}
            title={group.name}
            key={group.id}
            onClick={() => {
              selectGroup(group, selected);
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
  );
};

export async function showGroupSelected(noteId: string, content: any) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  // const allGroups = await getMyGroup();
  // let noteGroups = await getNoteGroups(noteId);
  let groupData: Group[] = [];

  const saveData = () => {
    updateNoteToGroups(
      groupData.map((group) => {
        return {
          noteId,
          groupId: group.id,
          flag: group.flag || 0,
        };
      }),
    ).then((data) => {
      closeModal();
    });
  };

  root.render(
    <Modal
      title={content}
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
          text={"确定"}
          type="primary"
          onClick={() => {
            saveData();
            console.log("confirm:", groupData);
          }}
          icon={<ConfirmIcon />}
          bordered
          shadow
          tabIndex={0}
        ></IconButton>,
      ]}
      onClose={closeModal}
    >
      <GroupsSelect
        noteId={noteId}
        onChange={(data) => {
          groupData = data;
        }}
      />
    </Modal>,
  );
}
