import { Note } from "../store";
import styles from "./note.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import dynamic from "next/dynamic";
import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
const Markdown = dynamic(
  async () => (await import("../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export const NoteCard = (props: { note: Note }) => {
  const navigate = useNavigate();
  const { note } = props;
  if (!note) {
    return null;
  }
  return (
    <div
      className={styles["note-card"]}
      onClick={() => navigate(`${Path.NoteDetail}/${note.id}`)}
    >
      <p className={styles["note-title"]}>
        {(note.title || note.content.split("\n")[0] || "我的笔记").replace(
          /^[\#\w]+/,
          "",
        )}
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
