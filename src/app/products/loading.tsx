import { Center, Loader, Stack, Text, Box } from '@mantine/core';
export default function Loading() {
  return (
    <Center
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
      }}
    >
      <Box
        style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '40px 60px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <Stack align="center" gap="md">
          <Loader size="lg" color="cyan" />
          <Text fw={600} c="white">
            Loading ShopHub...
          </Text>
        </Stack>
      </Box>
    </Center>
  );
}
