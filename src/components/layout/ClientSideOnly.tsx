'use client';

import { useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
};

export function ClientSideOnly({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server or during hydration
  }

  return <>{children}</>;
}
