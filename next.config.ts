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
    "expo-document-picker",
    "expo-clipboard",
    "expo-modules-core",
    "react-native-svg",
    "lucide-react-native",
  ],

  // Turbopack (default dev bundler in Next 16)
  turbopack: {
    resolveAlias: {
      // Route the `react-native` specifier through the shim instead of
      // react-native-web directly: the shim re-exports react-native-web
      // and adds stub exports for native-only APIs (TurboModuleRegistry)
      // that react-native-svg's web build imports but never calls.
      "react-native": "./src/rn-web/react-native-shim.ts",
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
    const shim = path.resolve(__dirname, "src/rn-web/react-native-shim.ts");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": shim,
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
