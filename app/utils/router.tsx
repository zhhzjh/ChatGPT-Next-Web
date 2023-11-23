import { useRouter } from "next/router";
import { Path } from "../constant";
import { NextResponse } from "next/server";
import Cookies from "js-cookie";

export const toLogin = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const router = useRouter();
  console.log("redirect toLogin");
  // NextResponse.redirect("http://localhost:3000/login");
  Cookies.remove("token");
  // typeof window !== "undefined" && router.push(Path.Login);
};
