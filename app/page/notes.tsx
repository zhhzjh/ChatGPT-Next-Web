import { useCallback, useEffect, useState } from "react";
import { deleteNote, getNote } from "../request/note";
import { Note } from "../store";
import styles from "./notes.module.scss";
import { useNavigate } from "react-router-dom";
import { NOTE_SESSION_ID, Path } from "../constant";
import CloseIcon from "../icons/close.svg";
import { IconButton } from "../components/button";
import { NoteCard } from "../components/note-card";

export const NotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  const getNoteData = useCallback(() => {
    getNote().then((data) => {
      const notes = data as Note[];
      setNotes(notes);
    });
  }, []);
  useEffect(() => {
    getNoteData();
  }, [getNoteData]);

  const onDelte = (id: string) => {
    deleteNote(id).then((result) => {
      if (result?.id as string) {
        getNoteData();
      }
    });
  };

  return (
    <div className={styles["note-wrap"]}>
      <h1 className={styles["note-title"]}>如溪</h1>
      <div
        className={styles["new-note"]}
        onClick={() => navigate(`${Path.Chat}/${NOTE_SESSION_ID}`)}
      >
        +
      </div>
      <div className={styles["note-list"]}>
        {notes.map((note, i) => {
          return note?.id ? (
            <div
              key={note.id}
              onClick={() => navigate(`${Path.NoteDetail}/${note.id}`)}
              className={styles["note-link"]}
            >
              <IconButton
                className={styles["note-delete"]}
                icon={<CloseIcon />}
                onClick={(e) => {
                  e.preventDefault();
                  onDelte(note.id);
                }}
              />
              <NoteCard note={note} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
