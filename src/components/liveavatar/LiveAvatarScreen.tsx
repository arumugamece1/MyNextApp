'use client';

import { Badge, Box, Button, LoadingOverlay } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { useSession, useTextChat, useVoiceChat, LiveAvatarContextProvider } from '../../liveavatar';
import { SessionState, VoiceChatConfig } from '@heygen/liveavatar-web-sdk';
import { useAvatarActions } from '@/liveavatar/useAvatarActions';
import { useDisclosure } from '@mantine/hooks';
import clasess from '@/components/liveavatar/liveavatar.module.scss';
export type SessionMode = 'FULL' | 'FULL_PTT' | 'LITE';
const LiveAvatarSessionComponent: React.FC<{
  mode: SessionMode;
  onSessionStopped: () => void;
  onAvatarConnected: () => void;
  chatMessage: string;
}> = ({ mode, onSessionStopped, chatMessage, onAvatarConnected }) => {
  const [visible, { toggle }] = useDisclosure(true);
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    connectionQuality,
    attachElement,
  } = useSession();
  const { isAvatarTalking, isUserTalking } = useVoiceChat();

  // For useAvatarActions, treat FULL_PTT as FULL since they share the same API
  const avatarActionsMode = mode === 'FULL_PTT' ? 'FULL' : mode;
  const { interrupt, repeat } = useAvatarActions(avatarActionsMode);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    } else {
      toggle();
      onAvatarConnected();
    }
  }, [startSession, sessionState]);
  useEffect(() => {
    if (!chatMessage) return;
    console.log('message from chat', chatMessage);
    repeat(chatMessage);
  }, [chatMessage]);

  return (
    <div className={clasess.videoBox}>
      <Box pos="relative">
        <LoadingOverlay
          visible={visible}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'pink', type: 'bars' }}
          className={clasess.loadingDiv}
        />
        <video ref={videoRef} autoPlay playsInline className={clasess.videoElement} />
        <Button
          variant="outline"
          color="red"
          className={clasess.connectionEndBtn}
          onClick={() => stopSession()}
        >
          Stop
        </Button>
        <div className={clasess.connectionStatus}>
          <div>
            {sessionState === 'INACTIVE' ? (
              <Badge color="gray" size="sm">
                {sessionState}
              </Badge>
            ) : sessionState === 'CONNECTING' ? (
              <Badge color="yellow" size="sm">
                {sessionState}
              </Badge>
            ) : (
              <Badge color="green" size="sm">
                {sessionState}
              </Badge>
            )}
          </div>
          <p>Connection quality: {connectionQuality}</p>
          {(mode === 'FULL' || mode === 'FULL_PTT') && (
            <p>User talking: {isUserTalking ? 'true' : 'false'}</p>
          )}
          <p>Avatar talking: {isAvatarTalking ? 'true' : 'false'}</p>
        </div>
      </Box>
    </div>
  );
};

export const LiveAvatarScreen: React.FC<{
  mode: SessionMode;
  sessionAccessToken: string;
  onSessionStopped: () => void;
  onAvatarConnected: () => void;
  voiceChatConfig?: boolean | VoiceChatConfig;
  chatMessage: string;
}> = ({
  mode,
  sessionAccessToken,
  onSessionStopped,
  voiceChatConfig,
  chatMessage,
  onAvatarConnected,
}) => {
  return (
    <LiveAvatarContextProvider
      sessionAccessToken={sessionAccessToken}
      voiceChatConfig={voiceChatConfig}
    >
      <LiveAvatarSessionComponent
        mode={mode}
        onSessionStopped={onSessionStopped}
        onAvatarConnected={onAvatarConnected}
        chatMessage={chatMessage}
      ></LiveAvatarSessionComponent>
    </LiveAvatarContextProvider>
  );
};
