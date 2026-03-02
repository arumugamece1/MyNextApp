import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatNew } from './ChatNew';

// Mock SCSS
vi.mock('@/components/chat/chatwidget.module.scss', () => ({
  default: {
    glassContainer: 'glassContainer',
    chatHeader: 'chatHeader',
    userBubble: 'userBubble',
    agentBubble: 'agentBubble',
    statusBubble: 'statusBubble',
    footer: 'footer',
    glassInput: 'glassInput',
    iconButton: 'iconButton',
    muted: 'muted',
    active: 'active',
    endCall: 'endCall',
  },
}));
// Mock Mantine core
vi.mock('@mantine/core', async () => {
  const actual = vi.importActual<any>('@mantine/core');
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
    Box: ({ children, ...rest }: any) => (
      <div data-testid="box" {...rest}>
        {children}
      </div>
    ),
    Group: ({ children, ...rest }: any) => (
      <div data-testid="group" {...rest}>
        {children}
      </div>
    ),
    Space: ({ children, ...rest }: any) => (
      <div data-testid="space" {...rest}>
        {children}
      </div>
    ),
    Stack: ({ children, ...rest }: any) => (
      <div data-testid="stack" {...rest}>
        {children}
      </div>
    ),
    Text: ({ children, ...rest }: any) => (
      <div data-testid="text" {...rest}>
        {children}
      </div>
    ),
    Tooltip: ({ children, ...rest }: any) => (
      <div data-testid="tooltip" {...rest}>
        {children}
      </div>
    ),
    TextInput: ({ value, onChange, onKeyDown, placeholder, ...rest }: any) => (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        {...rest}
      />
    ),
    ScrollArea: ({ children, viewportRef, ...rest }: any) => (
      <div data-testid="scrollarea" viewportRef={viewportRef} {...rest}>
        {children}
      </div>
    ),
  };
});
// Mcok Icon
vi.mock('@tabler/icons-react', () => ({
  IconX: (props: any) => <svg data-testid="icon-x" {...props}></svg>,
  IconSend: (props: any) => <svg data-testid="icon-send" {...props}></svg>,
  IconMicrophone: (props: any) => <svg data-testid="icon-microphone" {...props}></svg>,
  IconPhoneOutgoing: (props: any) => <svg data-testid="icon-phoneoutgoing" {...props}></svg>,
  IconPhoneOff: (props: any) => <svg data-testid="icon-phoneoff" {...props}></svg>,
  IconFileUpload: (props: any) => <svg data-testid="icon-fileupload" {...props}></svg>,
}));
// Mock Test Helpers (Component Props)
type ChatMessage = {
  role: 'user' | 'agent';
  message: string;
};

const baseProps = (overrides?: Partial<React.ComponentProps<typeof ChatNew>>) => {
  const props: React.ComponentProps<typeof ChatNew> = {
    messages: [],
    onSentUserMessage: vi.fn(),
    micMuted: true,
    setMicMuted: vi.fn(),
    sendUserMessage: vi.fn(),
    sendUserActivity: vi.fn(),
    endSession: vi.fn().mockResolvedValue(undefined),
    status: 'connected',
    isSpeaking: false,
    ...overrides,
  };
  return props;
};
// Utility: find action buttons by icon
const btnByIcon = (testId: string) => screen.getByTestId(testId).closest('button')!;

describe('ChatNew Component Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // prevent autoscroll crash
    Element.prototype.scrollTo = vi.fn();

    // mock mediaDevices
    (globalThis.navigator as any).mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({}),
    };

    // mock alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // mock fetch
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: 'mocked' }),
      } as any)
    );
  });
  it('rendered user and agent messages', () => {
    const props = baseProps({
      messages: [
        {
          role: 'agent',
          message: 'Hi there, How can i assist today?',
        },
        {
          role: 'user',
          message: 'Hi, Good Morning',
        },
      ],
    });
    render(<ChatNew {...props} />);
    expect(screen.getByText('Hi there, How can i assist today?')).toBeInTheDocument();
    expect(screen.getByText('Hi, Good Morning')).toBeInTheDocument();
  });
  it('typing in input calls sendUserActivity and shows "Typing..." when connected', async () => {
    const user = userEvent.setup();
    const props = baseProps({ status: 'connected' });
    render(<ChatNew {...props} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Aru');
    expect(props.sendUserActivity).toHaveBeenCalled();
    expect(screen.getByText(/typing\.\.\./i)).toBeInTheDocument();
  });
  it('send message: calls sendUserMessage + onSentUserMessage and clears input (connected)', async () => {
    const user = userEvent.setup();
    const props = baseProps({ status: 'connected' });
    render(<ChatNew {...props} />);
    const input = screen.getByPlaceholderText(/type a message/i) as HTMLInputElement;
    await user.type(input, 'Hi, Good Morning');
    await user.click(btnByIcon('icon-send'));
    expect(props.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(props.sendUserMessage).toHaveBeenCalledWith('Hi, Good Morning');
    expect(props.onSentUserMessage).toHaveBeenCalledTimes(1);
    expect(props.onSentUserMessage).toHaveBeenCalledWith({
      role: 'user',
      message: 'Hi, Good Morning',
    });
    expect(input.value).toBe('');
  });
  it('does not trigger when the input value is empty', async () => {
    const user = userEvent.setup();
    const props = baseProps({ status: 'connected' });

    render(<ChatNew {...props} />);
    await user.click(btnByIcon('icon-send'));
    expect(props.sendUserMessage).not.toHaveBeenCalled();
    expect(props.onSentUserMessage).not.toHaveBeenCalled();
  });
});
