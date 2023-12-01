import { StoreKey } from "../constant";
import { getUserDetail } from "../request/user";
import { createPersistStore } from "../utils/store";

export interface IUser {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  isAdmin: number;
  information?: string;
}

export const DEFAULT_USER: IUser = {
  id: "",
  name: "guest",
  avatar: "1f603",
  email: "",
  isAdmin: 0,
  information: "",
};

export const useUserStore = createPersistStore(
  DEFAULT_USER,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }
    const methods = {
      async updateUser() {
        const user = getUserDetail() as unknown as IUser;
        if (!user) {
          set(() => DEFAULT_USER);
        }
        return set(() => user);
      },
      user() {
        return get();
      },
    };
    return methods;
  },
  { name: StoreKey.Chat },
);
