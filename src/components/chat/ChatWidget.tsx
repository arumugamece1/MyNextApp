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
    //  textOnly: true, // Text only mode No voice
  });

  // Auto scroll
  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);
  // Start session ONLY when widget opens
  useEffect(() => {
    console.log('ssss', conversation.status);
    if (!isWidgetOpen) return;
    if (conversation.status === 'disconnected') {
      conversation.startSession({
        agentId: 'agent_5101kht2akjtefw81my73yshmj0e', //agent_5401khrf019kfdqv0g8e49xs898q //agent_4401khqh4g71ej2a4wjqxjpctbrd
        connectionType: 'websocket',
      });
    }
  }, [isWidgetOpen]);

  useEffect(() => {
    console.log('Conversation', conversation.isSpeaking, conversation);
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
  // Start voice session
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

  // Send text message
  const handleSend = () => {
    if (!input.trim()) return;
    if (conversation.status !== 'connected') {
      return;
    }
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

    // AI speaking
    if (conversation.isSpeaking) return 'ai-speaking';

    // Voice mode → user speaking
    if (isVoiceMode && !micMuted) return 'user-speaking';

    // Text mode typing
    if (!isVoiceMode && isTyping) return 'user-typing';

    return null;
  })();

  return (
    <>
      {!isWidgetOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
          <ActionIcon
            aria-label="Open chat"
            size={60}
            radius="xl"
            variant="filled"
            color="orange"
            onClick={() => setOpened(true)}
          >
            <IconMessageCircle size={30} />
          </ActionIcon>
        </div>
      )}

      {/* Chat Window */}
      {isWidgetOpen && (
        <Paper
          shadow="lg"
          radius="md"
          withBorder
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <Group justify="space-between" p="sm" className={classes['chat-header']}>
            <Text fw={600} c="white">
              AI Assistant
            </Text>
            <ActionIcon color="white" variant="subtle" onClick={handleClose}>
              <IconX size={18} />
            </ActionIcon>
          </Group>

          {/* Messages */}
          <ScrollArea flex={1} p="sm" viewportRef={viewportRef}>
            <Stack>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  p="xs"
                  bg={msg.role === 'user' ? 'orange.5' : 'gray.1'}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    borderRadius: 8,
                    maxWidth: '80%',
                    color: msg.role === 'user' ? 'white' : 'black',
                  }}
                >
                  <Text size="sm">{msg.message}</Text>
                </Box>
              ))}
            </Stack>
            <Stack>
              <Space h="xs" />
              {/* Conversation Status Bubble */}
              {conversationState === 'ai-speaking' && (
                <Box
                  p="xs"
                  bg="gray.2"
                  style={{
                    alignSelf: 'flex-end',
                    borderRadius: 8,
                    maxWidth: '70%',
                    opacity: 0.8,
                  }}
                >
                  <Text size="sm">User Listening...</Text>
                </Box>
              )}

              {conversationState === 'user-speaking' && (
                <Box
                  p="xs"
                  bg="blue.0"
                  style={{
                    alignSelf: 'flex-start',
                    borderRadius: 8,
                    maxWidth: '70%',
                    opacity: 0.8,
                  }}
                >
                  <Text size="sm">AI Listening...</Text>
                </Box>
              )}

              {conversationState === 'user-typing' && (
                <Box
                  p="xs"
                  bg="blue.0"
                  style={{
                    alignSelf: 'flex-end',
                    borderRadius: 8,
                    maxWidth: '70%',
                    opacity: 0.8,
                  }}
                >
                  <Text size="sm">Typing...</Text>
                </Box>
              )}
            </Stack>
          </ScrollArea>

          {/* Footer */}
          <Group p="sm">
            <TextInput
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
              color="blue"
              variant="filled"
              onClick={handleSend}
              disabled={conversation.isSpeaking}
            >
              <IconSend size={18} />
            </ActionIcon>
            {!isVoiceMode ? (
              <ActionIcon
                color="blue"
                disabled={conversation.isSpeaking}
                variant="filled"
                onClick={handleToggleVoice}
              >
                <IconPhoneOutgoing size={18} />
              </ActionIcon>
            ) : (
              <Group>
                <ActionIcon
                  color={micMuted ? 'red' : 'green'}
                  disabled={conversation.isSpeaking}
                  variant="filled"
                  onClick={handleToggleMic}
                >
                  <IconMicrophone size={18} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  disabled={conversation.isSpeaking}
                  variant="filled"
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
