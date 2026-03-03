import { getAllProducts } from '../lib/api';
import {
  Card,
  Text,
  Badge,
  Button,
  Image,
  Grid,
  GridCol,
  Container,
  CardSection,
  Space,
} from '@mantine/core';
import { Carousel, CarouselSlide } from '@mantine/carousel';
import Link from 'next/link';
import classs from '@/app/products/products.module.scss';
import { ChatWidget } from '@/components/chat/ChatWidget';
import FilterBar from '../ui/FilterBar/Filter';
import Header from '../ui/header/Header';
type SearchParams = Promise<{ search?: string; category?: string; min?: string; max?: string }>;
export default async function ProductList({ searchParams }: { searchParams: SearchParams }) {
  const [params, productList] = await Promise.all([searchParams, getAllProducts()]);
  const searchQuery = params.search?.toLowerCase() || '';
  const categoryQuery = params.category?.toLowerCase() || '';
  const minRangeQuery = Number(params.min) || 0;
  const maxRangeQuery = Number(params.max) || Infinity;

  // Filter based on the Search and Category
  const filteredProducts = productList.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery);
    const matchesCategory = categoryQuery ? product.category.toLowerCase() === categoryQuery : true;
    const matchesPrice = product.price >= minRangeQuery && product.price <= maxRangeQuery;
    return matchesSearch && matchesCategory && matchesPrice;
  });
  return (
    <div>
      <Header />
      <Carousel
        withIndicators
        className={classs.bannerCarousel}
        height={400}
        slideSize="100%"
        slideGap="xl"
        emblaOptions={{ loop: true, align: 'start', slidesToScroll: 1 }}
      >
        <CarouselSlide>
          <Image
            src="/images/banner/banner1.jpg"
            className={classs.bannerImage}
            alt="Electronics"
            height={400}
          />
        </CarouselSlide>
        <CarouselSlide>
          <Image
            src="/images/banner/banner5.jpg"
            className={classs.bannerImage}
            alt="Electronics"
            height={400}
          />
        </CarouselSlide>
        <CarouselSlide>
          <Image
            src="/images/banner/banner3.jpg"
            className={classs.bannerImage}
            alt="Electronics"
            height={400}
          />
        </CarouselSlide>
        <CarouselSlide>
          <Image
            src="/images/banner/banner4.jpg"
            className={classs.bannerImage}
            alt="Electronics"
            height={400}
          />
        </CarouselSlide>
        <Image
          src="/images/banner/banner2.jpg"
          className={classs.bannerImage}
          alt="Electronics"
          height={400}
        />
        <CarouselSlide>
          <Image
            src="/images/banner/banner2.jpg"
            className={classs.bannerImage}
            alt="Electronics"
            height={400}
          />
        </CarouselSlide>
      </Carousel>
      <Container size="xl" py="xl" className={classs['container-div']}>
        <ChatWidget />
        <aside>
          <FilterBar />
        </aside>
        <Grid gutter="lg">
          {filteredProducts.map((item) => (
            <GridCol span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
              <Card shadow="sm" padding="lg" radius="md" className={classs['product-card']}>
                <CardSection>
                  <Image
                    src={item.image}
                    className={classs.imagediv}
                    height={200}
                    alt="Product Image"
                  />
                </CardSection>
                <Text fw={500} className={classs.elipsiscard}>
                  {item.title}
                </Text>
                <Badge color="orange" size="xs">
                  {item.category}
                </Badge>
                <Space h="xs" />
                <Text size="sm" c="dimmed">
                  ${item.price}
                </Text>
                <Link href={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                  <Button className={classs['primary-btn']} fullWidth mt="md" radius="md">
                    View
                  </Button>
                </Link>
              </Card>
            </GridCol>
          ))}
        </Grid>
      </Container>
    </div>
  );
}
