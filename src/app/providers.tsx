'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import { useEffect, useState } from 'react';

import '@mantine/core/styles.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    if (saved) {
      setColorScheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <Notifications />

      {/* Theme Toggle Button */}
      <ActionIcon
        aria-label="Toggle theme"
        onClick={toggleTheme}
        size="lg"
        color="white"
        variant="outline"
        className="themeToggle"
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 10000,
          backdropFilter: 'blur(12px)',
          borderRadius: '50%',
          border: '2px solid',
        }}
      >
        {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>

      {children}
    </MantineProvider>
  );
}
