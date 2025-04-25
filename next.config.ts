import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
