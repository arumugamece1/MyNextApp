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
  Tooltip,
} from '@mantine/core';
import {
  IconMessageCircle,
  IconX,
  IconSend,
  IconMicrophone,
  IconPhoneOutgoing,
  IconPhoneOff,
} from '@tabler/icons-react';
import { useConversation } from '@elevenlabs/react';
import { useEffect, useRef, useState } from 'react';
import classes from '@/components/chat/chatwidget.module.scss';

type ChatMessage = {
  role: 'user' | 'agent';
  message: string;
};

export function ChatWidget() {
  const [isWidgetOpen, setOpened] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [micMuted, setIsMicMute] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

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
        setMessages((prev) => [...prev, { role: 'agent', message: msg.message }]);
      }

      // Handle user transcript
      if (msg?.role === 'user' && msg?.message) {
        setMessages((prev) => [...prev, { role: 'user', message: msg.message }]);
      }
    },
    micMuted,
  });

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!isWidgetOpen) return;
    if (conversation.status === 'disconnected') {
      conversation.startSession({
        agentId: 'agent_0101kjs4zjkaeheabyj81h4v12gn',
        connectionType: 'websocket',
      });
    }
  }, [isWidgetOpen]);

  useEffect(() => {
    if (!isVoiceMode) {
      setIsMicMute(true);
      return;
    }
    if (conversation.isSpeaking) {
      setIsMicMute(true);
    } else {
      setIsMicMute(false);
    }
  }, [conversation.isSpeaking, isVoiceMode]);

  const startVoice = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicMute(false);
    } catch (err) {
      console.error('Mic permission denied');
    }
  };

  const stopVoice = () => {
    setIsMicMute(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (conversation.status !== 'connected') return;

    conversation.sendUserMessage(input);
    setMessages((prev) => [...prev, { role: 'user', message: input }]);
    setIsTyping(false);
    setInput('');
  };

  const handleToggleVoice = async () => {
    if (isVoiceMode) {
      stopVoice();
    } else {
      await startVoice();
    }
    setIsVoiceMode((prev) => !prev);
  };

  const handleToggleMic = () => {
    setIsMicMute((prev) => !prev);
  };

  const handleClose = async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
    }
    setOpened(false);
    setIsMicMute(true);
    setIsVoiceMode(false);
  };

  const conversationState = (() => {
    if (conversation.status !== 'connected') return null;
    if (conversation.isSpeaking) return 'ai-speaking';
    if (isVoiceMode && !micMuted) return 'user-speaking';
    if (!isVoiceMode && isTyping) return 'user-typing';
    return null;
  })();

  return (
    <>
      {!isWidgetOpen && (
        <div className={classes.floatingWrapper}>
          <Tooltip
            label="Need help? Chat with Mahe 👋"
            position="top-start"
            target="#chat-help"
          ></Tooltip>
          <ActionIcon
            id="chat-help"
            aria-label="Open chat"
            size={60}
            radius="xl"
            variant="filled"
            className={classes.floatingButton}
            onClick={() => setOpened(true)}
          >
            <IconMessageCircle size={30} />
          </ActionIcon>
        </div>
      )}

      {isWidgetOpen && (
        <Paper shadow="lg" radius="md" withBorder className={classes.glassContainer}>
          {/* Header */}
          <Group justify="space-between" p="sm" className={classes.chatHeader}>
            <Text fw={600} className={classes.headerTitle}>
              AI Assistant
            </Text>
            <ActionIcon variant="subtle" className={classes.headerClose} onClick={handleClose}>
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
            </Stack>

            <Stack>
              <Space h="xs" />

              {conversationState === 'ai-speaking' && (
                <Box className={classes.statusBubble}>
                  <Text size="sm">User Listening...</Text>
                </Box>
              )}

              {conversationState === 'user-speaking' && (
                <Box className={classes.statusBubble}>
                  <Text size="sm">AI Listening...</Text>
                </Box>
              )}

              {conversationState === 'user-typing' && (
                <Box className={classes.statusBubble}>
                  <Text size="sm">Typing...</Text>
                </Box>
              )}
            </Stack>
          </ScrollArea>

          {/* Footer */}
          <Group p="sm" className={classes.footer}>
            <TextInput
              className={classes.glassInput}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => {
                setInput(e.currentTarget.value);
                conversation.sendUserActivity();
                setIsTyping(true);
                setIsMicMute(true);
              }}
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <ActionIcon
              variant="filled"
              className={classes.iconButton}
              onClick={handleSend}
              disabled={conversation.isSpeaking}
            >
              <IconSend size={18} />
            </ActionIcon>
            {!isVoiceMode ? (
              <ActionIcon
                variant="filled"
                className={classes.iconButton}
                disabled={conversation.isSpeaking}
                onClick={handleToggleVoice}
              >
                <IconPhoneOutgoing size={18} />
              </ActionIcon>
            ) : (
              <Group gap="xs">
                <ActionIcon
                  variant="filled"
                  className={`${classes.iconButton} ${micMuted ? classes.muted : classes.active}`}
                  disabled={conversation.isSpeaking}
                  onClick={handleToggleMic}
                >
                  <IconMicrophone size={18} />
                </ActionIcon>

                <ActionIcon
                  variant="filled"
                  className={`${classes.iconButton} ${classes.endCall}`}
                  disabled={conversation.isSpeaking}
                  onClick={handleToggleVoice}
                >
                  <IconPhoneOff size={18} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        </Paper>
      )}
    </>
  );
}
