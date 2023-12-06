import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoteDetail, updateNote } from "../request/note";
import { RefNoteItem } from "../components/note";
import { Note } from "../store";
import styles from "./notes.module.scss";
import { IconButton } from "../components/button";
import ReturnIcon from "../icons/return.svg";
import CloseIcon from "../icons/close.svg";
import { Path } from "../constant";
import { showImageModal, showPrompt, showToast } from "../components/ui-lib";
import Locale from "../locales";
import { getClientConfig } from "../config/client";
import { toPng } from "html-to-image";
import { useMobileScreen } from "../utils";
import { getUserDetail } from "../request/user";
import { IUser, DEFAULT_USER } from "../store/user";
import { showGroupSelected } from "../components/group-select";

export const NoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useMobileScreen();
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const navigate = useNavigate();

  // update User
  useEffect(() => {
    getUserDetail().then((data) => setUser(data));
  }, []);

  const downloadImage = async () => {
    if (!noteRef?.current) return showToast("笔记详情不存在");
    showToast(Locale.Export.Image.Toast);
    const dom = noteRef?.current;
    if (!dom) return;

    const isApp = getClientConfig()?.isApp;

    try {
      const blob = await toPng(dom);
      if (!blob) return;

      if (isMobile || (isApp && window.__TAURI__)) {
        if (isApp && window.__TAURI__) {
          const result = await window.__TAURI__.dialog.save({
            defaultPath: `${note?.title || "我的笔记"}.png`,
            filters: [
              {
                name: "PNG Files",
                extensions: ["png"],
              },
              {
                name: "All Files",
                extensions: ["*"],
              },
            ],
          });

          if (result !== null) {
            const response = await fetch(blob);
            const buffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            await window.__TAURI__.fs.writeBinaryFile(result, uint8Array);
            showToast(Locale.Download.Success);
          } else {
            showToast(Locale.Download.Failed);
          }
        } else {
          showImageModal(blob);
        }
      } else {
        const link = document.createElement("a");
        link.download = `${note?.title || "我的笔记"}.png`;
        link.href = blob;
        link.click();
        refreshPreview();
      }
    } catch (error) {
      showToast(Locale.Download.Failed);
    }
  };

  const refreshPreview = () => {
    const dom = noteRef?.current;
    if (dom) {
      dom.innerHTML = dom.innerHTML; // Refresh the content of the preview by resetting its HTML for fix a bug glitching
    }
  };
  useEffect(() => {
    if (id) {
      getNoteDetail(id).then((data) => setNote(data as Note));
    }
  }, [id]);

  const updateContent = (content: string) => {
    if (!note) return;
    // console.log("updateContent:", content);
    updateNote({ ...note, content }).then((data) => setNote(data as Note));
  };

  return (
    <>
      <div className={styles["note-detail-wrap"]}>
        <div className={`page-header`}>
          <IconButton
            icon={<ReturnIcon />}
            bordered
            title={"返回"}
            onClick={() => navigate(Path.Home)}
          />
          <span className={styles["note-title"]}>笔记内容</span>
          {note?.userId === user.id && (
            <span
              className={styles["note-more"]}
              onClick={() => setShowModal(true)}
            >
              ...
            </span>
          )}
        </div>
        {note?.content && <RefNoteItem ref={noteRef} note={note} />}
      </div>
      {showModal && (
        <div className={styles["note-modal"]}>
          <div
            className={styles["note-mask"]}
            onClick={() => setShowModal(false)}
          />
          <div className={styles["note-modal-content"]}>
            <div
              className={styles["note-modal-action"]}
              onClick={() => setShowModal(false)}
            >
              <CloseIcon />
            </div>
            <div
              className={styles["note-model-list"]}
              onClick={() => {
                downloadImage();
                setShowModal(false);
              }}
            >
              本地保存
            </div>
            <div
              className={styles["note-model-list"]}
              onClick={async () => {
                setShowModal(false);
                const newContent = await showPrompt(
                  Locale.Chat.Actions.Edit,
                  note?.content,
                  10,
                );
                updateContent(newContent);
              }}
            >
              编辑
            </div>
            {note?.id && (
              <div
                className={styles["note-model-list"]}
                onClick={() => {
                  setShowModal(false);
                  showGroupSelected(note.id, "选择可见群组");
                }}
              >
                对谁可见
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
