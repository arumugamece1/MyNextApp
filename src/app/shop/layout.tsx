import Search from '../ui/Search';
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <header>
        <h2>Shop Layout</h2>
        <Search />
      </header> */}
      <main>{children}</main>
    </>
  );
}
