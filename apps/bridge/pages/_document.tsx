import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta name="description" content="Cross-chain USDC bridge powered by Circle CCTP" />
        <link rel="icon" href="/honeypot-icon.svg" />
      </Head>
      <body className="dark bg-[#0a0a0a]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
