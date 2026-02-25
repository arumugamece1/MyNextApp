'use client';
import { Button, Text, Center } from '@mantine/core';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <Center h="50vh" style={{ flexDirection: 'column' }}>
        <Text c="red" mb="md">
          {error.message}
        </Text>

        <Button onClick={() => reset()}>Try Again</Button>
      </Center>
    </div>
  );
}
