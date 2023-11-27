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

export const NoteItem = (props: { note: Note }) => {
  const { note } = props;
  console.log("note：", note);
  if (!note) {
    return null;
  }
  return (
    <div className={styles["note-item"]}>
      <Markdown content={note.content || "暂无内容"} />
      <p className={styles["note-time"]}>{note.createdAt.toLocaleString()}</p>
    </div>
  );
};
