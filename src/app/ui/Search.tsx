'use client';
import { useSearchParams } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  return (
    <div>
      <h3>Search Query:</h3>
      <p>{search ?? 'No search query provided'}</p>
    </div>
  );
}
