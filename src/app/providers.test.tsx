import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Providers from './providers';
const getToggleBtn = () => screen.getByRole('button', { name: /toggle theme/i });

// Mock Mantine with partial override (safer)
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');

  return {
    ...actual,
    MantineProvider: ({ children }: any) => <div data-testid="mantine">{children}</div>,
    ActionIcon: ({ children, onClick, ...rest }: any) => (
      <button type="button" onClick={onClick} {...rest}>
        {children}
      </button>
    ),
  };
});

vi.mock('@mantine/notifications', () => ({
  Notifications: () => <div data-testid="notifications" />,
}));

vi.mock('@tabler/icons-react', () => ({
  IconSun: (props: any) => <svg data-testid="icon-sun" {...props} />,
  IconMoon: (props: any) => <svg data-testid="icon-moon" {...props} />,
}));

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders children and Notifications', () => {
    render(
      <Providers>
        <div data-testid="child">Hello</div>
      </Providers>
    );

    expect(screen.getByTestId('mantine')).toBeInTheDocument();
    expect(screen.getByTestId('notifications')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('defaults to light theme (shows moon icon) when nothing saved', () => {
    render(
      <Providers>
        <div />
      </Providers>
    );

    const toggleBtn = getToggleBtn();
    expect(within(toggleBtn).getByTestId('icon-moon')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(localStorage.getItem('app-theme')).toBe(null);
  });

  it('loads saved theme from localStorage and sets data-theme', () => {
    localStorage.setItem('app-theme', 'dark');

    render(
      <Providers>
        <div />
      </Providers>
    );

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    const toggleBtn = getToggleBtn();
    expect(within(toggleBtn).getByTestId('icon-sun')).toBeInTheDocument();
  });

  it('toggles theme: light -> dark and saves it', async () => {
    const user = userEvent.setup();

    render(
      <Providers>
        <div />
      </Providers>
    );

    const toggleBtn = getToggleBtn();
    expect(within(toggleBtn).getByTestId('icon-moon')).toBeInTheDocument();

    await user.click(toggleBtn);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(within(toggleBtn).getByTestId('icon-sun')).toBeInTheDocument();
  });

  it('toggles theme: dark -> light and saves it', async () => {
    const user = userEvent.setup();
    localStorage.setItem('app-theme', 'dark');

    render(
      <Providers>
        <div />
      </Providers>
    );

    const toggleBtn = getToggleBtn();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(within(toggleBtn).getByTestId('icon-sun')).toBeInTheDocument();

    await user.click(toggleBtn);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('app-theme')).toBe('light');
    expect(within(toggleBtn).getByTestId('icon-moon')).toBeInTheDocument();
  });
});
