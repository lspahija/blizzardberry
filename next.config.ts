import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Ignores all ESLint errors during `next build`
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript errors
    },
    async headers() {
        return [
            {
                // Apply to all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*', // Allow all origins
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow all standard methods
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: '*', // Allow all headers
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true', // Allow credentials
                    },
                    {
                        key: 'Access-Control-Max-Age',
                        value: '86400', // Cache preflight requests for 24 hours
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://us-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://us.i.posthog.com/:path*',
            },
            {
                source: '/ingest/decide',
                destination: 'https://us.i.posthog.com/decide',
            },
        ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
