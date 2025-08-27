'use client';

import { VideoTemplate } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Badge } from '@/app/(frontend)/components/ui/badge';

interface VideoTemplateSelectorProps {
  templates: VideoTemplate[];
  selectedTemplate: VideoTemplate;
  onTemplateChange: (template: VideoTemplate) => void;
}

export function VideoTemplateSelector({
  templates,
  selectedTemplate,
  onTemplateChange,
}: VideoTemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Templates</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a template that controls the video structure and timing
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTemplate.id === template.id
                ? 'border-brand bg-brand/5'
                : 'border-muted hover:border-brand/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-foreground">{template.name}</h3>
              {selectedTemplate.id === template.id && (
                <Badge className="bg-brand text-white">Active</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {template.description}
            </p>

            {/* Template Stats */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Scenes:</span>
                <span>{template.config.scenes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>
                  {Math.round(template.config.timings.sceneDuration / 1000)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Style:</span>
                <span className="capitalize">
                  {template.config.styling.borderRadius === '24px'
                    ? 'Modern'
                    : 'Classic'}
                </span>
              </div>
            </div>

            {/* Scene Flow Preview */}
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="text-xs font-medium text-foreground mb-2">
                Flow:
              </div>
              <div className="flex flex-wrap gap-1">
                {template.config.scenes.map((scene, index) => (
                  <Badge
                    key={scene.id}
                    variant="outline"
                    className="text-xs py-0"
                  >
                    {index + 1}. {scene.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
