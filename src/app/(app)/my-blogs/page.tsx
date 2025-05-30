
import { redirect } from 'next/navigation';

export default function MyBlogsPage() {
  redirect('/dashboard');
  // This return is necessary for Next.js to know this component doesn't render anything itself.
  return null;
}
