interface ChatMessage {
  timestamp: string;
  sender?: string;
  content: string;
  isImage: boolean;
}

interface ChatData {
  title: string;
  date: string;
  messages: ChatMessage[];
}

export function parseChat(text: string): ChatData {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Extract title and date from first two lines
  const title = lines[0];
  const date = lines[1].replace('저장한 날짜 : ', '');
  
  const messages: ChatMessage[] = [];
  let currentMessage: Partial<ChatMessage> = {};
  
  // Start from line 3 (index 2) to skip title and date
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is a timestamp (now includes time format)
    const timestampPattern = /^\d{4}년 \d{1,2}월 \d{1,2}일( 오[전후] \d{1,2}:\d{2})?/;
    if (line.match(timestampPattern)) {
      if (currentMessage.timestamp) {
        // If we have a message in progress, save it
        if (currentMessage.content) {
          messages.push(currentMessage as ChatMessage);
        }
        currentMessage = {};
      }
      
      // If line contains sender, extract it
      if (line.includes(' : ')) {
        const [timestampWithSender, content] = line.split(' : ');
        const lastCommaIndex = timestampWithSender.lastIndexOf(',');
        
        if (lastCommaIndex !== -1) {
          const timestamp = timestampWithSender.substring(0, lastCommaIndex);
          const sender = timestampWithSender.substring(lastCommaIndex + 1).trim();
          currentMessage = { 
            timestamp, 
            sender, 
            content: content || '', 
            isImage: false 
          };
        } else {
          currentMessage = { 
            timestamp: timestampWithSender, 
            content: content || '', 
            isImage: false 
          };
        }
      } else {
        currentMessage = { timestamp: line, content: '', isImage: false };
      }
      continue;
    }
    
    // If line starts with <사진 or <동영상, mark as image/video
    if (line.startsWith('<사진') || line.startsWith('<동영상')) {
      if (currentMessage.timestamp) {
        currentMessage.isImage = true;
        currentMessage.content = line;
        messages.push(currentMessage as ChatMessage);
        currentMessage = {};
      }
      continue;
    }
    
    // Add line to current message content
    if (currentMessage.timestamp) {
      if (currentMessage.content) {
        currentMessage.content += '\n' + line;
      } else {
        currentMessage.content = line;
      }
    }
  }
  
  // Add final message if exists
  if (currentMessage.timestamp && currentMessage.content) {
    messages.push(currentMessage as ChatMessage);
  }
  
  return {
    title,
    date,
    messages
  };
} 