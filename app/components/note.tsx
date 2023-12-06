import { Note } from "../store";
import styles from "./note.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import dynamic from "next/dynamic";
import { ForwardedRef, forwardRef } from "react";
const Markdown = dynamic(
  async () => (await import("../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export interface IProps {
  note: Note;
}
export type Ref = HTMLDivElement;

export const RefNoteItem = forwardRef<Ref, IProps>((props, myRef) => {
  const { note } = props;
  if (!note) {
    return null;
  }
  return (
    <div className={styles["note-item"]}>
      <div className={styles["note-content"]} ref={myRef}>
        <Markdown content={note.content || "暂无内容"} />
        <p className={styles["note-time"]}>
          {new Date(note.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
});

RefNoteItem.displayName = "RefNoteItem";
