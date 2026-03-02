import { describe, it, expect, vi } from 'vitest';

//  Mock next/navigation BEFORE importing the page
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
import { redirect } from 'next/navigation';
import Page from './page';

describe('Page redirect', () => {
  it('should redirect to /products', () => {
    Page();
    expect(redirect).toHaveBeenCalledWith('/products');
  });
});
