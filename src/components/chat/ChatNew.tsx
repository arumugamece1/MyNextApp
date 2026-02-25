'use client';
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconX,
  IconSend,
  IconMicrophone,
  IconPhoneOutgoing,
  IconPhoneOff,
} from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import classes from '@/components/chat/chatnew.module.scss';
type ChatMessage = {
  role: 'user' | 'agent';
  message: string;
};
type ChatNewProps = {
  messages: ChatMessage[];
  onSentUserMessage: (msg: ChatMessage) => void;
  micMuted: boolean;
  setMicMuted: React.Dispatch<React.SetStateAction<boolean>>;
  sendUserMessage: (text: string) => void;
  sendUserActivity: () => void;
  endSession: () => Promise<void>;
  status: string;
  isSpeaking: boolean;
};

export const ChatNew: React.FC<ChatNewProps> = React.memo(
  ({
    messages,
    onSentUserMessage,
    micMuted,
    setMicMuted,
    sendUserMessage,
    sendUserActivity,
    status,
    isSpeaking,
    endSession,
  }) => {
    const [input, setInput] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Auto Scroll
    useEffect(() => {
      viewportRef.current?.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, [messages]);

    // Auto mute while AI speaking
    useEffect(() => {
      if (!isVoiceMode) {
        setMicMuted(true);
        return;
      }
      if (isSpeaking) {
        setMicMuted(true);
      } else {
        setMicMuted(false);
      }
    }, [isSpeaking, isVoiceMode]);
    const handleSend = () => {
      if (!input.trim()) return;
      if (status !== 'connected') return;

      sendUserMessage(input);
      onSentUserMessage({ role: 'user', message: input });
      // setMessages((prev) => [...prev, { role: 'user', message: input }]);
      setInput('');
      setIsTyping(false);
    };

    const startVoice = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicMuted(false);
      } catch (err) {
        console.error('Mic permission denied');
      }
    };

    const handleToggleVoice = async () => {
      if (isVoiceMode) {
        setMicMuted(true);
      } else {
        await startVoice();
      }
      setIsVoiceMode((prev) => !prev);
    };

    const handleClose = async () => {
      if (status === 'connected') {
        await endSession();
      }
      setIsVoiceMode(false);
      setMicMuted(true);
    };

    const conversationState = (() => {
      if (status !== 'connected') return null;
      if (isSpeaking) return 'ai-speaking';
      if (isVoiceMode && !micMuted) return 'user-speaking';
      if (!isVoiceMode && isTyping) return 'user-typing';
      return null;
    })();

    return (
      <>
        <Paper className={classes.glassContainer}>
          {/* Header */}
          <Group justify="space-between" p="sm" className={classes.chatHeader}>
            <Text fw={600} c="white">
              AI Assistant
            </Text>
            <ActionIcon variant="subtle" color="white" onClick={handleClose}>
              <IconX size={18} />
            </ActionIcon>
          </Group>

          {/* Messages */}
          <ScrollArea flex={1} p="sm" viewportRef={viewportRef}>
            <Stack>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  className={msg.role === 'user' ? classes.userBubble : classes.agentBubble}
                >
                  <Text size="sm">{msg.message}</Text>
                </Box>
              ))}

              {/* Status */}
              {conversationState && (
                <Box className={classes.statusBubble}>
                  <Text size="xs">
                    {conversationState === 'ai-speaking' && 'User Listening...'}
                    {conversationState === 'user-speaking' && 'AI Listening...'}
                    {conversationState === 'user-typing' && 'Typing...'}
                  </Text>
                </Box>
              )}
            </Stack>
            <Space h="sm" />
          </ScrollArea>

          {/* Footer */}
          <Group p="sm" className={classes.footer}>
            <TextInput
              placeholder="Type a message..."
              value={input}
              className={classes.glassInput}
              onChange={(e) => {
                setInput(e.currentTarget.value);
                sendUserActivity();
                setIsTyping(true);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <ActionIcon className={classes.iconButton} onClick={handleSend} disabled={isSpeaking}>
              <IconSend size={18} />
            </ActionIcon>

            {!isVoiceMode ? (
              <ActionIcon className={classes.iconButton} onClick={handleToggleVoice}>
                <IconPhoneOutgoing size={18} />
              </ActionIcon>
            ) : (
              <>
                <ActionIcon
                  className={`${classes.iconButton} ${micMuted ? classes.muted : classes.active}`}
                  onClick={() => setMicMuted((prev) => !prev)}
                >
                  <IconMicrophone size={18} />
                </ActionIcon>

                <ActionIcon
                  className={`${classes.iconButton} ${classes.endCall}`}
                  onClick={handleToggleVoice}
                >
                  <IconPhoneOff size={18} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Paper>
      </>
    );
  }
);
