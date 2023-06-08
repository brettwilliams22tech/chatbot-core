import React, { useContext, useEffect, useRef } from "react";
import { Provider } from "jotai";

import { createBotClient } from "./createBotClient";

import { botStore } from "./store";

import { ChatBotClient, BotClientOptions } from "./types";

const ChatBotContext = React.createContext<ChatBotClient | null>(null);

type Props = { options: BotClientOptions; children: any };

const withProvider = (Component: any) => {
  return (props: Props) => {
    return (
      <Provider store={botStore}>
        <Component {...props} />
      </Provider>
    );
  };
};

export const ChatBotProvider = withProvider((props: Props) => {
  const { options } = props;
  const optionsRef = useRef<BotClientOptions>(options);
  const clientRef = useRef<ChatBotClient>(createBotClient(options));

  useEffect(() => {
    if (
      options.socketUrl !== optionsRef.current?.socketUrl ||
      options.path !== optionsRef.current?.path
    ) {
      console.log("inside");

      clientRef.current = createBotClient(props.options);
      optionsRef.current = options;
    }

    return () => {
      console.log("destroyed...");

      clientRef.current?.destroy();
    };
  }, [options.socketUrl, options.path]);

  return (
    <ChatBotContext.Provider value={clientRef.current!}>
      {props.children}
    </ChatBotContext.Provider>
  );
});

export const useBotClient = (): ChatBotClient => {
  const client = useContext(ChatBotContext)!;

  if (!client) {
    throw Error("Context Provider not found");
  }

  return client;
};
