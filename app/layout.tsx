import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FridgeChef — good food starts here',
  description: 'Turn your ingredients into something delicious with FridgeChef.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body data-local-demo-mode={process.env.LOCAL_DEMO_MODE === 'true' ? 'true' : 'false'}>{children}</body></html>;
}
