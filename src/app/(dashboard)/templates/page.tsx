'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/lib/store/template-store';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplateCreateDialog } from '@/components/templates/template-create-dialog';
import { TemplateCategories, TemplateFilters } from '@/components/templates/template-filters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type SortOption = 'popular' | 'newest' | 'oldest' | 'alphabetical';

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, fetchTemplates, useTemplate, isLoading, error } = useTemplateStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('popular');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleUseTemplate = async (templateId: string) => {
    try {
      const boardId = await useTemplate(templateId);
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const filteredAndSortedTemplates = templates
    .filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'newest':
          return -1; // Mock implementation - would use creation date
        case 'oldest':
          return 1; // Mock implementation - would use creation date
        case 'popular':
        default:
          return -1; // Mock implementation - would use popularity metrics
      }
    });

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error loading templates</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start your project with a pre-built template
          </p>
        </div>
        <TemplateCreateDialog />
      </div>

      <TemplateCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <TemplateFilters
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-[300px] rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
          {filteredAndSortedTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-semibold">No templates found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 