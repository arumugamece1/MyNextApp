import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  ConnectionQuality,
  LiveAvatarSession,
  SessionState,
  SessionEvent,
  VoiceChatEvent,
  VoiceChatState,
  AgentEventsEnum,
  VoiceChatConfig,
} from '@heygen/liveavatar-web-sdk';
import { LiveAvatarSessionMessage, MessageSender } from './types';

type LiveAvatarContextProps = {
  sessionRef: React.RefObject<LiveAvatarSession>;

  isMuted: boolean;
  voiceChatState: VoiceChatState;

  sessionState: SessionState;
  isStreamReady: boolean;
  connectionQuality: ConnectionQuality;

  isUserTalking: boolean;
  isAvatarTalking: boolean;

  messages: LiveAvatarSessionMessage[];
};

export const LiveAvatarContext = createContext<LiveAvatarContextProps>({
  sessionRef: {
    current: null,
  } as unknown as React.RefObject<LiveAvatarSession>,
  connectionQuality: ConnectionQuality.UNKNOWN,
  isMuted: true,
  voiceChatState: VoiceChatState.INACTIVE,
  sessionState: SessionState.DISCONNECTED,
  isStreamReady: false,
  isUserTalking: false,
  isAvatarTalking: false,
  messages: [],
});

type LiveAvatarContextProviderProps = {
  children: React.ReactNode;
  sessionAccessToken: string;
  voiceChatConfig?: boolean | VoiceChatConfig;
};

const useSessionState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [sessionState, setSessionState] = useState<SessionState>(
    sessionRef.current?.state || SessionState.INACTIVE
  );
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    sessionRef.current?.connectionQuality || ConnectionQuality.UNKNOWN
  );
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

  useEffect(() => {
    if (sessionRef.current) {
      sessionRef.current.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
        setSessionState(state);
        if (state === SessionState.DISCONNECTED) {
          sessionRef.current.removeAllListeners();
          sessionRef.current.voiceChat.removeAllListeners();
          setIsStreamReady(false);
        }
      });
      sessionRef.current.on(SessionEvent.SESSION_STREAM_READY, () => {
        setIsStreamReady(true);
      });
      sessionRef.current.on(SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED, setConnectionQuality);
    }
  }, [sessionRef]);

  return { sessionState, isStreamReady, connectionQuality };
};

const useVoiceChatState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isMuted, setIsMuted] = useState(true);
  const [voiceChatState, setVoiceChatState] = useState<VoiceChatState>(
    sessionRef.current?.voiceChat.state || VoiceChatState.INACTIVE
  );

  useEffect(() => {
    if (sessionRef.current) {
      sessionRef.current.voiceChat.on(VoiceChatEvent.MUTED, () => {
        setIsMuted(true);
      });
      sessionRef.current.voiceChat.on(VoiceChatEvent.UNMUTED, () => {
        setIsMuted(false);
      });
      sessionRef.current.voiceChat.on(VoiceChatEvent.STATE_CHANGED, setVoiceChatState);
    }
  }, [sessionRef]);

  return { isMuted, voiceChatState };
};

const useTalkingState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  useEffect(() => {
    if (sessionRef.current) {
      sessionRef.current.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
        setIsUserTalking(true);
      });
      sessionRef.current.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
        setIsUserTalking(false);
      });
      sessionRef.current.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        setIsAvatarTalking(true);
      });
      sessionRef.current.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        setIsAvatarTalking(false);
      });
    }
  }, [sessionRef]);

  return { isUserTalking, isAvatarTalking };
};

const useChatHistoryState = (
  sessionRef: React.RefObject<LiveAvatarSession>,
  isUserTalking: boolean,
  isAvatarTalking: boolean
) => {
  const [messages, setMessages] = useState<LiveAvatarSessionMessage[]>([]);
  const currentSenderRef = useRef<MessageSender | null>(null);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    const handleMessage = (sender: MessageSender, text: string) => {
      // console.log("TEXT:", text);
      // console.log("SENDER:", sender);
      if (!text) return;

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        const shouldMerge =
          currentSenderRef.current === sender &&
          lastMessage &&
          ((sender === MessageSender.AVATAR && isAvatarTalking) ||
            (sender === MessageSender.USER && isUserTalking));

        if (shouldMerge) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              message: lastMessage.message + text,
            },
          ];
        }

        currentSenderRef.current = sender;

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender,
            message: text,
            timestamp: Date.now(),
          },
        ];
      });
    };

    const handleUserTranscription = (data: any) => {
      handleMessage(MessageSender.USER, data?.text || '');
    };

    const handleAvatarTranscription = (data: any) => {
      handleMessage(MessageSender.AVATAR, data?.text || '');
    };

    //  Correct events for your SDK
    session.on(AgentEventsEnum.USER_TRANSCRIPTION, handleUserTranscription);

    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, handleAvatarTranscription);

    return () => {
      session.off(AgentEventsEnum.USER_TRANSCRIPTION, handleUserTranscription);
      session.off(AgentEventsEnum.AVATAR_TRANSCRIPTION, handleAvatarTranscription);
    };
  }, [sessionRef]);

  return { messages };
};

export const LiveAvatarContextProvider = ({
  children,
  sessionAccessToken,
  voiceChatConfig = true,
}: LiveAvatarContextProviderProps) => {
  // Default voice chat on
  const config = {
    voiceChat: voiceChatConfig,
    apiUrl: process.env.API_URL,
  };
  const sessionRef = useRef<LiveAvatarSession>(new LiveAvatarSession(sessionAccessToken, config));
  const { sessionState, isStreamReady, connectionQuality } = useSessionState(sessionRef);

  const { isMuted, voiceChatState } = useVoiceChatState(sessionRef);
  const { isUserTalking, isAvatarTalking } = useTalkingState(sessionRef);
  const { messages } = useChatHistoryState(sessionRef, isUserTalking, isAvatarTalking);

  return (
    <LiveAvatarContext.Provider
      value={{
        sessionRef,
        sessionState,
        isStreamReady,
        connectionQuality,
        isMuted,
        voiceChatState,
        isUserTalking,
        isAvatarTalking,
        messages, // TODO - properly implement chat history
      }}
    >
      {children}
    </LiveAvatarContext.Provider>
  );
};

export const useLiveAvatarContext = () => {
  return useContext(LiveAvatarContext);
};
