import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div className="flex flex-col">
      {/* nav style use tailwind, links use nextjs Link */}
      <nav className="relative flex flex-wrap items-center justify-between p-6 bg-gray-800">
        <div className="flex items-center flex-shrink-0 mr-6 text-white">
          <span className="text-xl font-semibold tracking-tight">Presence</span>
        </div>
        {!isNavOpen && (
          <ul className="items-center justify-end flex-1 hidden list-reset lg:flex">
            <li className="mr-3">
              <Link
                href="/chat"
                className="inline-block w-full px-4 py-2 text-gray-300 no-underline hover:text-gray-100 hover:text-underline"
              >
                Chat
              </Link>
            </li>
            <li className="mr-3">
              <Link
                href="/piano"
                className="inline-block w-full px-4 py-2 text-gray-300 no-underline hover:text-gray-100 hover:text-underline"
              >
                Piano
              </Link>
            </li>
          </ul>
        )}
        <div className="block lg:hidden">
          <button
            id="nav-toggle"
            className="flex items-center px-3 py-2 text-gray-500 border border-gray-600 rounded hover:text-white hover:border-white"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div
          className="absolute left-0 z-20 flex-grow hidden w-full transition-all duration-300 ease-in-out bg-gray-800 lg:flex lg:items-center lg:w-auto lg:pt-0 lg:bg-transparent lg:shadow-none"
          style={{
            display: isNavOpen ? 'block' : 'none',
            top: '100%',
          }}
        >
          <ul className="items-center justify-end flex-1 list-reset lg:flex">
            <li className="mr-3">
              <Link
                href="/chat"
                className="inline-block w-full px-4 py-2 text-gray-300 no-underline hover:text-gray-100 hover:text-underline"
              >
                Chat
              </Link>
            </li>
            <li className="mr-3">
              <Link
                href="/piano"
                className="inline-block w-full px-4 py-2 text-gray-300 no-underline hover:text-gray-100 hover:text-underline"
              >
                Piano
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      {/* Description of Presence Examples */}
      <div className="container flex flex-col px-4 mx-auto mt-12">
        <div className="flex flex-1 w-full">
          <div className="w-full px-4 lg:w-1/2">
            <h2 className="text-4xl font-semibold">Presence Examples</h2>
            <p className="mt-4 mb-4 text-lg leading-relaxed text-gray-600">
              This is a collection of examples of using Presence in different
              frameworks and environments.
            </p>
            <p className="mt-0 mb-4 text-lg leading-relaxed text-gray-600">
              The examples are all open source and available on GitHub.
            </p>
            <Link
              href="https://github.com/yomorun/presencejs/tree/main/examples"
              target="_blank"
              className="mt-8 font-bold text-gray-800"
            >
              View on GitHub →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
