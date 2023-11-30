import { Note } from "../store";
import styles from "./note.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import dynamic from "next/dynamic";
const Markdown = dynamic(
  async () => (await import("../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export const NoteCard = (props: { note: Note }) => {
  const { note } = props;
  console.log("note：", note);
  if (!note) {
    return null;
  }
  return (
    <div className={styles["note-card"]}>
      <p className={styles["note-title"]}>
        {note.title || note.content.split("\n")[0] || "我的笔记"}
      </p>
      <p className={styles["note-info"]}>
        <span className={styles["note-from"]}>{note.chatSessionName}</span>
        <span className={styles["note-time"]}>
          {new Date(note.createdAt).toLocaleString()}
        </span>
      </p>
    </div>
  );
};
