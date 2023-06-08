declare namespace ChatBotClient {
  function createClient(options: BotClientOptions): ChatBotClient;
}

export type MessagePayload = {
  value: string;
  label: string;
  replyId?: string;
};

export type ChatBotClient = {
  sendMessage: (payload: MessagePayload) => void;
  destroy: () => void;
};

export type BotClientOptions = {
  socketUrl: string;
  path?: string;
};

export type MessageType = "TEXT" | "OPTIONS" | "BUDGET";

export type Message = {
  id: string;
  type: MessageType;
  text: string;
  sender: "BOT" | "CLIENT";
  timestamp: number;
  quickReplies?: QuickReply[];
  showAvatar?: boolean;
  chosenReply?: string;
  value?: string;
};

export type QuickReply = {
  content_type: "text";
  payload: string;
  title: string;
};
