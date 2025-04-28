'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Users, BarChart, Settings } from "lucide-react";
import { notFound } from "next/navigation";

export default function ExampleSaaSLandingPage() {
    // Block page in production
    if (process.env.NODE_ENV === "production") {
        notFound();
    }

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
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
                <div className="flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-foreground">Example SaaS</span>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" asChild>
                        <Link href="/example/signin">Sign In</Link>
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <Link href="/example/signup">Sign Up</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.div
                className="flex flex-col items-center justify-center text-center pt-20 pb-28 max-w-5xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6"
                    variants={itemVariants}
                >
                    Discover Our <span className="text-primary">Chatbot-Powered</span> SaaS
                </motion.h1>
                <motion.p
                    className="text-lg text-muted-foreground mb-8 max-w-2xl"
                    variants={itemVariants}
                >
                    This is an example SaaS app showcasing our powerful chatbot widget. Try it out to see how it enhances user interaction!
                </motion.p>
                <motion.div className="flex space-x-4" variants={itemVariants}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <Link href="/example/get-started">Try the Chatbot</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/example/docs">View Docs</Link>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Chatbot Widget Placeholder */}
            <div className="py-16 bg-card">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-10">
                        Experience Our Chatbot Widget
                    </h2>
                    <div className="flex justify-center">
                        <div className="w-full max-w-md p-6 bg-muted rounded-lg shadow-md">
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageCircle className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-semibold text-foreground">Chatbot Demo</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                This is a placeholder for the chatbot widget. In a real implementation, it would interact with users via the /api/special endpoint.
                            </p>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Start Chatting
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                        Why Our SaaS Stands Out
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-border shadow-md hover:shadow-lg transition">
                                <CardHeader>
                                    <Users className="w-7 h-7 text-primary mb-2" />
                                    <CardTitle className="text-lg font-semibold">User Engagement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Chatbots boost interaction with personalized responses.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-border shadow-md hover:shadow-lg transition">
                                <CardHeader>
                                    <BarChart className="w-7 h-7 text-primary mb-2" />
                                    <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Gain insights from chatbot interactions.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-border shadow-md hover:shadow-lg transition">
                                <CardHeader>
                                    <Settings className="w-7 h-7 text-primary mb-2" />
                                    <CardTitle className="text-lg font-semibold">Customizable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Tailor the chatbot to your brand’s needs.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                            <Card className="border-border shadow-md hover:shadow-lg transition">
                                <CardHeader>
                                    <MessageCircle className="w-7 h-7 text-primary mb-2" />
                                    <CardTitle className="text-lg font-semibold">24/7 Support</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Always-on chatbot for instant user support.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 text-center bg-primary">
                <h2 className="text-3xl font-bold text-primary-foreground mb-6">
                    Ready to Try Our Chatbot?
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                    Explore how our chatbot widget can transform your SaaS application.
                </p>
                <Button size="lg" variant="secondary" asChild>
                    <Link href="/example/get-started">Get Started</Link>
                </Button>
            </div>
        </div>
    );
}