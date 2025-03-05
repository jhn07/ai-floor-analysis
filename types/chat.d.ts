export interface ChatMessage {
  id: string | number;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
}

export type Message = ChatMessage;

