import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNoteDetail } from "../request/note";
import { NoteItem } from "../components/note";
import { Note } from "../store";
import styles from "./notes.module.scss";

export const NoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  useEffect(() => {
    if (id) {
      getNoteDetail(id).then((data) => setNote(data as Note));
    }
  }, [id]);
  return (
    <div className={styles["note-wrap"]}>
      <h1 className={styles["note-title"]}>笔记详情</h1>
      {note?.content && <NoteItem note={note} />}
    </div>
  );
};
