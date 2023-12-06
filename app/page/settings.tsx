import { useNavigate } from "react-router-dom";
import { MY_SESSION_LIST, Path } from "../constant";
import { IconButton } from "../components/button";
import styles from "./settings.module.scss";
import { Profile } from "../components/profile";

export const Settings = () => {
  const navigate = useNavigate();
  return (
    <div className={styles["setting-wrap"]}>
      <div className={styles["my-settings"]}>
        <Profile />
      </div>
      <div className={styles["my-chat-list"]}>
        {MY_SESSION_LIST.map((chat) => {
          return chat.hide ? null : (
            <IconButton
              className={`${styles["chat-tab"]}`}
              onClick={() => {
                navigate(`${Path.Chat}/${chat.id}`);
              }}
              key={chat.id}
              text={chat.name}
            />
          );
        })}
      </div>
    </div>
  );
};
