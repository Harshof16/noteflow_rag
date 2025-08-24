"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
} from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from '@/components/ai-elements/prompt-input';
import { Source } from '@/components/ai-elements/source';
import { Loader } from '@/components/ai-elements/loader';
import { Actions } from '@/components/ai-elements/actions';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { DocumentIcon } from '@/lib/icons/icons';
import { useChat } from '@ai-sdk/react';
import axios from 'axios';
import { formatTime } from '@/lib/utils';
import { Bot, Clock, Copy, File, RotateCcw, User } from 'lucide-react';

const Chat = ({ currentNotebook, setNotebooks }) => {
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState(currentNotebook?.messages || [])
  const [isLoading, setisLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(currentNotebook?.messages || [])
  }, [currentNotebook?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  console.log('currentNotebook', currentNotebook)
  console.log('input', input)
  console.log('messages', messages)


  const handleMessageUpdate = (assistantMessage) => {
    // const newMessage = { role: "assistant", content: assistantMessage };
    setMessages(prev => [...prev, assistantMessage]);
    setNotebooks(prev =>
      prev.map(nb =>
        nb.id === currentNotebook?.id ? { ...nb, messages: [...nb.messages, assistantMessage] } : nb
      )
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();

    const newMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    };

    setInput("");

    setMessages(prev => [...prev, newMessage]);
    // also sync to notebook
    setNotebooks(prev =>
      prev.map(nb =>
        nb.id === currentNotebook?.id
          ? { ...nb, messages: [...nb.messages, newMessage] }
          : nb
      )
    );

    try {
      setisLoading(true);
      const response = await axios.post('api/chat', { messages, query: userInput })
      console.log('response', response)
      if (response?.data?.message) {
        handleMessageUpdate(response?.data?.message)
      }
    } catch (error) {
      console.log(`it's an error`)
    } finally {
      setisLoading(false);
    }

  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  console.log('input', input)
  return (
    <div className="flex-1 p-6 flex flex-col h-99">
      {messages?.length === 0 ? (
        /* Welcome Message */
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl text-center">
            {/* <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <DocumentIcon className="w-6 h-6 text-gray-400" />
            </div> */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {currentNotebook?.sources?.length > 0
                ? "Based on your uploaded sources, I can help you understand the key concepts. The documents contain relevant information about your query, and I've extracted the most pertinent details to provide you with an accurate response."
                : "Start by adding some sources to this notebook, then ask me anything about your materials. I'll help you understand and analyze the content."
              }
            </p>

            {currentNotebook?.sources?.length > 0 && (
              <div className="mt-6">
                <div className="text-sm text-gray-500 mb-2">Sources:</div>
                <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
                  {currentNotebook.sources?.map((source) => (
                    <Source
                      key={source.id}
                      title={source.name}
                    // variant="pill"
                    // className="bg-gray-100 px-6 py-1 rounded-full text-gray-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full overflow-y-auto">
            <div className="mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    ref={messagesEndRef}
                >

                  <div className={`max-w-[75%] ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                    } rounded-xl p-4 transition-all hover:shadow-md`}>

                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {message.role === 'user' ? (
                          <User size={14} className="text-blue-100" />
                        ) : (
                          <Bot size={14} className="text-blue-600" />
                        )}
                        <span className={`text-xs font-semibold uppercase tracking-wide ${message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-600'
                          }`}>
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        {message.role === 'assistant' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>

                      {message.timestamp && (
                        <div className={`flex items-center gap-1 text-xs ${message.role === 'user'
                          ? 'text-blue-200'
                          : 'text-gray-400'
                          }`}>
                          <Clock size={12} />
                          <span>{formatTimestamp(message.timestamp)}</span>
                        </div>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto prose prose-gray whitespace-pre-wrap">
                      <Response>{message.content}</Response>
                    </div>

                    {/* Sources Section */}
                    {message.role === 'assistant' && message.sources && message.sources?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <File size={14} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Sources
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.sources?.map((source, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-xs text-gray-600 transition-colors cursor-pointer"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span className="font-medium">{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {message.role === 'assistant' && (
                      <div className="mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Copy size={12} />
                            {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                          </button>
                          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                            <RotateCcw size={12} />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Bot size={14} className="text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        Assistant is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bot size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Ask me anything about your documents or code. I'm here to help!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area using AI Elements PromptInput */}
      {currentNotebook?.sources?.length > 0 && <div className="mt-auto">
        <PromptInput onSubmit={handleFormSubmit} className="mt-4 relative">
          <PromptInputTextarea onChange={e => setInput(e.target.value)} value={input} />
          <PromptInputToolbar>
            <PromptInputSubmit
              className="absolute right-1 bottom-1"
              disabled={false}
              status={'ready'}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>}
    </div>
  )
}

export default Chat