import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "./config";
import { createEmptyMask, Mask } from "./mask";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_SYSTEM_TEMPLATE,
  StoreKey,
  SUMMARIZE_MODEL,
} from "../constant";
import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject, separationMessage } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { createChatSession, updateChatSession } from "../request/chat-session";
import { createMessages } from "../request/message";
import { createNotes } from "../request/note";

export type BaseMessage = RequestMessage & {
  isError?: boolean;
  createdAt?: string;
  chatSessionId?: string;
};

export type ChatMessage = BaseMessage & {
  streaming?: boolean;
  sliceIndex?: number;
  id: string;
  model?: ModelType;
  userId?: string;
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: "",
    createdAt: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}

export type BaseNote = {
  chatSessionId: string;
  chatSessionName?: string;
  originMessageIds: string;
  title?: string;
  content: string;
  role: string;
  flag: number;
};

export type Note = BaseNote & {
  id: string;
  userId: string;
  userName?: string;
  title?: string;
  createdAt: string;
};

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatConfig {
  id: string;
  name: string;
  mask: Mask;
  noteMask: Mask;
}

export interface ChatSession extends ChatConfig {
  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
  lastNodeIndex?: number;
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: Locale.Store.BotHello,
});

export function createEmptySession(): ChatSession {
  return {
    id: "",
    name: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    lastNodeIndex: 0,
    mask: createEmptyMask(),
    noteMask: createEmptyMask(),
  };
}

function getSummarizeModel(currentModel: string) {
  // if it is using gpt-* models, force to use 3.5 to summarize
  return currentModel.startsWith("gpt") ? SUMMARIZE_MODEL : currentModel;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionIndex: number;
  currentSessionId: string;
  clearSessions: () => void;
  moveSession: (from: number, to: number) => void;
  selectSession: (index: number) => void;
  newSession: (mask?: Mask) => void;
  deleteSession: (index: number) => void;
  currentSession: () => ChatSession;
  nextSession: (delta: number) => void;
  onNewMessage: (message: ChatMessage) => void;
  onUserInput: (content: string) => Promise<void>;
  summarizeSession: () => void;
  updateStat: (message: ChatMessage) => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: ChatMessage) => void,
  ) => void;
  resetSession: () => void;
  getMessagesWithMemory: () => ChatMessage[];
  getMemoryPrompt: () => ChatMessage;

  clearAllData: () => void;
}

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const vars = {
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}

type CHAT_STATE_TYPE = {
  sessions: ChatSession[];
  currentSessionId: string;
  config: {};
  currentSessionIndex: number;
};

const DEFAULT_CHAT_STATE: CHAT_STATE_TYPE = {
  sessions: [],
  currentSessionId: "",
  config: {},
  currentSessionIndex: 0,
};

export const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      clearSessions() {
        set(() => ({
          sessions: [],
          currentSessionIndex: 0,
          currentSessionId: "",
        }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      selectSessionById(id: string) {
        // let sessions = get().sessions;
        // let session: ChatSession | undefined = sessions.find(
        //   (session) => session.id === id,
        // );
        // if (!session) {
        //   session = createEmptySession();
        //   session.id = id;
        //   sessions = [session].concat(sessions);
        // }
        set(() => ({
          currentSessionId: id,
          // sessions: sessions,
        }));
      },

      async saveCurrentConfig() {
        const session = get().currentSession();
        const config: ChatConfig = {
          id: session.id,
          name: session.name,
          mask: session.mask,
          noteMask: session.noteMask,
        };
        const res = await updateChatSession(config);
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      async newSession(mask?: Mask) {
        const session = createEmptySession();

        // if (mask) {
        //   const config = useAppConfig.getState();
        //   const globalModelConfig = config.modelConfig;

        //   session.mask = {
        //     ...mask,
        //     modelConfig: {
        //       ...globalModelConfig,
        //       ...mask.modelConfig,
        //     },
        //   };
        //   session.topic = mask.name;
        // }
        const res = await createChatSession(mask);
        return;
        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      deleteSession(index: number) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));

        showToast(
          Locale.Home.DeleteToast,
          {
            text: Locale.Home.Revert,
            onClick() {
              set(() => restoreState);
            },
          },
          5000,
        );
      },

      currentSession() {
        let id = get().currentSessionId;
        const sessions = get().sessions;
        // console.log("getSessions:", sessions);
        let session: ChatSession | undefined = sessions.find(
          (session) => session.id === id,
        );
        return session || createEmptySession();
      },

      onNewMessage(message: ChatMessage, length: number = 2) {
        get().updateCurrentSession(async (session) => {
          const messages = session.messages.concat();
          const result = await createMessages(
            messages.splice(-length, length) as BaseMessage[],
          );
          session.messages = messages.concat(result as ChatMessage[]);
          session.lastUpdate = Date.now();
          // console.log("onNewMessage:", session.messages);
          // get().updateStat(session.messages[session.messages.length - 1]);
        });
        get().summarizeSession();
      },

      onRecordComplete(audio: Blob) {
        return new Promise<string>((resolve, reject) =>
          api.llm.whisper({
            audio: audio,
            config: { model: "whisper-1", stream: true },
            onUpdate(message) {
              console.log("update:", message);
            },
            onFinish(message) {
              console.log("message:", message);
              resolve((JSON.parse(message).body as string) || "");
            },
            onError(error) {
              console.error("[Chat] failed ", error);
              reject();
            },
          }),
        );
      },

      async onUserInput(
        content: string,
        isOnlyNote: boolean = false,
        slice: boolean = false,
      ) {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;

        const userContent = fillTemplateWith(content, modelConfig);
        console.log("[User Input] after template: ", userContent);

        const userMessage: ChatMessage = createMessage({
          role: "user",
          content: userContent,
          chatSessionId: session.id,
        });
        let botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
          chatSessionId: session.id,
        });
        console.log("botMessage:", session, userMessage, botMessage);
        // get recent messages
        const recentMessages = get().getMessagesWithMemory();
        const sendMessages = recentMessages.concat(userMessage);
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          const savedUserMessage = {
            ...userMessage,
            content,
          };
          session.messages = session.messages.concat(
            isOnlyNote ? [savedUserMessage] : [savedUserMessage, botMessage],
          );
        });

        if (isOnlyNote) return;
        let newMessages: string[] = [];
        let newMessagesLength: number = 2;
        // make request
        api.llm.chat({
          messages: sendMessages,
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            console.log("onUpdate:", message);
            const updateMessages = session.messages.concat();
            if (message) {
              // botMessage.content = message;
              // const newMessage = message.slice(botMessage.sliceIndex ?? 0);
              if (slice) {
                let { sliceIndex = 0 } = botMessage;
                message = message.slice(sliceIndex);
                newMessages = separationMessage(message);
                if (newMessages.length > 1) {
                  botMessage.content = newMessages.shift() || "";
                  sliceIndex += botMessage.content.length;
                  botMessage.streaming = false;
                  botMessage.sliceIndex = sliceIndex;
                  while (newMessages.length > 1) {
                    const content = newMessages.shift() || "";
                    sliceIndex += content?.length ?? 0;
                    const msg: ChatMessage = createMessage({
                      role: "assistant",
                      streaming: false,
                      model: modelConfig.model,
                      chatSessionId: session.id,
                      content,
                      sliceIndex,
                    });
                    newMessagesLength++;
                    updateMessages.push(msg);
                  }
                  botMessage = createMessage({
                    role: "assistant",
                    streaming: true,
                    model: modelConfig.model,
                    chatSessionId: session.id,
                    sliceIndex,
                  });
                  newMessagesLength++;
                  updateMessages.push(botMessage);
                } else {
                  // console.log("bot message:", message);
                  // botMessage.content = message;
                  // botMessage.sliceIndex = sliceIndex + message.length;
                }
              } else {
                botMessage.content = message;
              }
            }
            get().updateCurrentSession((session) => {
              session.messages = updateMessages;
            });
          },
          onFinish(message) {
            botMessage.streaming = false;
            console.log("onFinish:", message, newMessages);
            if (message) {
              if (slice && newMessages.length > 0) {
                botMessage.content = newMessages.shift() ?? "";
                botMessage.sliceIndex = 0;
              } else {
                botMessage.content = message;
              }
              get().onNewMessage(botMessage, newMessagesLength);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content +=
              "\n\nPlease retry. Error message:\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
        });
      },

      async onMakeDiary(groupId?: string) {
        const session = get().currentSession();
        if (!session.noteMask) session.noteMask = createEmptyMask();
        const modelConfig = session.noteMask.modelConfig;
        // const modelConfig = session.mask.modelConfig;

        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
          chatSessionId: session.id,
        });

        // 从设置中读取条数
        const lastNodeIndex = 0 - (modelConfig?.historyMessageCount || 10);

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          // const savedUserMessage = {
          //   ...userMessage,
          // };
          session.lastNodeIndex = session.messages.length;
          session.messages = session.messages.concat([
            // savedUserMessage,
            botMessage,
          ]);
        });

        const messageIndex = get().currentSession().messages.length + 1;

        const contextPrompts = session.noteMask.context.slice();
        let beforeMessages: ChatMessage[] = [];
        let afterMessages: ChatMessage[] = [];
        const before = session.noteMask.beforeLength || -1;
        if (before >= 0) {
          beforeMessages = contextPrompts.slice(0, before);
          afterMessages = contextPrompts.slice(before);
        } else {
          beforeMessages = contextPrompts.slice();
          afterMessages = [];
        }

        let toBeSummarizedMsgs = session.messages
          .slice(lastNodeIndex || 0)
          .filter((msg) => !msg.isError)
          .slice(0);

        // todo: 判定长度超长
        console.log(
          "onMakeDiary:",
          // contextPrompts,
          session.lastNodeIndex,
          lastNodeIndex,
          toBeSummarizedMsgs,
        );

        // make request
        api.llm.chat({
          messages: [
            ...beforeMessages,
            ...toBeSummarizedMsgs,
            ...afterMessages,
          ],
          config: {
            ...modelConfig,
            stream: true,
          },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
          },
          async onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;
              get().onNewMessage(botMessage);
              const {
                content,
                role,
                chatSessionId = get().currentSession().id,
              } = botMessage;
              const result = await createNotes(
                {
                  content,
                  role,
                  chatSessionId,
                  flag: 0,
                  originMessageIds: "",
                },
                toBeSummarizedMsgs,
                groupId,
              );
              // console.log("onMakeDiary finish:", result);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content +=
              "\n\nPlease retry. Error message:\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            // userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });

            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
        });
      },

      getMemoryPrompt() {
        const session = get().currentSession();

        return {
          role: "system",
          content:
            session.memoryPrompt.length > 0
              ? Locale.Store.Prompt.History(session.memoryPrompt)
              : "",
          createdAt: "",
        } as ChatMessage;
      },

      getMessagesWithMemory() {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;
        const clearContextIndex = session.clearContextIndex ?? 0;
        const messages = session.messages.slice();
        const totalMessageCount = session.messages.length;

        // in-context prompts
        const contextPrompts = session.mask.context.slice();

        // system prompts, to get close to OpenAI Web ChatGPT
        const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
        const systemPrompts = shouldInjectSystemPrompts
          ? [
              createMessage({
                role: "system",
                content: fillTemplateWith("", {
                  ...modelConfig,
                  template: DEFAULT_SYSTEM_TEMPLATE,
                }),
                chatSessionId: session.id,
              }),
            ]
          : [];
        if (shouldInjectSystemPrompts) {
          console.log(
            "[Global System Prompt] ",
            systemPrompts.at(0)?.content ?? "empty",
          );
        }

        // long term memory
        const shouldSendLongTermMemory =
          modelConfig.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 &&
          session.lastSummarizeIndex > clearContextIndex;
        const longTermMemoryPrompts = shouldSendLongTermMemory
          ? [get().getMemoryPrompt()]
          : [];
        const longTermMemoryStartIndex = session.lastSummarizeIndex;

        // short term memory
        const shortTermMemoryStartIndex = Math.max(
          0,
          totalMessageCount - modelConfig.historyMessageCount,
        );

        // lets concat send messages, including 4 parts:
        // 0. system prompt: to get close to OpenAI Web ChatGPT
        // 1. long term memory: summarized memory messages
        // 2. pre-defined in-context prompts
        // 3. short term memory: latest n messages
        // 4. newest input message
        const memoryStartIndex = shouldSendLongTermMemory
          ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
          : shortTermMemoryStartIndex;
        // and if user has cleared history messages, we should exclude the memory too.
        const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
        const maxTokenThreshold = modelConfig.max_tokens;

        // get recent messages as much as possible
        const reversedRecentMessages = [];
        for (
          let i = totalMessageCount - 1, tokenCount = 0;
          i >= contextStartIndex && tokenCount < maxTokenThreshold;
          i -= 1
        ) {
          const msg = messages[i];
          if (!msg || msg.isError) continue;
          tokenCount += estimateTokenLength(msg.content);
          reversedRecentMessages.push(msg);
        }
        console.log("longTermMemoryPrompts:", longTermMemoryPrompts);
        console.log("contextPrompts:", contextPrompts);
        // concat all messages
        const recentMessages = [
          ...systemPrompts,
          ...longTermMemoryPrompts,
          ...contextPrompts,
          ...reversedRecentMessages.reverse(),
        ];

        return recentMessages;
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.lastNodeIndex = 0;
          session.lastSummarizeIndex = 0;
          session.clearContextIndex = 0;
          session.memoryPrompt = "";
        });
      },

      summarizeSession() {
        const config = useAppConfig.getState();
        const session = get().currentSession();

        // remove error messages if any
        const messages = session.messages;

        // should summarize topic after chating more than 50 words
        const SUMMARIZE_MIN_LEN = 50;
        if (
          config.enableAutoGenerateTitle &&
          session.name === DEFAULT_TOPIC &&
          countMessages(messages) >= SUMMARIZE_MIN_LEN
        ) {
          const topicMessages = messages.concat(
            createMessage({
              role: "user",
              content: Locale.Store.Prompt.Topic,
              chatSessionId: session.id,
            }),
          );
          api.llm.chat({
            messages: topicMessages,
            config: {
              model: getSummarizeModel(session.mask.modelConfig.model),
            },
            onFinish(message) {
              get().updateCurrentSession(
                (session) =>
                  (session.name =
                    message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
              );
            },
          });
        }

        const modelConfig = session.mask.modelConfig;
        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMsgs = messages
          .filter((msg) => !msg.isError)
          .slice(summarizeIndex);

        const historyMsgLength = countMessages(toBeSummarizedMsgs);

        if (historyMsgLength > modelConfig?.max_tokens ?? 4000) {
          const n = toBeSummarizedMsgs.length;
          toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
            Math.max(0, n - modelConfig.historyMessageCount),
          );
        }

        // add memory prompt
        toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

        const lastSummarizeIndex = session.messages.length;

        console.log(
          "[Chat History] ",
          toBeSummarizedMsgs,
          historyMsgLength,
          modelConfig.compressMessageLengthThreshold,
        );

        if (
          historyMsgLength > modelConfig.compressMessageLengthThreshold &&
          modelConfig.sendMemory
        ) {
          api.llm.chat({
            messages: toBeSummarizedMsgs.concat(
              createMessage({
                role: "system",
                content: Locale.Store.Prompt.Summarize,
                createdAt: "",
                chatSessionId: session.id,
              }),
            ),
            config: {
              ...modelConfig,
              stream: true,
              model: getSummarizeModel(session.mask.modelConfig.model),
            },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message) {
              console.log("[Memory] ", message);
              session.lastSummarizeIndex = lastSummarizeIndex;
            },
            onError(err) {
              console.error("[Summarize] ", err);
            },
          });
        }
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        let sessions = get().sessions;
        const id = get().currentSessionId;
        let session: ChatSession = get().currentSession();
        console.log("updateCurrentSession:", sessions);
        if (!session?.id) {
          sessions.unshift(session);
        }
        updater(session);
        set(() => ({ sessions }));
      },

      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    };

    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 3.1,
    migrate(persistedState, version) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state)) as CHAT_STATE_TYPE;

      if (version < 2) {
        newState.sessions = [];

        const oldSessions = state.sessions;
        for (const oldSession of oldSessions) {
          const newSession = createEmptySession();
          newSession.name = oldSession.name;
          newSession.messages = [...oldSession.messages];
          newSession.mask.modelConfig.sendMemory = true;
          newSession.mask.modelConfig.historyMessageCount = 4;
          newSession.mask.modelConfig.compressMessageLengthThreshold = 1000;
          newState.sessions.push(newSession);
        }
      }

      if (version < 3) {
        // migrate id to nanoid
        newState.sessions.forEach((s) => {
          s.id = nanoid();
          s.messages.forEach((m) => (m.id = nanoid()));
        });
      }

      // Enable `enableInjectSystemPrompts` attribute for old sessions.
      // Resolve issue of old sessions not automatically enabling.
      if (version < 3.1) {
        newState.sessions.forEach((s) => {
          if (
            // Exclude those already set by user
            !s.mask.modelConfig.hasOwnProperty("enableInjectSystemPrompts")
          ) {
            // Because users may have changed this configuration,
            // the user's current configuration is used instead of the default
            const config = useAppConfig.getState();
            s.mask.modelConfig.enableInjectSystemPrompts =
              config.modelConfig.enableInjectSystemPrompts;
          }
        });
      }

      return newState as any;
    },
  },
);
