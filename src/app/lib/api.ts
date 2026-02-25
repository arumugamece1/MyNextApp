// To Fetch Data
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}
// To Get All the Products
export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch('https://fakestoreapi.com/products', {
    next: { revalidate: 60 }, // Its revalidate every 60 seconds
  });
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

// To Get Specific Product from the Products
export async function getSingleProduct(id: string): Promise<Product> {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    cache: 'no-store', //
  });
  if (!res.ok) {
    throw new Error('Failed to fetch single Product');
  }
  return res.json();
}

export async function getCategoryList(): Promise<string[]> {
  const res = await fetch('https://fakestoreapi.com/products/categories');
  if (!res.ok) {
    throw new Error('Failed to fetch category details');
  }
  return res.json();
}
