import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // The preview proxy 301-redirects directory-style URLs to a trailing slash
  // (/dashboard -> /dashboard/). With the default `trailingSlash: false`,
  // Next.js 308-redirects back to /dashboard, creating an infinite redirect
  // loop on every non-root route ("The page isn't redirecting properly").
  // Setting true makes both sides agree on /dashboard/ and the loop disappears.
  trailingSlash: true,

  // React Native libraries (the app code is React Native / Expo code)
  transpilePackages: [
    "react-native-web",
    "react-native-safe-area-context",
    "@expo/vector-icons",
  ],

  // Turbopack (default dev bundler in Next 16)
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "expo-font": "./src/rn-web/expo-font-stub.ts",
    },
    rules: {
      // Icon font imports from @expo/vector-icons become public URLs
      // (fonts are served from /fonts, registered via @font-face in globals.css)
      "*.ttf": {
        loaders: ["./turbopack-loaders/ttf-url-loader.js"],
        as: "*.js",
      },
    },
    // Prefer .web.* platform files when resolving React Native libraries
    resolveExtensions: [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
    ],
  },

  // Webpack (kept in sync in case it is ever used)
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
      "expo-font$": path.resolve(__dirname, "src/rn-web/expo-font-stub.ts"),
    };
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ...(config.resolve.extensions || []),
    ];
    return config;
  },
};

export default nextConfig;
