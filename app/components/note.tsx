import { Note } from "../store";
import styles from "./note.module.scss";
export const NoteItem = (props: { note: Note }) => {
  const { note } = props;
  if (!note) {
    return null;
  }
  return (
    <div className={styles["note-item"]}>
      <p>{note.content}</p>
      <p className={styles["note-time"]}>{note.createdAt.toString()}</p>
    </div>
  );
};
