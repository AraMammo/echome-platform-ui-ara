import React from "react";

export function PreloadResources() {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/satoshi/Satoshi-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/satoshi/Satoshi-Medium.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/satoshi/Satoshi-Bold.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      <link
        rel="preload"
        href="/media/echome.png"
        as="image"
        type="image/png"
      />

      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//api.echome.ai" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://api.echome.ai" />
    </>
  );
}
