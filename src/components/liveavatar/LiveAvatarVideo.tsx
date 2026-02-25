'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LiveAvatarScreen } from './LiveAvatarScreen';
import { Button } from '@mantine/core';
import clasess from '@/components/liveavatar/liveavatar.module.scss';
import { ChatNew } from '../chat/ChatNew';
import { useConversation } from '@elevenlabs/react';
import { useAvatarActions } from '@/liveavatar/useAvatarActions';
export type SessionMode = 'FULL' | 'FULL_PTT' | 'LITE';
type ChatMessage = {
  role: 'user' | 'agent';
  message: string;
};
export const LiveAvatarVideo = () => {
  const [sessionToken, setSessionToken] = useState('');
  const [mode, setMode] = useState<SessionMode>('LITE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [micMuted, setMicMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setMessage] = useState<string>('');
  const volume = 0;
  const { repeat } = useAvatarActions('LITE');
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
    },
    onDisconnect: () => {
      console.log('Disconnect');
    },
    onError: () => {
      console.log('Error');
    },
    onStatusChange: (status) => {
      console.log(status, 'Statues');
    },
    onMessage: (msg: ChatMessage) => {
      // Handle agent reply
      if (msg?.role === 'agent' && msg?.message) {
        // repeat(msg.message);
        setMessage(msg.message);
        setMessages((prev) => [...prev, { role: 'agent', message: msg.message }]);
      }

      // Handle user transcript
      if (msg?.role === 'user' && msg?.message) {
        setMessages((prev) => [...prev, { role: 'user', message: msg.message }]);
      }
    },
    micMuted,
    volume,
    //  textOnly: true, // Text only mode No voice
  });
  const { sendUserMessage, sendUserActivity, endSession, status, isSpeaking } = conversation;
  // const startedRef = useRef(false);
  // useEffect(() => {
  //   if (!sessionToken) return;
  //   if (startedRef.current) return;
  //   startedRef.current = true;
  //   // conversation.startSession({
  //   //   agentId: 'agent_5001kj9hkhsrege9nd5kn0fkeewm', //agent_5101kht2akjtefw81my73yshmj0e agent_3801kj4y974kf4stc9jtvaqvfqnr agent_5001kj9hkhsrege9nd5kn0fkeewm
  //   //   connectionType: 'websocket',
  //   // });
  // }, [sessionToken]);
  // 🔹 Start Lite Session (Get Token from API)
  const handleStartLiteSession = async () => {
    try {
      const res = await fetch('/api/start-lite-session', {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error);
        return;
      }

      const { session_token } = await res.json();
      setSessionToken(session_token);

      setMode('LITE');
    } catch (err) {
      setError('Failed to start session');
    }
  };
  const handleUserSentMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, { role: 'user', message: msg.message }]);
  }, []);
  const onSessionStopped = async () => {
    // Reset the FE state
    setSessionToken('');
    await endSession();
  };
  const handleAvatarConnected = async () => {
    try {
      await conversation.startSession({
        agentId: 'agent_5001kj9hkhsrege9nd5kn0fkeewm',
        connectionType: 'websocket',
      });

      console.log('ElevenLabs started AFTER avatar ready');
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };
  const voiceChatConfig = true;
  return (
    <>
      <div className={clasess.avatarContainer}>
        <div className={clasess.glassContainer}>
          {sessionToken ? (
            <div className={clasess.mainContainer}>
              <div className={clasess.videoContainer}>
                <LiveAvatarScreen
                  mode={mode}
                  sessionAccessToken={sessionToken}
                  onSessionStopped={onSessionStopped}
                  onAvatarConnected={handleAvatarConnected}
                  voiceChatConfig={voiceChatConfig}
                  chatMessage={chatMessage}
                />
              </div>
              <div className={clasess.chatContainer}>
                <ChatNew
                  sendUserMessage={sendUserMessage}
                  sendUserActivity={sendUserActivity}
                  endSession={endSession}
                  status={status}
                  isSpeaking={isSpeaking}
                  messages={messages}
                  onSentUserMessage={handleUserSentMessage}
                  micMuted={micMuted}
                  setMicMuted={setMicMuted}
                />
              </div>
            </div>
          ) : (
            <div className={clasess.fullmodeContainer}>
              <div>
                <Button onClick={handleStartLiteSession} size="md" color="orange" radius="md">
                  Start Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
