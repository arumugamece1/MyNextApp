'use client';

import { Button, Container, Flex, Group, Radio, RangeSlider, Space, Text } from '@mantine/core';
import { IconFilter2Spark } from '@tabler/icons-react';
import classs from '@/app/ui/FilterBar/filter.module.scss';
import { useEffect, useState } from 'react';
import { getCategoryList } from '@/app/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const [categoryValue, setCategoryValue] = useState<string>('');
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [rangeValue, setRangeValue] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    getCategoryList().then((data) => setCategoryList(data));
  }, []);
  useEffect(() => {
    if (!categoryValue) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryValue);
    route.push(`/products?${params.toString()}`, { scroll: false });
  }, [categoryValue]);
  const handleClearFilter = () => {
    setCategoryValue('');
    setRangeValue([0, 1000]);
    route.push(`/products`, { scroll: false });
  };
  const handleChangeRange = (value: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min', value[0].toString());
    params.set('max', value[1].toString());
    route.push(`/products?${params.toString()}`, { scroll: false });
  };
  return (
    <>
      <Container className={classs['filter-container']}>
        <Group justify="space-between" grow>
          <div className={classs.filterText}>
            <IconFilter2Spark size={24} className={classs.filterIcon} />
            <h4 className="m-0">Filter</h4>
          </div>
          <div className={classs.buttonDiv}>
            <Button variant="outline" size="xs" onClick={handleClearFilter}>
              Reset
            </Button>
          </div>
        </Group>
        <Space h="xs" />
        <Radio.Group label="Category" value={categoryValue} onChange={setCategoryValue}>
          <Space h="xs" />
          <Flex mih={50} gap="md" direction="column" wrap="wrap">
            {categoryList.map((item) => (
              <Radio key={item} value={item} label={item} />
            ))}
          </Flex>
        </Radio.Group>
        <Space h="xs" />
        <Text size="sm" mt="xl">
          <b>Range</b>
        </Text>
        <Space h="xs" />
        <RangeSlider
          value={rangeValue}
          onChange={setRangeValue}
          onChangeEnd={handleChangeRange}
          min={0}
          max={1000}
          label={(value) => `${value} $`}
        />
      </Container>
    </>
  );
}
