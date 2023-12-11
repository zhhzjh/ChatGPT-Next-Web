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
import { DEFAULT_USER, IUser } from "../store/user";
import { getUserDetail } from "../request/user";
import { showUserSelect } from "../components/user-select";

const MAX_GROUPS = 2;

export const NotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const navigate = useNavigate();

  // update User
  useEffect(() => {
    getUserDetail().then((data) => setUser(data));
  }, []);

  const getNoteData = useCallback(() => {
    if (!group) {
      getNote().then((data) => {
        const notes = data as Note[];
        setNotes(notes);
      });
    } else {
      getGroupNotes(group.id).then((data) => {
        setNotes(data);
      });
    }
  }, [group]);
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

  if (!user) {
    return null;
  }

  return (
    <div className={styles["note-wrap"]}>
      <div className={styles["note-title"]}>
        <span>如溪</span>
        {group && (
          <span
            className={styles["note-more"]}
            onClick={() =>
              showUserSelect({
                user: user,
                group: group,
                onCreated: () => initGroup(),
              })
            }
          >
            ...
          </span>
        )}
      </div>
      <div className={styles["group-list"]}>
        <IconButton
          key={"me"}
          className={styles["group-item"]}
          onClick={() => setGroup(null)}
          text={"Me"}
        />
        {groups.map((group) => (
          <IconButton
            key={group.id}
            onClick={() => setGroup(group)}
            className={styles["group-item"]}
            text={group.name || "我的群组"}
          />
        ))}
        {groups.filter((group) => group.auth === 1).length < MAX_GROUPS ? (
          <IconButton
            key={"add"}
            icon={<AddIcon />}
            className={`${styles["group-item"]} ${styles["group-add"]}`}
            onClick={() =>
              showUserSelect({
                user,
                onCreated: () => initGroup(),
              })
            }
          />
        ) : null}
      </div>
      <div
        className={styles["new-note"]}
        onClick={() =>
          navigate(
            `${Path.Chat}/${NOTE_SESSION_ID}${group?.id ? "/" + group.id : ""}`,
          )
        }
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
              <NoteCard user={user} note={note} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
