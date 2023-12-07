import styles from "./auth.module.scss";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import Locale from "../locales";

import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import { login } from "../request/user";
import { IconButton } from "../components/button";
import { showToast } from "../components/ui-lib";

export function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  // const user = { name: "", password: "" };

  const goLogin = async () => {
    if (!name) {
      showToast("请输入用户名");
      return;
    }
    if (!password) {
      showToast("请输入密码");
      return;
    }
    const loginUser = await login({ name, password });
    if (loginUser && loginUser.id) {
      showToast("login success");
      navigate(Path.Home);
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
      <div className={styles["auth-tips"]}>{"用户名"}</div>
      <input
        className={styles["auth-input"]}
        placeholder={"请输入用户名"}
        onChange={(e) => {
          setName(e.currentTarget.value);
        }}
      />
      <div className={styles["auth-tips"]}>{"密码"}</div>
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Settings.Token.Placeholder}
        onChange={(e) => {
          setPassword(e.currentTarget.value);
        }}
      />
      <div className={styles["auth-actions"]}>
        <IconButton text={"login"} type="primary" onClick={goLogin} />
      </div>
    </div>
  );
}
