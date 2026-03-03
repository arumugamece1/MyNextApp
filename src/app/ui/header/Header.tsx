'use client';

import { IconSearch, IconBuildingStore } from '@tabler/icons-react';
import { TextInput, Group, Button, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import classes from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const [value, setValue] = useState<string>('');
  const [categoryValue] = useState<string>('');

  const navigateToDashboard = () => {
    router.push('/products');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    router.push(
      `/products?search=${encodeURIComponent(inputValue)}&category=${encodeURIComponent(categoryValue)}`
    );
  };
  return (
    <header className={classes.header}>
      <Group justify="space-between">
        <h2 className={classes['header-text']} onClick={navigateToDashboard}>
          <IconBuildingStore size={28} /> ShopHub
        </h2>
        <Group>
          <Text>
            <Link className={classes.navLink} href={'/shop'}>
              Shop
            </Link>
          </Text>
          <TextInput
            className={classes.search}
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
