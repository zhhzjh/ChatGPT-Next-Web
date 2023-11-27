import { useNavigate } from "react-router-dom";
import { CHAT_LIST, MY_SESSION_LIST, Path } from "../constant";
import { IconButton } from "../components/button";
import styles from "./settings.module.scss";

export const Settings = () => {
  const navigate = useNavigate();
  return (
    <div className={styles["setting-wrap"]}>
      <div className={styles["my-settings"]}>
        <h1>我的</h1>
        <br />
      </div>
      <div className={styles["my-chat-list"]}>
        {MY_SESSION_LIST.map((chat) => (
          <IconButton
            className={`${styles["chat-tab"]}`}
            onClick={() => {
              navigate(`${Path.Chat}/${chat.id}`);
            }}
            key={chat.id}
            text={chat.name}
          />
        ))}
      </div>
    </div>
  );
};
