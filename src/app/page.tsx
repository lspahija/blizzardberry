'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Shield, Rocket, Code } from "lucide-react";

export default function LandingPage() {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, staggerChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="flex items-center space-x-2">
                    <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                    </svg>
                    <span className="text-xl font-bold text-gray-900">Omni Interface</span>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link href="/product" className="text-gray-700 hover:text-indigo-600 transition">
                        Product
                    </Link>
                    <Link href="/docs" className="text-gray-700 hover:text-indigo-600 transition">
                        Docs
                    </Link>
                    <Link href="/blog" className="text-gray-700 hover:text-indigo-600 transition">
                        Blog
                    </Link>
                    <Link href="/community" className="text-gray-700 hover:text-indigo-600 transition">
                        Community
                    </Link>
                    <Link href="/company" className="text-gray-700 hover:text-indigo-600 transition">
                        Company
                    </Link>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" asChild>
                        <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.div
                className="relative flex flex-col items-center justify-center text-center pt-24 pb-32 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute inset-0 -z-10 opacity-20">
                    <svg viewBox="0 0 1440 320" className="w-full h-full">
                        <path
                            fill="#6366f1"
                            fillOpacity="0.1"
                            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                </div>
                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6"
                    variants={itemVariants}
                >
                    Empower Your Webapp with <br />
                    <span className="text-indigo-600">Agentic AI Chatbots</span>
                </motion.h1>
                <motion.p
                    className="text-xl text-gray-600 mb-10 max-w-3xl"
                    variants={itemVariants}
                >
                    Seamlessly integrate intelligent chatbots that take actions on your webapp. Boost user engagement and automate workflows with ease.
                </motion.p>
                <motion.div className="flex space-x-4" variants={itemVariants}>
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                        <Link href="/get-started">Get Started Now</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="https://github.com/your-repo" target="_blank">
                            Star on GitHub
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Value Proposition Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
                        Why Choose Omni Interface?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-none shadow-lg hover:shadow-xl transition">
                                <CardHeader>
                                    <Zap className="w-8 h-8 text-indigo-600 mb-2" />
                                    <CardTitle className="text-xl font-semibold">Lightning Fast</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Deploy AI chatbots in minutes with a few lines of code.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-none shadow-lg hover:shadow-xl transition">
                                <CardHeader>
                                    <Shield className="w-8 h-8 text-indigo-600 mb-2" />
                                    <CardTitle className="text-xl font-semibold">Secure & Reliable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Built with enterprise-grade security to protect your users.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-none shadow-lg hover:shadow-xl transition">
                                <CardHeader>
                                    <Rocket className="w-8 h-8 text-indigo-600 mb-2" />
                                    <CardTitle className="text-xl font-semibold">Scalable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Handles millions of interactions with zero downtime.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-none shadow-lg hover:shadow-xl transition">
                                <CardHeader>
                                    <Code className="w-8 h-8 text-indigo-600 mb-2" />
                                    <CardTitle className="text-xl font-semibold">Developer Friendly</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Built with Next.js, React, and TypeScript for easy integration.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 text-center bg-gradient-to-r from-indigo-600 to-blue-600">
                <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to Transform Your Webapp?
                </h2>
                <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of developers using Omni Interface to power their apps with AI chatbots.
                </p>
                <Button size="lg" variant="secondary" asChild>
                    <Link href="/get-started">Get Started for Free</Link>
                </Button>
            </div>
        </div>
    );
}