import io from "socket.io-client";

import { serverEvents, userEvents } from "./events";
import { botStore, botAtom, messagesAtom, updateBotAtom } from "./store";
import { nanoid } from "nanoid";

import {
  BotClientOptions,
  ChatBotClient,
  Message,
  MessagePayload,
  MessageType,
} from "./types";

const updateMessage = (message: Message) => {
  botStore.set(messagesAtom, (pState) => [...pState, message]);
};

export const createBotClient = (options: BotClientOptions): ChatBotClient => {
  const { socketUrl, path = "/socket.io/" } = options;

  console.log('socketUrl : ' + socketUrl);
  const socket = io(socketUrl, { path, transports : ["polling"]});

  socket.on(serverEvents.CONNECT, () => {
    console.log("===>> Connected : " + socket.id);

    updateBotAtom({
      connected: true,
    });

    socket.emit(userEvents.SESSION_REQUEST, {
      session_id: socket.id,
    });
  });

  socket.on(serverEvents.SESSION_CONFIRM, (response) => {
    console.log("===>>> Session Confirmed: " + response);

    socket.emit(userEvents.USER_UTTERED, {
      customData: { language: "en" },
      session_id: response,
      message: "/greet",
    });

    updateBotAtom({
      sessionId: response,
    });
  });

  socket.on(serverEvents.CONNECT_ERROR, (_error) => {
    console.log("=======>> serverEvents.CONNECT_ERROR : ", _error);
  });

  socket.on(serverEvents.BOT_UTTERED, (response) => {
    console.log(response);

    try {
      let messageType: MessageType = "TEXT";

      if (response.quick_replies) {
        messageType = "OPTIONS";
      }

      if (
        response.text === "What is your budget (in $)" ||
        response.text.includes("$")
      ) {
        messageType = "BUDGET";
      }

      const message: Message = {
        id: nanoid(),
        type: messageType,
        text: response.text,
        timestamp: Date.now(),
        sender: "BOT",
        quickReplies: response.quick_replies,
      };

      updateMessage(message);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on(serverEvents.DISCONNECT, (_reason) => {
    console.log(_reason);
    updateBotAtom({
      sessionId: null,
      connected: false,
    });
  });

  const sendMessage = (payload: MessagePayload) => {
    const { label, value } = payload;

    // FIXME: do something when disconnected
    if (socket.disconnected) {
      updateBotAtom({
        connected: false,
      });
    }

    const sessionId = botStore.get(botAtom).sessionId;

    // NOTE: Update the language if needed in the future
    socket.emit(userEvents.USER_UTTERED, {
      message: value,
      customData: { language: "en" },
      session_id: sessionId,
    });

    const message: Message = {
      id: nanoid(),
      text: label,
      timestamp: Date.now(),
      sender: "CLIENT",
      type: "TEXT",
      value,
    };

    updateMessage(message);
  };

  const destroy = () => {
    socket.close();
  };

  return {
    sendMessage,
    destroy,
  };
};
