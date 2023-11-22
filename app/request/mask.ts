import { Mask } from "../store/mask";
import { API_MASK, BASE_URL } from "./constant";
import { HttpClient } from "./fetch";

export const createMask = async (mask: Mask) => {
  // const questData = {
  //   ...mask,
  //   contextsJson: JSON.stringify(mask.context || []),
  // };
  // delete questData.createdAt;
  const res = await HttpClient.request({
    url: API_MASK.CREATE,
    method: "POST",
    data: mask,
  });
  console.log("createPrompt:", res);
  return res;
};
