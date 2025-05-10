'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

    const [dataInputs, setDataInputs] = useState([{ name: "", type: "Text", description: "", isArray: false }]);
    const [parameters, setParameters] = useState([{ key: "", value: "" }]);
    const [headers, setHeaders] = useState([{ key: "", value: "" }]);
    const [actionType, setActionType] = useState("server");

    const addDataInput = () => {
        setDataInputs([...dataInputs, { name: "", type: "Text", description: "", isArray: false }]);
    };

    const removeDataInput = (index: number) => {
        setDataInputs(dataInputs.filter((_, i) => i !== index));
    };

    const updateDataInput = (index: number, field: string, value: any) => {
        const updatedInputs = [...dataInputs];
        updatedInputs[index] = { ...updatedInputs[index], [field]: value };
        setDataInputs(updatedInputs);
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
                                    <p className="text-sm text-gray-600 mt-1">A descriptive name for this action. This will help the AI agent know when to use it.</p>
                                    <Input id="actionName" placeholder="e.g., Update_Subscription" className="mt-2 border-[2px] border-gray-900" />
                                </div>
                                <div>
                                    <Label htmlFor="whenToUse" className="text-gray-900">When to Use</Label>
                                    <p className="text-sm text-gray-600 mt-1">Explain when the AI Agent should use this action. Include a description of what this action does, the data it provides, and any updates it makes. Include example queries that should trigger this action.</p>
                                    <Textarea
                                        id="whenToUse"
                                        placeholder="Describe when the AI agent should use this action..."
                                        className="mt-2 border-[2px] border-gray-900"
                                        rows={5}
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-900">Action Type</Label>
                                    <RadioGroup defaultValue="server" onValueChange={setActionType} className="flex space-x-4 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="server" id="server" />
                                            <Label htmlFor="server" className="text-gray-900">
                                                Server Action
                                                <p className="text-sm text-gray-600">This action will be executed on the server. There is no need to write any client-side code.</p>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="client" id="client" />
                                            <Label htmlFor="client" className="text-gray-900">
                                                Client Action
                                                <p className="text-sm text-gray-600">This action will be executed on the client. You will need to write some client-side code. Explore the docs.</p>
                                            </Label>
                                        </div>
                                    </RadioGroup>
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
                                    <Label className="text-gray-900">Collect Data Inputs from User (Optional)</Label>
                                    <p className="text-sm text-gray-600 mt-1">List any information the AI Agent needs from the user to perform the action. The agent can find the data in the chat history, request it from the user, or retrieve it from the user's metadata if available.</p>
                                    {dataInputs.map((input, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_50px_50px] gap-4 mt-4 items-end">
                                            <div>
                                                <Label htmlFor={`inputName${index}`}>Name</Label>
                                                <Input
                                                    id={`inputName${index}`}
                                                    value={input.name}
                                                    onChange={(e) => updateDataInput(index, "name", e.target.value)}
                                                    placeholder="e.g., City"
                                                    className="mt-2 border-[2px] border-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`inputType${index}`}>Type</Label>
                                                <Select
                                                    value={input.type}
                                                    onValueChange={(value) => updateDataInput(index, "type", value)}
                                                >
                                                    <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Text">Text</SelectItem>
                                                        <SelectItem value="Number">Number</SelectItem>
                                                        <SelectItem value="Boolean">Boolean</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor={`inputDesc${index}`}>Description</Label>
                                                <Input
                                                    id={`inputDesc${index}`}
                                                    value={input.description}
                                                    onChange={(e) => updateDataInput(index, "description", e.target.value)}
                                                    placeholder="e.g., The city to get weather for"
                                                    className="mt-2 border-[2px] border-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`inputArray${index}`}>Array</Label>
                                                <div className="mt-2">
                                                    <input
                                                        id={`inputArray${index}`}
                                                        type="checkbox"
                                                        checked={input.isArray}
                                                        onChange={(e) => updateDataInput(index, "isArray", e.target.checked)}
                                                        className="border-[2px] border-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    className="bg-[#FFFDF8] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                                    onClick={() => removeDataInput(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                        onClick={addDataInput}
                                    >
                                        Add Data Input
                                    </Button>
                                </div>
                                <div>
                                    <Label className="text-gray-900">API Request</Label>
                                    <p className="text-sm text-gray-600 mt-1">The API endpoint that should be called by the AI Agent to retrieve data or to send updates. You can include data inputs (variables) collected from the user in the URL or the request body.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_150px] gap-4 mt-4">
                                        <div>
                                            <Label htmlFor="apiMethod">Method</Label>
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
                                            <Label htmlFor="apiUrl">HTTPS URL</Label>
                                            <Input id="apiUrl" placeholder="e.g., https://wttr.in/{{city}}?format=j1" className="mt-2 border-[2px] border-gray-900" />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                variant="outline"
                                                className="bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                            >
                                                Add a Variable
                                            </Button>
                                        </div>
                                    </div>
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
                                        Add Key Value Pair
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
                                    <Label htmlFor="apiBody" className="text-gray-900">Body</Label>
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
            </motion.div>
        </div>
    );
}