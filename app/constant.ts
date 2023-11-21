export const OWNER = "forkyguo";
export const REPO = "ChatGPT-Next-Web";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/forkyguo/ruxi/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_CORS_HOST = "https://ab.nextweb.fun";
export const DEFAULT_API_HOST = `${DEFAULT_CORS_HOST}/api/proxy`;

export enum Path {
  Home = "/",
  Chat = "/chat",
  ChatSetting = "/chat-setting",
  Settings = "/settings",
  Record = "/record",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  Login = "/login",
}

export enum ApiPath {
  Cors = "/api/cors",
}

export enum SlotID {
  AppBody = "app-body",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "ruxi9";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  WhisperPath: "v1/audio/translations",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = `
Knowledge cutoff: {{knowledgeCutoff}}
Current model: {{model}}
Current time: {{time}}
`;

export const SUMMARIZE_MODEL = "gpt-4";

export const DEFAULT_MODELS = [
  {
    name: "whisper-1",
    available: true,
  },
  {
    name: "gpt-4",
    available: true,
  },
  {
    name: "gpt-4-0314",
    available: true,
  },
  {
    name: "gpt-4-0613",
    available: true,
  },
  {
    name: "gpt-4-32k",
    available: true,
  },
  {
    name: "gpt-4-32k-0314",
    available: true,
  },
  {
    name: "gpt-4-32k-0613",
    available: true,
  },
  {
    name: "gpt-4-1106-preview",
    available: true,
  },
  {
    name: "gpt-4-vision-preview",
    available: true,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0613",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-1106",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k-0613",
    available: true,
  },
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

export const AUTO_NOTE_REGEX_LIST = [
  "(期待)?(我们的?)?((下一?[次回])|(待会儿?)|改天)[再的]?(说|见|聊|继续|交流|[对会]话)",
  "(我们)?(今天)(的[会对]话)?((就先|就|先)?聊到这吧?|到此为止|就这么多|就这样|就?聊完了|差不多了|(就先|就|先)(到这里?|结束)|就?先这样吧?)",
  "结束聊天",
  "到此结束",
  "就先这样吧",
];

export const CHAT_LIST = [
  { id: "539074ba-b6b1-469f-a4f0-266b30bf0858", name: "情感陪伴" },
  { id: "c14a7260-c2aa-4a7d-9ebf-ba099fec972f", name: "专业问答" },
];
