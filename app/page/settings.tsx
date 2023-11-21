import { useNavigate } from "react-router-dom";
import { Path } from "../constant";

export const Settings = () => {
  const navigate = useNavigate();
  return (
    <div>
      我的
      <br />
      <p>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(Path.ChatSetting);
          }}
        >
          设置
        </button>
      </p>
    </div>
  );
};
