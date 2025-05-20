'use client';

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {motion} from "framer-motion";
import Link from "next/link";
import {Zap, Shield, Rocket, Code} from "lucide-react";

export default function LandingPage() {
    const containerVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {duration: 0.8, staggerChildren: 0.2},
        },
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {opacity: 1, y: 0, transition: {duration: 0.5}},
    };

    const cardVariants = {
        hidden: {opacity: 0, scale: 0.95},
        visible: {opacity: 1, scale: 1, transition: {duration: 0.5}},
    };

    return (
        <div className="min-h-screen bg-[#FFFDF8]">
            {/* Navbar */}
            <nav
                className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                        <span className="text-gray-900">Omni</span>
                        <span className="text-[#FE4A60]">Interface</span>
                    </span>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link href="/product" className="text-gray-900 hover:-translate-y-0.5 transition-transform">
                        Product
                    </Link>
                    <Link href="/docs" className="text-gray-900 hover:-translate-y-0.5 transition-transform">
                        Docs
                    </Link>
                    <Link href="/blog" className="text-gray-900 hover:-translate-y-0.5 transition-transform">
                        Blog
                    </Link>
                    <Link href="/community" className="text-gray-900 hover:-translate-y-0.5 transition-transform">
                        Community
                    </Link>
                    <Link href="/company" className="text-gray-900 hover:-translate-y-0.5 transition-transform">
                        Company
                    </Link>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                        <Button
                            variant="outline"
                            className="relative bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                            asChild
                        >
                            <Link href="/auth">Sign In</Link>
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                        <Button
                            className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                            asChild>
                            <Link href="/auth">Try For Free</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.div
                className="relative flex flex-col items-center justify-center text-center pt-16 pb-24 max-w-4xl mx-auto px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <svg
                    className="absolute h-auto w-16 sm:w-20 md:w-24 flex-shrink-0 p-2 md:relative sm:absolute lg:absolute left-0 lg:-translate-x-full lg:ml-32 md:translate-x-10 sm:-translate-y-16 md:-translate-y-0 -translate-x-2 lg:-translate-y-10"
                    viewBox="0 0 91 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
                        fill="#FE4A60" stroke="#000" strokeWidth="3.445"></path>
                    <path
                        d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.21 3.453-12.905 12.854-14"
                        stroke="#000" strokeWidth="2.548" strokeLinecap="round"></path>
                </svg>
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-gray-900 mb-4"
                    variants={itemVariants}
                >
                    Empower Your Webapp with <br/>
                    <span className="text-[#FFC480]">Agentic AI Chatbots</span>
                </motion.h1>
                <svg
                    className="w-16 lg:w-20 h-auto lg:absolute flex-shrink-0 right-0 bottom-0 md:block hidden translate-y-10 md:translate-y-20 lg:translate-y-4 lg:-translate-x-12 -translate-x-10"
                    viewBox="0 0 92 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
                        fill="#5CF1A4" stroke="#000" strokeWidth="2.868"></path>
                    <path
                        d="M75.062 40.108c1.07 5.255 1.072 16.52-7.472 19.54m7.422-19.682c1.836 2.965 7.643 8.14 16.187 5.121-8.544 3.02-8.207 15.23-6.971 20.957-1.97-3.343-8.044-9.274-16.588-6.254M12.054 28.012c1.34-5.22 6.126-15.4 14.554-14.369M12.035 28.162c-.274-3.487-2.93-10.719-11.358-11.75C9.104 17.443 14.013 6.262 15.414.542c.226 3.888 2.784 11.92 11.212 12.95"
                        stroke="#000" strokeWidth="2.319" strokeLinecap="round"></path>
                </svg>
                <motion.p
                    className="text-lg text-gray-600 mb-8 max-w-2xl"
                    variants={itemVariants}
                >
                    Seamlessly integrate intelligent chatbots that take actions on your webapp. Boost user engagement
                    and automate workflows with ease.
                </motion.p>
                <motion.div className="flex space-x-4" variants={itemVariants}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                        <Button size="lg"
                                className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                asChild>
                            <Link href="/auth">Get Started Now</Link>
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                        <Button size="lg" variant="outline"
                                className="relative bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                asChild>
                            <Link href="https://github.com/your-repo" target="_blank">
                                Star on GitHub
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Value Proposition Section */}
            <div className="py-16 bg-[#FFFDF8]">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Omni Interface?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                                <Card
                                    className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                                    <CardHeader>
                                        <Zap className="w-8 h-8 text-[#FFC480] mb-2"/>
                                        <CardTitle className="text-xl font-semibold text-gray-900">Lightning
                                            Fast</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Deploy AI chatbots in minutes with a few lines of code.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                                <Card
                                    className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                                    <CardHeader>
                                        <Shield className="w-8 h-8 text-[#FFC480] mb-2"/>
                                        <CardTitle className="text-xl font-semibold text-gray-900">Secure &
                                            Reliable</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Built with enterprise-grade security to protect your users.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                                <Card
                                    className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                                    <CardHeader>
                                        <Rocket className="w-8 h-8 text-[#FFC480] mb-2"/>
                                        <CardTitle className="text-xl font-semibold text-gray-900">Scalable</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Handles millions of interactions with zero downtime.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                                <Card
                                    className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                                    <CardHeader>
                                        <Code className="w-8 h-8 text-[#FFC480] mb-2"/>
                                        <CardTitle className="text-xl font-semibold text-gray-900">Developer
                                            Friendly</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Built with Next.js, React, and TypeScript for easy integration.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 text-center bg-[#FFC480]">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Webapp?
                </h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join thousands of developers using Omni Interface to power their apps with AI chatbots.
                </p>
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                    <Button size="lg"
                            className="relative bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                            asChild>
                        <Link href="/auth">Get Started for Free</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}