import Link from 'next/link';

const MainNav: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        ContentCraft AI
      </div>
      <nav className="flex flex-col p-4">
        <Link href="/dashboard" className="py-2 px-4 hover:bg-gray-800 rounded">
          Dashboard
        </Link>
        <Link href="/blog-generator" className="py-2 px-4 hover:bg-gray-800 rounded">
          Blog Generator
        </Link>
        <Link href="/media-library" className="py-2 px-4 hover:bg-gray-800 rounded">
          Media Library
        </Link>
        <Link href="/seo-tools" className="py-2 px-4 hover:bg-gray-800 rounded">
          SEO Tools
        </Link>
        <Link href="/settings" className="py-2 px-4 hover:bg-gray-800 rounded">
          Settings
        </Link>
      </nav>
    </div>
  );
};

export default MainNav;