import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Adjust this import to your real file location
import { ChatWidget } from './ChatWidget';

/* ------------------------- CSS module mock ------------------------- */
vi.mock('@/components/chat/chatwidget.module.scss', () => ({
  default: { 'chat-header': 'chat-header' },
}));

/* ------------------------- Mantine mocks -------------------------- */
/**
 * We mock Mantine UI components into simple HTML wrappers
 * so RTL can click/type easily.
 */
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    ActionIcon: ({ children, onClick, disabled, ...rest }: any) => (
      <button type="button" onClick={onClick} disabled={disabled} {...rest}>
        {children}
      </button>
    ),

    Paper: ({ children, ...rest }: any) => (
      <div data-testid="paper" {...rest}>
        {children}
      </div>
    ),
    Box: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    Group: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    Stack: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    Space: ({ ...rest }: any) => <div {...rest} />,

    Text: ({ children, ...rest }: any) => <span {...rest}>{children}</span>,

    TextInput: ({ value, onChange, onKeyDown, placeholder, ...rest }: any) => (
      <input
        {...rest}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    ),

    // IMPORTANT: ScrollArea must forward viewportRef to a real element
    ScrollArea: ({ children, viewportRef, ...rest }: any) => (
      <div data-testid="scrollarea" ref={viewportRef} {...rest}>
        {children}
      </div>
    ),
  };
});

/* ------------------------- Icon mocks ----------------------------- */
vi.mock('@tabler/icons-react', () => ({
  IconMessageCircle: () => <svg data-testid="icon-chat" />,
  IconX: () => <svg data-testid="icon-x" />,
  IconSend: () => <svg data-testid="icon-send" />,
  IconMicrophone: () => <svg data-testid="icon-mic" />,
  IconPhoneOutgoing: () => <svg data-testid="icon-phone-on" />,
  IconPhoneOff: () => <svg data-testid="icon-phone-off" />,
}));

/* --------------------- ElevenLabs useConversation mock --------------------- */
/**
 * We create a mutable conversation mock so each test can control:
 * - status: 'connected' | 'disconnected'
 * - isSpeaking: boolean
 */
type ConversationStatus = 'connected' | 'disconnected' | string;

const conversationMockState: {
  status: ConversationStatus;
  isSpeaking: boolean;
} = {
  status: 'disconnected',
  isSpeaking: false,
};

const conversationFns = {
  startSession: vi.fn(),
  endSession: vi.fn(),
  sendUserMessage: vi.fn(),
  sendUserActivity: vi.fn(),
};

vi.mock('@elevenlabs/react', () => ({
  useConversation: (opts: any) => {
    // expose callbacks if you ever want to trigger them in tests
    // e.g. opts.onMessage({role:'agent', message:'hi'})
    return {
      status: conversationMockState.status,
      isSpeaking: conversationMockState.isSpeaking,
      startSession: conversationFns.startSession,
      endSession: conversationFns.endSession,
      sendUserMessage: conversationFns.sendUserMessage,
      sendUserActivity: conversationFns.sendUserActivity,
      // these exist in your component usage
      ...opts,
    };
  },
}));

/* ------------------------- Helpers -------------------------- */
const openWidget = async () => {
  const user = userEvent.setup();

  // When closed, only the launcher button exists (ActionIcon with IconMessageCircle)
  // We don't have an aria-label, so we click the first button that contains the chat icon.
  const launcherBtn = screen.getAllByRole('button')[0];
  await user.click(launcherBtn);

  return user;
};

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default conversation state
    conversationMockState.status = 'disconnected';
    conversationMockState.isSpeaking = false;

    // mediaDevices mock
    (globalThis.navigator as any).mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({}),
    };

    // Make scrollTo exist so your auto-scroll effect doesn't crash in jsdom
    // (it calls viewportRef.current?.scrollTo)
    Element.prototype.scrollTo = vi.fn();
  });

  it('renders launcher button when widget is closed', () => {
    render(<ChatWidget />);

    // when closed, chat window is not present
    expect(screen.queryByText(/AI Assistant/i)).not.toBeInTheDocument();

    // launcher exists (at least one button)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    expect(screen.getByTestId('icon-chat')).toBeInTheDocument();
  });

  it('opens widget and calls startSession when status is disconnected', async () => {
    render(<ChatWidget />);

    await openWidget();

    expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();

    // since status === 'disconnected', opening triggers startSession()
    expect(conversationFns.startSession).toHaveBeenCalledTimes(1);

    // sanity: agentId should be passed
    const arg = conversationFns.startSession.mock.calls[0][0];
    expect(arg).toMatchObject({
      connectionType: 'websocket',
    });
    expect(arg.agentId).toBeTruthy();
  });

  it('does NOT call startSession on open if already connected', async () => {
    conversationMockState.status = 'connected';

    render(<ChatWidget />);

    await openWidget();

    expect(conversationFns.startSession).not.toHaveBeenCalled();
  });

  it('typing in input calls sendUserActivity and shows "Typing..." bubble', async () => {
    conversationMockState.status = 'connected';

    render(<ChatWidget />);
    const user = await openWidget();

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hi');

    expect(conversationFns.sendUserActivity).toHaveBeenCalled();
    expect(screen.getByText(/Typing\.\.\./i)).toBeInTheDocument();
  });

  it('send message: calls sendUserMessage only when connected and input is not empty', async () => {
    conversationMockState.status = 'connected';

    render(<ChatWidget />);
    const user = await openWidget();

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hello');

    // click send button: it is the button containing IconSend
    const sendBtn = screen.getByTestId('icon-send').closest('button')!;
    await user.click(sendBtn);

    expect(conversationFns.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(conversationFns.sendUserMessage).toHaveBeenCalledWith('Hello');

    // message should render in UI as well
    expect(screen.getByText('Hello')).toBeInTheDocument();

    // input should clear after send
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('send message: does nothing when NOT connected', async () => {
    conversationMockState.status = 'disconnected';

    render(<ChatWidget />);
    const user = await openWidget();

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hello');

    const sendBtn = screen.getByTestId('icon-send').closest('button')!;
    await user.click(sendBtn);

    expect(conversationFns.sendUserMessage).not.toHaveBeenCalled();
    // also should not render message, because you only append when connected
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('toggle voice: requests mic permission (getUserMedia) and shows voice controls', async () => {
    conversationMockState.status = 'connected';

    render(<ChatWidget />);
    const user = await openWidget();

    // click phone outgoing to enter voice mode
    const voiceBtn = screen.getByTestId('icon-phone-on').closest('button')!;
    await user.click(voiceBtn);

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    // now voice UI should show mic + phone-off
    expect(screen.getByTestId('icon-mic')).toBeInTheDocument();
    expect(screen.getByTestId('icon-phone-off')).toBeInTheDocument();
  });

  it('close button ends session when connected and closes widget', async () => {
    conversationMockState.status = 'connected';

    render(<ChatWidget />);
    const user = await openWidget();

    // click close (IconX)
    const closeBtn = screen.getByTestId('icon-x').closest('button')!;
    await user.click(closeBtn);

    expect(conversationFns.endSession).toHaveBeenCalledTimes(1);

    // widget closed => header disappears
    expect(screen.queryByText(/AI Assistant/i)).not.toBeInTheDocument();
  });

  it('shows "User Listening..." bubble when conversation is speaking', async () => {
    conversationMockState.status = 'connected';
    conversationMockState.isSpeaking = true;

    render(<ChatWidget />);
    await openWidget();

    expect(screen.getByText(/User Listening\.\.\./i)).toBeInTheDocument();
  });
});
