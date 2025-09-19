import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link href="/about" className="text-gray-400 hover:text-gray-500">
                About
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-gray-500">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-gray-500">
                Terms
              </Link>
            </div>
            <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} Kalā-Yug. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}