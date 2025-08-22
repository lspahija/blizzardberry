'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import {
  Bot,
  Send,
  BarChart3,
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ShoppingCart,
  Package,
  CreditCard,
  Play,
  PauseCircle,
} from 'lucide-react';

interface DashboardData {
  totalRevenue: string;
  northAmericaRevenue: string;
  europeRevenue: string;
  asiaRevenue: string;
  totalOrders: number;
  totalCustomers: number;
}

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean; timestamp: string }>
  >([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: '$2,845,120',
    northAmericaRevenue: '$1,640,890',
    europeRevenue: '$864,230',
    asiaRevenue: '$340,000',
    totalOrders: 15234,
    totalCustomers: 8942,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [highlightRegion, setHighlightRegion] = useState<string | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const startDemo = async () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setIsPlaying(true);
    setMessages([]);
    setHighlightRegion(null);
    setCurrentMessage('');

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Initial setup
      setDashboardData({
        totalRevenue: '$2,845,120',
        northAmericaRevenue: '$1,640,890',
        europeRevenue: '$864,230',
        asiaRevenue: '$340,000',
        totalOrders: 15234,
        totalCustomers: 8942,
      });

      await delay(1000);

      // Scenario 1: North America request
      await simulateUserTypingAsync(
        'Show me revenue numbers for North America'
      );
      await delay(1000);

      setIsTyping(true);
      await delay(1500);

      setIsTyping(false);
      setMessages((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [
          ...prevArray,
          {
            text: "I'll pull up the North America revenue data for you right now.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      });

      setHighlightRegion('north-america');
      await delay(1000);

      setMessages((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [
          ...prevArray,
          {
            text: 'North America revenue: $1,640,890 (57.7% of total revenue). This represents a 12.3% increase from last quarter.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      });

      await delay(2000);

      // Scenario 2: Europe request
      setHighlightRegion(null);
      await simulateUserTypingAsync(
        'Now show me how many orders came from Europe'
      );
      await delay(1000);

      setIsTyping(true);
      setHighlightRegion('europe');
      await delay(1500);

      setIsTyping(false);
      setMessages((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [
          ...prevArray,
          {
            text: "Europe generated $864,230 in revenue from 4,892 orders. That's an average order value of $176.50.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      });

      await delay(3000);

      // Scenario 3: Support ticket
      setHighlightRegion(null);
      await simulateUserTypingAsync(
        "Create a customer support ticket for the Johnson account - they're having billing issues"
      );
      await delay(1000);

      setIsTyping(true);
      await delay(2000);

      setIsTyping(false);
      setMessages((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [
          ...prevArray,
          {
            text: "✅ Support ticket #SP-2024-1847 created for Johnson account. Priority: High. Issue: Billing. Assigned to Sarah Mitchell in Customer Success. They'll receive an email notification within 5 minutes.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      });

      await delay(4000);
    } catch (error) {
      console.error('Demo error:', error);
    }

    setIsPlaying(false);
    // Auto-restart
    setTimeout(() => {
      startDemo();
    }, 2000);
  };

  const simulateUserTypingAsync = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentMessage('');
      let i = 0;
      const interval = setInterval(() => {
        setCurrentMessage(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => {
            setMessages((prev) => {
              const prevArray = Array.isArray(prev) ? prev : [];
              return [
                ...prevArray,
                {
                  text: text,
                  isUser: true,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ];
            });
            setCurrentMessage('');
            resolve();
          }, 500);
        }
      }, 50);
    });
  };

  useEffect(() => {
    // Auto-start demo after component mounts
    const timer = setTimeout(() => {
      startDemo();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-4">
      {/* Control Panel */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={startDemo}
          disabled={isPlaying}
          className="bg-brand text-white"
        >
          {isPlaying ? (
            <PauseCircle className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isPlaying ? 'Playing...' : 'Restart Demo'}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Dashboard
          </h1>
          <p className="text-gray-600">
            Your AI assistant is ready to help with data analysis and tasks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Dashboard */}
          <div id="dashboard" className="lg:col-span-3 space-y-6">
            {/* Revenue Overview */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      {dashboardData.totalRevenue}
                    </div>
                    <div className="text-sm text-blue-600">Total Revenue</div>
                  </div>

                  <div
                    id="north-america-card"
                    className={`text-center p-4 rounded-lg border transition-all duration-500 transform ${
                      highlightRegion === 'north-america'
                        ? 'bg-green-50 border-green-400 scale-105 shadow-lg ring-2 ring-green-200'
                        : 'bg-gray-50 border-gray-200 scale-100 shadow-sm'
                    }`}
                  >
                    <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      {dashboardData.northAmericaRevenue}
                    </div>
                    <div className="text-sm text-green-600">North America</div>
                  </div>

                  <div
                    id="europe-card"
                    className={`text-center p-4 rounded-lg border transition-all duration-500 transform ${
                      highlightRegion === 'europe'
                        ? 'bg-blue-50 border-blue-400 scale-105 shadow-lg ring-2 ring-blue-200'
                        : 'bg-gray-50 border-gray-200 scale-100 shadow-sm'
                    }`}
                  >
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      {dashboardData.europeRevenue}
                    </div>
                    <div className="text-sm text-blue-600">Europe</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">
                      {dashboardData.asiaRevenue}
                    </div>
                    <div className="text-sm text-purple-600">Asia</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalOrders.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalCustomers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">+12.3%</div>
                  <div className="text-sm text-gray-600">Growth Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">New order #ORD-15234</div>
                      <div className="text-sm text-gray-600">
                        Customer: Sarah Wilson - $234.50
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2 min ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Payment processed</div>
                      <div className="text-sm text-gray-600">
                        Invoice #INV-2024-1847 - $1,250.00
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">5 min ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">New customer registered</div>
                      <div className="text-sm text-gray-600">
                        Michael Chen - Enterprise Plan
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">12 min ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Widget */}
          <div id="chat-widget" className="lg:col-span-1">
            <Card className="border shadow-sm h-[600px] flex flex-col">
              <CardHeader className="border-b bg-brand text-white">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-center text-sm text-gray-500 mb-4">
                    AI assistant is ready to help with your dashboard data and
                    tasks
                  </div>

                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-brand text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: '0.4s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t p-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <input
                      type="text"
                      value={currentMessage}
                      readOnly
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                    <Button size="sm" className="bg-brand text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
