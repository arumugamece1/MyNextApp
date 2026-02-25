'use client';

import { IconSearch, IconBuildingStore } from '@tabler/icons-react';
import { TextInput, Group, Button, Select, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './header.module.scss';
import Link from 'next/link';
// import { getCategoryList } from '@/app/lib/api';

export default function Header() {
  const router = useRouter();
  const [value, setValue] = useState<string>('');
  const [categoryValue, setcategoryValue] = useState<string>('');
  // const [categoryList, setCategoryList] = useState<string[]>([]);

  // useEffect(() => {
  //   // Fetch categories on client side
  //   getCategoryList().then((data) => setCategoryList(data));
  // }, []);
  const navigateToDashboard = () => {
    router.push('/products'); // Adds a new entry to the history stack
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    router.push(
      `/products?search=${encodeURIComponent(inputValue)}&category=${encodeURIComponent(categoryValue)}`
    );
  };
  // const handleCategoryChange = (valueC: string | null) => {
  //   const inputValue = valueC || '';
  //   setcategoryValue(inputValue);
  //   router.push(
  //     `/products?search=${encodeURIComponent(value)}&category=${encodeURIComponent(inputValue)}`
  //   );
  // };
  return (
    <header className={classes.header}>
      <Group justify="space-between">
        <h2 className={classes['header-text']} onClick={navigateToDashboard}>
          <IconBuildingStore size={28} /> ShopHub
        </h2>
        <Group>
          {/* <Select
            data={categoryList}
            value={categoryValue}
            onChange={handleCategoryChange}
            placeholder="Select"
            clearable
          /> */}
          <Text>
            <Link href={'/shop'}>Shop</Link>
          </Text>
          <TextInput
            placeholder="Search products..."
            leftSection={<IconSearch size={16} />}
            value={value}
            onChange={handleChange}
          />
          <Button variant="filled" className={classes['primary-btn']}>
            Login
          </Button>
        </Group>
      </Group>
    </header>
  );
}
