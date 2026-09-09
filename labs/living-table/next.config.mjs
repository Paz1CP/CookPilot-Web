import path from "node:path";

export default {
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 30 * 1000,
    pagesBufferLength: 1,
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackMemoryLimit: 512 * 1024 * 1024,
  },
  outputFileTracingRoot: path.resolve("."),
  turbopack: {
    root: path.resolve("."),
  },
};
