import { Input, List, ListItem, Popover } from "./ui-lib";
import styles from "./profile.module.scss";
import { Avatar, AvatarPicker } from "./emoji";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_MASK_AVATAR } from "../store/mask";
import { getUserDetail, updateUserDetail } from "../request/user";
import { IUser } from "../store/user";
import { useDebouncedCallback } from "use-debounce";

export const Profile = () => {
  const DEFAULT_AVATAR = "1f606";
  const [showPicker, setShowPicker] = useState(false);
  const [user, setUser] = useState<IUser>({ id: "", name: "", isAdmin: 0 });

  const updateEmoji = (emoji: string) => {
    console.log("updateEmoji:", emoji);
    updateUser({ ...user, avatar: emoji });
  };

  const updateUser = (user: IUser) => {
    console.log("updateUser:", user);
    updateUserDetail(user).then((data) => setUser(data));
  };

  useEffect(() => {
    getUserDetail().then((data) => setUser(data));
  }, []);

  const updateDebouncedUser = useDebouncedCallback((option: {}) => {
    console.log("debounce:", option);
    updateUser({ ...user, ...option });
  }, 1000);
  return (
    <div className={styles["profile-box"]}>
      <List>
        <ListItem title="nickname">
          <input
            type="text"
            defaultValue={user?.nickname}
            placeholder="请输入昵称"
            onChange={(event) => {
              updateDebouncedUser({ nickname: event.target.value });
            }}
          ></input>
        </ListItem>
        <ListItem title="avatar">
          <Popover
            content={
              <AvatarPicker
                onEmojiClick={(emoji) => {
                  console.log("onEmojiClick:", emoji);
                  updateEmoji(emoji);
                  setShowPicker(false);
                }}
              ></AvatarPicker>
            }
            open={showPicker}
            onClose={() => setShowPicker(false)}
          >
            <div
              onClick={() => setShowPicker(true)}
              style={{ cursor: "pointer" }}
            >
              <Avatar avatar={user?.avatar || DEFAULT_AVATAR} />
            </div>
          </Popover>
        </ListItem>
        <ListItem title="about me">
          <Input
            type="text"
            defaultValue={user?.information}
            rows={10}
            placeholder="请输入你的自叙"
            onChange={(e) => {
              updateDebouncedUser({ information: e.currentTarget.value });
            }}
          ></Input>
        </ListItem>
      </List>
    </div>
  );
};
