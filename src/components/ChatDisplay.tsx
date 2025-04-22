'use client';

import { ChatMessage } from '@/types/chat';
import ImageDisplay from './ImageDisplay';
import { useEffect, useState } from 'react';

interface ChatDisplayProps {
  title: string;
  date: string;
  messages: ChatMessage[];
  chatDirPath: string;
}

export default function ChatDisplay({ title, date, messages, chatDirPath }: ChatDisplayProps) {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [counter, setCounter] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [displayStartIndex, setDisplayStartIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(event.target.value));
  };
  useEffect(() => {
    // Start with a small number of messages and adjust based on screen height
    const initialMessageCount = 10;
    setVisibleMessages(messages.slice(0, initialMessageCount));
  }, [messages]);

  useEffect(() => {
    if (isCounting && counter < messages.length) {
      const timer = setTimeout(() => {
        setCounter(prev => prev + 1);
      }, 100); // Increment every 100ms
      return () => clearTimeout(timer);
    }
  }, [counter, isCounting, messages.length]);

  // Update visible messages when counting stops
  useEffect(() => {
    
      const startIndex = Math.min(sliderValue, Math.max(0, messages.length - 10));
      setDisplayStartIndex(startIndex);
      setVisibleMessages(messages.slice(startIndex, startIndex + 10));

  }, [sliderValue, messages]);

  // Update visible messages when the slider value changes

  let leftColumnMessages: ChatMessage[] = [];
  let rightColumnMessages: ChatMessage[] = [];

  // Split messages into two columns - left column gets first half, right column gets second half
  const midPoint = Math.ceil(visibleMessages.length / 2);
  leftColumnMessages = visibleMessages.slice(0, midPoint);
  rightColumnMessages = visibleMessages.slice(midPoint);

  const findImagesInContent = (content: string) => {
    // Common image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;

    // Find all filenames that look like image files
    const words = content.split(/\s+/);
    return words.filter(word => imageExtensions.test(word));
  };

  const getImagePath = (filename: string) => {
    // Remove any quotes or special characters from filename
    const cleanFilename = filename.replace(/["']/g, '').replace(/\s+/g, '_');
    return `/chat-images/${encodeURIComponent(cleanFilename)}`;
  };

  const renderTextWithLinks = (text: string) => {
    // Regular expression for matching URLs
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

    // Split the text by URLs and map each part
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    const imageFiles = findImagesInContent(content);

    if (imageFiles.length === 0) {
      return <div className="whitespace-pre-wrap">{renderTextWithLinks(content)}</div>;
    }

    // Remove image filenames from content
    let cleanContent = content;
    imageFiles.forEach(filename => {
      cleanContent = cleanContent.replace(filename, '');
    });
    // Clean up any extra whitespace
    cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

    return (
      <div>
        {cleanContent && (
          <div className="whitespace-pre-wrap mb-4">{renderTextWithLinks(cleanContent)}</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {imageFiles.map((imageFile, index) => (
            <ImageDisplay
              key={index}
              src={getImagePath(imageFile)}
              alt={imageFile}
              filename={imageFile}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMessageColumn = (columnMessages: ChatMessage[]) => {
    let columnCurrentDate = '';

    return columnMessages.map((message, index) => {
      // Extract date from timestamp for date headers
      const dateMatch = message.timestamp.match(/^\d{4}년 \d{1,2}월 \d{1,2}일/);
      const messageDate = dateMatch ? dateMatch[0] : '';
      const showDateHeader = messageDate !== columnCurrentDate;

      if (showDateHeader) {
        columnCurrentDate = messageDate;
      }

      return (
        <div key={index}>
          {showDateHeader && (
            <div className="bg-gray-100 text-gray-600 py-2 px-4 rounded-lg mb-4">
              {messageDate}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm text-gray-500">
                {message.timestamp.replace(messageDate, '').trim()}
              </span>
              {message.sender && (
                <span className="font-medium text-gray-700">
                  {message.sender}
                </span>
              )}
            </div>

            <div className="text-gray-800">
              {renderContent(message.content)}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 h-screen">
      <div className="bg-white shadow-lg mb-4">
        <div className="max-w-[1600px] mx-auto p-4">
          <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
          <h2 className="text-lg text-center text-gray-600 mb-4">{date}</h2>
          <div className="flex justify-center items-center mb-4 w-[100%]">
            <label htmlFor="message-slider">Set Message Start:</label>
            <input
              className="ml-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              id="message-slider"
              type="range"
              min="0"
              max={messages.length - 1}
              value={sliderValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleSliderChange(e) }}
            />
            <span> {sliderValue}</span>
          </div>
          {!isCounting && (
            <div className="text-center text-gray-600 mt-2">
              Showing messages {displayStartIndex + 1}-{Math.min(displayStartIndex + 10, messages.length)} of {messages.length}
            </div>
          )}
        </div>
      </div>

      <div className="block lg:hidden">
        <div className="space-y-4">
          {renderMessageColumn(visibleMessages)}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
        <div className="space-y-4">
          {renderMessageColumn(leftColumnMessages)}
        </div>
        <div className="space-y-4">
          {renderMessageColumn(rightColumnMessages)}
        </div>
      </div>
    </div>
  );
} 