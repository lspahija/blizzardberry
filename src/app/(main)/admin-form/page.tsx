'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Zap, Shield, Rocket, Code, Save } from "lucide-react";
import { useState } from "react";

export default function AdminFormPage() {
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

    const [dataInputs, setDataInputs] = useState([{ name: "", type: "", description: "" }]);
    const [parameters, setParameters] = useState([{ key: "", value: "" }]);
    const [headers, setHeaders] = useState([{ key: "", value: "" }]);
    const [accessType, setAccessType] = useState("full");

    const addDataInput = () => {
        setDataInputs([...dataInputs, { name: "", type: "", description: "" }]);
    };

    const addParameter = () => {
        setParameters([...parameters, { key: "", value: "" }]);
    };

    const addHeader = () => {
        setHeaders([...headers, { key: "", value: "" }]);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF8]">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                        <span className="text-gray-900">Omni</span>
                        <span className="text-[#FE4A60]">Interface</span>
                    </span>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                        <Button className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
                            Save Configuration
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <motion.div
                className="max-w-4xl mx-auto px-4 py-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-12 text-center"
                    variants={itemVariants}
                >
                    Create Custom Action
                </motion.h1>

                {/* General Section */}
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">General</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="actionName" className="text-gray-900">Action Name</Label>
                                    <Input id="actionName" placeholder="e.g., Update_Subscription" className="mt-2 border-[2px] border-gray-900" />
                                </div>
                                <div>
                                    <Label htmlFor="whenToUse" className="text-gray-900">When to Use</Label>
                                    <Textarea
                                        id="whenToUse"
                                        placeholder="Describe when the AI agent should use this action..."
                                        className="mt-2 border-[2px] border-gray-900"
                                        rows={5}
                                    />
                                </div>
                                <Button className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save and Continue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* API Section */}
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">API</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="text-gray-900">Collect Data Inputs from User</Label>
                                    {dataInputs.map((input, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <Label htmlFor={`inputName${index}`}>Name</Label>
                                                <Input id={`inputName${index}`} placeholder="e.g., City" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`inputType${index}`}>Type</Label>
                                                <Select>
                                                    <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="boolean">Boolean</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor={`inputDesc${index}`}>Description</Label>
                                                <Input id={`inputDesc${index}`} placeholder="e.g., The city to get weather for" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                        onClick={addDataInput}
                                    >
                                        Add Variable
                                    </Button>
                                </div>
                                <div>
                                    <Label htmlFor="apiUrl" className="text-gray-900">HTTPS URL</Label>
                                    <Input id="apiUrl" placeholder="e.g., https://wttr.in/{{city}}?format=j1" className="mt-2 border-[2px] border-gray-900" />
                                </div>
                                <div>
                                    <Label htmlFor="apiMethod" className="text-gray-900">Method</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-gray-900">Parameters</Label>
                                    {parameters.map((param, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <Label htmlFor={`paramKey${index}`}>Key</Label>
                                                <Input id={`paramKey${index}`} placeholder="e.g., format" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`paramValue${index}`}>Value</Label>
                                                <Input id={`paramValue${index}`} placeholder="e.g., j1" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                        onClick={addParameter}
                                    >
                                        Add Parameter
                                    </Button>
                                </div>
                                <div>
                                    <Label className="text-gray-900">Headers</Label>
                                    {headers.map((header, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <Label htmlFor={`headerKey${index}`}>Key</Label>
                                                <Input id={`headerKey${index}`} placeholder="e.g., Authorization" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`headerValue${index}`}>Value</Label>
                                                <Input id={`headerValue${index}`} placeholder="e.g., Bearer token" className="mt-2 border-[2px] border-gray-900" />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                        onClick={addHeader}
                                    >
                                        Add Header
                                    </Button>
                                </div>
                                <div>
                                    <Label htmlFor="apiBody" className="text-gray-900">Body (JSON)</Label>
                                    <Textarea
                                        id="apiBody"
                                        placeholder='e.g., {"key": "value"}'
                                        className="mt-2 border-[2px] border-gray-900"
                                        rows={5}
                                    />
                                </div>
                                <Button className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save and Continue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Test Response Section */}
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Test Response</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="liveResponse" className="text-gray-900">Live Response</Label>
                                    <Textarea
                                        id="liveResponse"
                                        placeholder="Test with live data from the API..."
                                        className="mt-2 border-[2px] border-gray-900"
                                        rows={5}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exampleResponse" className="text-gray-900">Example Response (JSON)</Label>
                                    <Textarea
                                        id="exampleResponse"
                                        placeholder='e.g., {"data": "example"}'
                                        className="mt-2 border-[2px] border-gray-900"
                                        rows={5}
                                    />
                                </div>
                                <Button className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save and Continue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Data Access Section */}
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Data Access</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="text-gray-900">Access Type</Label>
                                    <Select onValueChange={setAccessType} defaultValue={accessType}>
                                        <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                                            <SelectValue placeholder="Select access type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full">Full Data Access</SelectItem>
                                            <SelectItem value="limited">Limited Data Access</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Note: The maximum response size is 20KB. Anything exceeding that will return an error.
                                </p>
                                <Button className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save and Continue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}