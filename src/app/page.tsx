import { promises as fs } from 'fs';
import path from 'path';
import ChatDisplay from '@/components/ChatDisplay';
import { parseChat } from '@/utils/chatParser';

async function readChatData() {
  // Use absolute path for chat directory
  const chatDirPath = path.resolve(process.cwd(), '..', 'KakaoTalk_Chats_2025-04-21_10.26.15_-1434401820');
  const chatFilePath = path.join(chatDirPath, 'KakaoTalkChats.txt');
  const chatText = await fs.readFile(chatFilePath, 'utf8');
  
  // Parse the chat data
  const chatData = parseChat(chatText);
  
  return {
    chatDirPath,
    chatData
  };
}

export default async function Home() {
  const { chatDirPath, chatData } = await readChatData();
  
  // Create symbolic link for images if it doesn't exist
  const publicPath = path.join(process.cwd(), 'public');
  const chatImagesPath = path.join(publicPath, 'chat-images');
  
  try {
    // Remove existing symbolic link if it exists
    try {
      const stats = await fs.lstat(chatImagesPath);
      if (stats.isSymbolicLink()) {
        await fs.unlink(chatImagesPath);
      }
    } catch (e) {
      // Ignore errors if the path doesn't exist
    }

    // Create public directory if it doesn't exist
    try {
      await fs.access(publicPath);
    } catch {
      await fs.mkdir(publicPath);
    }
    
    // Create symbolic link using absolute paths
    await fs.symlink(path.resolve(chatDirPath), path.resolve(chatImagesPath), 'dir');
    
    // Log for debugging
    console.log('Chat images directory linked:', {
      source: path.resolve(chatDirPath),
      target: path.resolve(chatImagesPath)
    });
  } catch (error) {
    console.error('Error setting up chat images:', error);
  }
  
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <ChatDisplay 
        title={chatData.title}
        date={chatData.date}
        messages={chatData.messages}
        chatDirPath={chatDirPath}
      />
    </main>
  );
}
