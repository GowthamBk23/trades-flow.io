'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { supabase } from '@/utils/supabase';

interface Message {
  id: string;
  user_id: string;
  text: string;
  chat_type: 'staff' | 'client';
  group_name: string;
  created_at: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [chatType, setChatType] = useState<'staff' | 'client'>('staff');
  const [group, setGroup] = useState('General');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_type', chatType)
          .eq('group_name', group)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages for the current group
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_type=eq.${chatType} AND group_name=eq.${group}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.group_name === group) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chatType, group]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;

    try {
      setError(null);
      const newMessage = {
        text: messageText,
        user_id: user.id,
        chat_type: chatType,
        group_name: chatType === 'staff' ? group : null
      };

      const { error: insertError } = await supabase
        .from('messages')
        .insert([newMessage]);

      if (insertError) throw insertError;
      setMessageText('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      {/* Chat sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chats</h2>
          <div className="space-y-2">
            <button
              onClick={() => setChatType('staff')}
              className={`w-full text-left px-4 py-2 rounded ${
                chatType === 'staff' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Staff Chat
            </button>
            <button
              onClick={() => setChatType('client')}
              className={`w-full text-left px-4 py-2 rounded ${
                chatType === 'client' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Client Chat
            </button>
          </div>

          {chatType === 'staff' && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Groups</h3>
              <div className="space-y-1">
                {['General', 'HR', 'Management'].map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => setGroup(groupName)}
                    className={`w-full text-left px-4 py-2 rounded ${
                      group === groupName 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {groupName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat main area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chatType === 'staff' ? `Staff Chat - ${group}` : 'Client Chat'}
          </h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                      message.user_id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-4">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 rounded-lg border dark:border-gray-600 px-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 