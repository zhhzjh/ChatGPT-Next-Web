import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import styles from "./nav.module.scss";
const Nav = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.nav}>
      <div onClick={(e) => navigate(Path.Home)}>如溪</div>
      <div onClick={(e) => navigate(Path.Chat)}>问答</div>
      <div onClick={(e) => navigate(Path.Settings)}>我的</div>
    </div>
  );
};

export default Nav;
