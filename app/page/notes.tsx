import { useCallback, useEffect, useState } from "react";
import { deleteNote, getNote } from "../request/note";
import { Note } from "../store";
import styles from "./notes.module.scss";
import { useNavigate } from "react-router-dom";
import { NOTE_SESSION_ID, Path } from "../constant";
import CloseIcon from "../icons/close.svg";
import AddIcon from "../icons/add.svg";
import { IconButton } from "../components/button";
import { NoteCard } from "../components/note-card";
import { Group } from "../store/group";
import { getGroupNotes, getMyGroup } from "../request/group";
import { SelectUserModal } from "../components/user-select";
import { DEFAULT_USER, IUser } from "../store/user";
import { getUserDetail } from "../request/user";

export const NotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const navigate = useNavigate();

  // update User
  useEffect(() => {
    getUserDetail().then((data) => setUser(data));
  }, []);

  const getNoteData = useCallback(() => {
    if (!groupId) {
      getNote().then((data) => {
        const notes = data as Note[];
        setNotes(notes);
      });
    } else {
      getGroupNotes(groupId).then((data) => {
        setNotes(data);
      });
    }
  }, [groupId]);
  useEffect(() => {
    getNoteData();
  }, [getNoteData]);

  const initGroup = useCallback(() => {
    getMyGroup().then((data: Group[]) => {
      setGroups(data);
    });
  }, []);

  useEffect(() => {
    initGroup();
  }, [initGroup]);

  const onDelte = (id: string) => {
    deleteNote(id).then((result) => {
      if (result?.id as string) {
        getNoteData();
      }
    });
  };

  return (
    <div className={styles["note-wrap"]}>
      <SelectUserModal
        open={openSearch}
        changeVisible={(visible) => setOpenSearch(visible)}
        onCreated={() => initGroup()}
        title="新建群组"
      />
      <h1 className={styles["note-title"]}>如溪</h1>
      <div className={styles["group-list"]}>
        <IconButton
          key={"me"}
          className={styles["group-item"]}
          onClick={() => setGroupId(null)}
          text={"Me"}
        />
        {groups.map((group) => (
          <IconButton
            key={group.id}
            onClick={() => setGroupId(group.id)}
            className={styles["group-item"]}
            text={group.name || "我的群组"}
          />
        ))}
        {groups.filter((group) => group.auth === 1).length < 2 ? (
          <IconButton
            key={"add"}
            icon={<AddIcon />}
            className={`${styles["group-item"]} ${styles["group-add"]}`}
            onClick={() => setOpenSearch(true)}
          />
        ) : null}
      </div>
      <div
        className={styles["new-note"]}
        onClick={() => navigate(`${Path.Chat}/${NOTE_SESSION_ID}`)}
      >
        +
      </div>
      <div className={styles["note-list"]}>
        {notes.map((note, i) => {
          return note?.id ? (
            <div key={note.id} className={styles["note-link"]}>
              {note.userId === user.id && (
                <IconButton
                  className={styles["note-delete"]}
                  icon={<CloseIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    onDelte(note.id);
                  }}
                />
              )}
              <NoteCard note={note} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
