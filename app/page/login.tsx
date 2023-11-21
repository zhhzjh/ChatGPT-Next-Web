import styles from "./auth.module.scss";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import Locale from "../locales";

import { useEffect } from "react";
import { getClientConfig } from "../config/client";
import { login } from "../request/user";
import { IconButton } from "../components/button";
import { showToast } from "../components/ui-lib";

export function LoginPage() {
  const navigate = useNavigate();
  const user = { username: "", password: "" };

  const goLogin = async () => {
    if (user.username === "") {
      showToast("请输入用户名");
      return;
    }
    if (user.password === "") {
      showToast("请输入密码");
      return;
    }
    const loginUser = await login(user);
    if (loginUser && loginUser.id) {
      showToast("login success");
      setTimeout(() => navigate(Path.Home), 300);
    }
  };
  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["auth-page"]}>
      <div className={styles["auth-title"]}>{"login"}</div>
      <br />
      <div className={styles["auth-tips"]}>{"email"}</div>
      <input
        className={styles["auth-input"]}
        placeholder={"请输入email"}
        onChange={(e) => {
          user.username = e.currentTarget.value;
        }}
      />
      <div className={styles["auth-tips"]}>{"密码"}</div>
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Settings.Token.Placeholder}
        onChange={(e) => {
          user.password = e.currentTarget.value;
        }}
      />
      <div className={styles["auth-actions"]}>
        <IconButton text={"login"} type="primary" onClick={goLogin} />
      </div>
    </div>
  );
}
