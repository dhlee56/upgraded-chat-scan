export interface ChatMessage {
  timestamp: string;
  sender?: string;
  content: string;
  isImage: boolean;
}

export interface ChatData {
  title: string;
  date: string;
  messages: ChatMessage[];
} 