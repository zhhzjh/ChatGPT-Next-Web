import { Link } from "react-router-dom";
import { Path, NOTE_SESSION_ID, CHAT_LIST, MY_SESSION_LIST } from "../constant";

export const AdminPage = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}
    >
      <Link key={NOTE_SESSION_ID} to={`${Path.ChatSetting}\${NOTE_SESSION_ID}`}>
        生成日记
      </Link>
      <>
        {CHAT_LIST.map((chat) => (
          <Link key={chat.id} to={`${Path.ChatSetting}\${chat.id}`}>
            {chat.name}
          </Link>
        ))}
      </>
      <>
        {MY_SESSION_LIST.map((chat) => (
          <Link key={chat.id} to={`${Path.ChatSetting}\${chat.id}`}>
            {chat.name}
          </Link>
        ))}
      </>
    </div>
  );
};
