import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, title = 'Kalā-Yug - AI-Powered Platform for Artisans' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="AI-powered platform for Indian artisans to create designs and stories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}