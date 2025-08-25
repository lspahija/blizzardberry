'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Image from 'next/image';
import { LabelList, RadialBar, RadialBarChart, BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/(frontend)/components/ui/chart';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Badge } from '@/app/(frontend)/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/(frontend)/components/ui/table';
import { BusinessDomain, VideoTemplate, GeneratedScene } from '../types';

// Register GSAP plugins
gsap.registerPlugin(TextPlugin);

interface VideoRendererProps {
  template: VideoTemplate;
  businessDomain: BusinessDomain;
  scenes: GeneratedScene[];
}

export function VideoRenderer({ template, businessDomain, scenes }: VideoRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create chart data from metrics
  const chartData = businessDomain.metrics
    .filter(m => typeof m.value === 'number')
    .slice(0, 6)
    .map((metric, index) => ({
      name: metric.label,
      value: metric.value as number,
      fill: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index] || '#3B82F6'
    }));

  const chartConfig = chartData.reduce((config, data) => ({
    ...config,
    [data.name]: {
      label: data.name,
      color: data.fill,
    }
  }), {} as ChartConfig);

  // Build and play timeline
  const buildTimeline = () => {
    const tl = gsap.timeline({
      onUpdate: () => {
        const progress = tl.progress() * 100;
        setProgress(progress);
      },
      onComplete: () => {
        setIsPlaying(false);
        setProgress(100);
      }
    });

    let currentTime = 0;

    scenes.forEach((scene, index) => {
      // Scene entrance
      tl.addLabel(`scene${index}`, currentTime / 1000)
        .call(() => {
          setCurrentSceneIndex(index);
          showScene(scene, index);
        }, undefined, `scene${index}`)
        
        // Scene exit
        .call(() => {
          if (index < scenes.length - 1) {
            hideScene(scene, index);
          }
        }, undefined, `scene${index}+=${scene.duration / 1000}`);

      currentTime += scene.duration;
    });

    return tl;
  };

  // Show scene with animations
  const showScene = (scene: GeneratedScene, index: number) => {
    const sceneElement = document.getElementById(`scene-${index}`);
    if (!sceneElement) return;

    // Make scene visible
    sceneElement.style.display = 'block';
    sceneElement.style.opacity = '1';

    // Execute scene-specific logic
    executeSceneLogic(scene, index);
  };

  // Hide scene
  const hideScene = (scene: GeneratedScene, index: number) => {
    const sceneElement = document.getElementById(`scene-${index}`);
    if (!sceneElement) return;

    gsap.to(sceneElement, {
      opacity: 0,
      duration: template.config.timings.transitionSpeed / 1000,
      onComplete: () => {
        sceneElement.style.display = 'none';
      }
    });
  };

  // Execute scene-specific logic
  const executeSceneLogic = (scene: GeneratedScene, index: number) => {
    const sceneElement = document.getElementById(`scene-${index}`);
    if (!sceneElement) return;

    // Apply entrance animation
    const entranceClass = `animate-${scene.animations.entrance}`;
    sceneElement.classList.add(entranceClass);

    // Execute type-specific logic with delays
    setTimeout(() => {
      switch (scene.type) {
        case 'demo':
          executeDemoScene(scene, sceneElement);
          break;
        case 'dashboard':
          executeDashboardScene(scene, sceneElement);
          break;
        case 'data':
          executeDataScene(scene, sceneElement);
          break;
        default:
          executeGenericScene(scene, sceneElement);
      }
    }, 500);
  };

  // Execute demo (chat) scene
  const executeDemoScene = (scene: GeneratedScene, element: HTMLElement) => {
    if (!scene.content.query || !scene.content.response) return;

    const inputElement = element.querySelector('.scene-input') as HTMLInputElement;
    const messagesElement = element.querySelector('.scene-messages');

    if (inputElement && messagesElement) {
      // Type query
      typeText(inputElement, scene.content.query, template.config.timings.typingSpeed, () => {
        // Add user message
        setTimeout(() => {
          addMessage(messagesElement, scene.content.query!, 'user');
          
          // Show typing indicator, then response
          setTimeout(() => {
            addMessage(messagesElement, scene.content.response!, 'assistant');
          }, 1500);
        }, 500);
      });
    }
  };

  // Execute dashboard scene
  const executeDashboardScene = (scene: GeneratedScene, element: HTMLElement) => {
    setTimeout(() => {
      // Animate metrics
      const metricElements = element.querySelectorAll('.metric-value');
      metricElements.forEach((metricEl) => {
        const target = parseInt(metricEl.getAttribute('data-value') || '0');
        animateCounter(metricEl as HTMLElement, target);
      });
    }, 800);
  };

  // Execute data scene
  const executeDataScene = (scene: GeneratedScene, element: HTMLElement) => {
    setTimeout(() => {
      const rows = element.querySelectorAll('.data-row');
      rows.forEach((row, index) => {
        setTimeout(() => {
          (row as HTMLElement).style.opacity = '1';
          (row as HTMLElement).style.transform = 'translateX(0)';
        }, index * 150);
      });
    }, 1000);
  };

  // Execute generic scene
  const executeGenericScene = (scene: GeneratedScene, element: HTMLElement) => {
    // Basic fade in animation for generic scenes
    gsap.fromTo(element.children, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 }
    );
  };

  // Utility functions
  const typeText = (element: HTMLInputElement, text: string, speed: number, callback?: () => void) => {
    element.value = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    };
    type();
  };

  const addMessage = (container: Element, text: string, type: 'user' | 'assistant') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
    messageDiv.innerHTML = `
      <div class="max-w-md px-4 py-2 rounded-lg ${
        type === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }">
        ${text}
      </div>
    `;
    container.appendChild(messageDiv);

    // Animate message in
    gsap.fromTo(messageDiv, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 }
    );
  };

  const animateCounter = (element: HTMLElement, target: number) => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.ceil(obj.value).toLocaleString();
      }
    });
  };

  // Control functions
  const handlePlay = () => {
    if (!masterTimelineRef.current) {
      masterTimelineRef.current = buildTimeline();
    }
    masterTimelineRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    masterTimelineRef.current?.pause();
    setIsPlaying(false);
  };

  const handleRestart = () => {
    masterTimelineRef.current?.kill();
    masterTimelineRef.current = buildTimeline();
    masterTimelineRef.current.play();
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    setProgress(0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      masterTimelineRef.current?.kill();
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Demo Video</CardTitle>
            <p className="text-sm text-muted-foreground">
              {businessDomain.companyName} • {template.name}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50"
            >
              ▶ Play
            </button>
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ↻ Restart
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-brand h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Scene indicators */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {scenes.map((scene, index) => (
            <Badge
              key={scene.id}
              variant={index === currentSceneIndex ? 'default' : 'outline'}
              className="text-xs capitalize"
            >
              {scene.type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={containerRef}
          className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden"
          style={{ 
            height: template.config.styling.windowSize.height,
            backgroundColor: template.config.styling.backgroundColor 
          }}
        >
          {/* Render all scenes */}
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              id={`scene-${index}`}
              className="absolute inset-0 flex items-center justify-center p-8"
              style={{ display: 'none', opacity: 0 }}
            >
              {scene.type === 'intro' && (
                <div className="text-center">
                  <h1 className="scene-title text-4xl font-bold text-gray-800 mb-4">
                    {scene.content.title}
                  </h1>
                  <p className="scene-subtitle text-xl text-gray-600 mb-6">
                    {scene.content.subtitle}
                  </p>
                  <p className="scene-text text-gray-500">
                    {scene.content.text}
                  </p>
                </div>
              )}
              
              {scene.type === 'demo' && (
                <div className="w-full max-w-lg">
                  <div className="bg-white rounded-lg border shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">{scene.content.title}</h3>
                    <div className="space-y-4">
                      <input
                        className="scene-input w-full px-4 py-2 border rounded-lg"
                        placeholder="Ask a question..."
                        readOnly
                      />
                      <div className="scene-messages min-h-[200px]">
                        {/* Messages will be added dynamically */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {scene.type === 'dashboard' && (
                <div className="w-full">
                  <div className="bg-white rounded-lg border shadow-lg p-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {scene.content.title}
                      </h2>
                      <p className="text-gray-600">{scene.content.subtitle}</p>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                      {scene.content.metrics?.slice(0, 3).map((metric, idx) => (
                        <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {metric.type === 'currency' && '$'}
                            <span className="metric-value" data-value={metric.value}>0</span>
                            {metric.type === 'percentage' && '%'}
                            {metric.type === 'currency' && 'K'}
                          </div>
                          <div className="text-sm text-gray-600">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart */}
                    {chartData.length > 0 && (
                      <div className="h-64">
                        <ChartContainer config={chartConfig}>
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="currentColor" />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {scene.type === 'data' && (
                <div className="w-full">
                  <div className="bg-white rounded-lg border shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {scene.content.title}
                    </h2>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-600">
                          {scene.content.data?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-600">
                          {scene.content.data?.filter((item: any) => item.status?.toLowerCase() === 'resolved').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Resolved</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-xl font-bold text-orange-600">
                          {scene.content.data?.filter((item: any) => item.status?.toLowerCase() === 'open').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Open</div>
                      </div>
                    </div>
                    
                    {/* Data Table */}
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scene.content.data?.map((item: any, idx: number) => (
                            <TableRow 
                              key={item.id} 
                              className="data-row"
                              style={{ 
                                opacity: 0, 
                                transform: 'translateX(-20px)',
                                transition: 'all 0.5s ease'
                              }}
                            >
                              <TableCell className="font-mono text-sm">{item.id}</TableCell>
                              <TableCell>
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-500">{item.description}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  item.status?.toLowerCase() === 'open' ? 'destructive' :
                                  item.status?.toLowerCase() === 'resolved' ? 'default' : 'secondary'
                                }>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.priority}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              
              {scene.type === 'outro' && (
                <div className="text-center">
                  <div className="brand-logo mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {businessDomain.companyName.charAt(0)}
                    </div>
                  </div>
                  <h1 className="brand-name text-5xl font-bold text-gray-800 mb-4">
                    {scene.content.title}
                  </h1>
                  <p className="brand-tagline text-xl text-gray-600 mb-6">
                    {scene.content.subtitle}
                  </p>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    {scene.content.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}