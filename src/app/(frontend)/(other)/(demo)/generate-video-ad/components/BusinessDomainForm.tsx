'use client';

import { useState, useEffect } from 'react';
import { BusinessDomain, VideoTemplate } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/(frontend)/components/ui/card';
import { Badge } from '@/app/(frontend)/components/ui/badge';

interface BusinessDomainFormProps {
  selectedTemplate: VideoTemplate;
  onGenerate: (domain: BusinessDomain) => void;
  isGenerating: boolean;
  existingDomain?: BusinessDomain | null;
}

export function BusinessDomainForm({ 
  selectedTemplate, 
  onGenerate, 
  isGenerating, 
  existingDomain 
}: BusinessDomainFormProps) {
  const [formData, setFormData] = useState<BusinessDomain>({
    companyName: '',
    tagline: '',
    description: '',
    valueProposition: '',
    primaryQuery: '',
    secondaryQuery: '',
    metrics: [
      { label: 'Revenue', value: 347, type: 'currency' },
      { label: 'Growth Rate', value: 18, type: 'percentage' },
    ],
    dashboardData: {
      title: 'Support Tickets',
      items: [
        {
          id: '#12847',
          title: 'Payment Processing Error',
          description: 'Customer unable to complete checkout',
          status: 'Open',
          priority: 'High'
        },
        {
          id: '#12846',
          title: 'Billing Question',
          description: 'Invoice clarification needed',
          status: 'Resolved',
          priority: 'Low'
        }
      ]
    }
  });

  // Load existing domain data if provided
  useEffect(() => {
    if (existingDomain) {
      setFormData(existingDomain);
    }
  }, [existingDomain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleMetricChange = (index: number, field: string, value: any) => {
    const updatedMetrics = [...formData.metrics];
    updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
    setFormData({ ...formData, metrics: updatedMetrics });
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...formData.metrics, { label: '', value: 0, type: 'count' }]
    });
  };

  const removeMetric = (index: number) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.filter((_, i) => i !== index)
    });
  };

  const handleDashboardItemChange = (index: number, field: string, value: string) => {
    if (!formData.dashboardData) return;
    
    const updatedItems = [...formData.dashboardData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({
      ...formData,
      dashboardData: { ...formData.dashboardData, items: updatedItems }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Business Domain Configuration</span>
          <Badge variant="secondary">{selectedTemplate.name}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in your business information to generate a personalized demo video
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="Your Company Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="An AI-powered solution for..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="Briefly describe what your company does..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Value Proposition *
              </label>
              <textarea
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="What makes you unique? What problems do you solve?"
                required
              />
            </div>
          </div>

          {/* Demo Queries */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Demo Queries</h3>
            <p className="text-sm text-muted-foreground">
              These are the questions that will be asked in your demo video
            </p>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Query *
              </label>
              <input
                type="text"
                value={formData.primaryQuery}
                onChange={(e) => setFormData({ ...formData, primaryQuery: e.target.value })}
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="Show me revenue numbers for North America"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Secondary Query
              </label>
              <input
                type="text"
                value={formData.secondaryQuery || ''}
                onChange={(e) => setFormData({ ...formData, secondaryQuery: e.target.value })}
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="How many support tickets did we have today?"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Metrics to Showcase</h3>
              <button
                type="button"
                onClick={addMetric}
                className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                Add Metric
              </button>
            </div>
            
            {formData.metrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-muted rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="Revenue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    value={metric.value}
                    onChange={(e) => handleMetricChange(index, 'value', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="347"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={metric.type}
                    onChange={(e) => handleMetricChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="count">Count</option>
                    <option value="currency">Currency</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  {formData.metrics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Data */}
          {formData.dashboardData && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Dashboard/Table Data</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Table Title
                </label>
                <input
                  type="text"
                  value={formData.dashboardData.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    dashboardData: { ...formData.dashboardData!, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="Support Tickets"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Table Items
                </label>
                {formData.dashboardData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-muted rounded-lg">
                    <div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleDashboardItemChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Item title"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.status}
                        onChange={(e) => handleDashboardItemChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Status"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleDashboardItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Demo Video...
                </>
              ) : (
                'Generate Demo Video'
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}