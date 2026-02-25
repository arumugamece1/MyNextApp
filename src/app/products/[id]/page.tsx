import { getSingleProduct } from '@/app/lib/api';
import { Card, Image, Text, Title, Container } from '@mantine/core';

export default async function SingleProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getSingleProduct(id);
  return (
    <Container size="sm" py="xl">
      <Card shadow="md" padding="lg" radius="md" withBorder>
        <Image src={product.image} height={300} fit="contain" alt={product.title} />

        <Title mt="md">{product.title}</Title>

        <Text size="lg" fw={700} mt="sm">
          ${product.price}
        </Text>

        <Text mt="md">{product.description}</Text>
      </Card>
    </Container>
  );
}
