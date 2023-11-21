import { Mask } from "../store/mask";
import { API_MASK, BASE_URL } from "./constant";

export const createMask = async (mask: Mask) => {
  // const questData = {
  //   ...mask,
  //   contextsJson: JSON.stringify(mask.context || []),
  // };
  // delete questData.createdAt;
  const res = await fetch(BASE_URL + API_MASK.CREATE, {
    body: JSON.stringify(mask),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  console.log("createPrompt:", res);
  return res;
};
