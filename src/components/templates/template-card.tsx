import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Template } from '@/types';
import { TemplatePreview } from './template-preview';

interface TemplateCardProps {
  template: Template;
  onUse: (templateId: string) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => onUse(template.id)}
              >
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TemplatePreview
        template={template}
        isOpen={showPreview}
        onOpenChange={setShowPreview}
      />
    </>
  );
} 