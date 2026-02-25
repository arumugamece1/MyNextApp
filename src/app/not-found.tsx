import Link from 'next/link';
import styles from '@/app/NotFound.module.scss';

export default function NotFound() {
  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.text}>Oops! The page you're looking for doesn't exist.</p>

        <Link href="/" className={styles.button}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
