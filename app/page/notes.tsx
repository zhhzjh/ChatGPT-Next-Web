import { useEffect, useState } from "react";
import { getNote } from "../request/note";
import { Note } from "../store";
import { NoteItem } from "../components/note";
import styles from "./notes.module.scss";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";

export const NotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getNote().then((data) => {
      const notes = [
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
        ...(data as Note[]),
      ];
      setNotes(notes);
    });
  }, []);
  return (
    <div className={styles["note-wrap"]}>
      <h1>我的笔记</h1>
      <div
        className={styles["new-note"]}
        onClick={() => navigate(Path.NewNote)}
      >
        +
      </div>
      <div className={styles["note-list"]}>
        {notes.map((note, i) => (
          <NoteItem key={note.id || i} note={note} />
        ))}
        d
      </div>
    </div>
  );
};
