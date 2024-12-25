import { create } from 'zustand';
import { Template } from '@/types';
import { useBoardStore } from './board-store';

interface TemplateStore {
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<Template, 'id'>) => Promise<Template>;
  useTemplate: (templateId: string) => Promise<string>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    try {
      set({ isLoading: true, error: null });
      // Mock API call
      const templates: Template[] = [
        {
          id: '1',
          name: 'Project Planning',
          description: 'A template for planning software projects',
          thumbnail: '/templates/project-planning.png',
          category: 'Project Management',
          tasks: [
            {
              id: '1',
              title: 'Requirements Gathering',
              description: 'Collect and document project requirements',
              priority: 'high',
              startDate: new Date(),
              duration: 120,
            },
            {
              id: '2',
              title: 'Design Phase',
              description: 'Create system architecture and design documents',
              priority: 'medium',
              startDate: new Date(),
              duration: 180,
            },
          ],
          settings: {
            layout: {
              showSidebar: true,
              showTimeline: true,
            },
          },
        },
        {
          id: '2',
          name: 'Marketing Campaign',
          description: 'Plan and execute marketing campaigns effectively',
          thumbnail: '/templates/marketing.png',
          category: 'Marketing',
          tasks: [
            {
              id: '1',
              title: 'Market Research',
              description: 'Analyze target audience and competitors',
              priority: 'high',
              startDate: new Date(),
              duration: 90,
            },
            {
              id: '2',
              title: 'Content Creation',
              description: 'Create marketing materials and content',
              priority: 'medium',
              startDate: new Date(),
              duration: 150,
            },
          ],
          settings: {
            layout: {
              showSidebar: true,
              showTimeline: true,
            },
          },
        },
      ];
      set({ templates, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch templates', isLoading: false });
    }
  },

  createTemplate: async (template) => {
    try {
      set({ isLoading: true, error: null });
      const newTemplate: Template = {
        ...template,
        id: Math.random().toString(36).substring(7),
      };
      set((state) => ({
        templates: [...state.templates, newTemplate],
        isLoading: false,
      }));
      return newTemplate;
    } catch (error) {
      set({ error: 'Failed to create template', isLoading: false });
      throw error;
    }
  },

  useTemplate: async (templateId) => {
    try {
      set({ isLoading: true, error: null });
      const template = get().templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Create a new board from the template
      const boardStore = useBoardStore.getState();
      const newBoard = await boardStore.createBoard({
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        tasks: template.tasks,
        settings: template.settings,
      });

      set({ selectedTemplate: template, isLoading: false });
      return newBoard.id;
    } catch (error) {
      set({ error: 'Failed to use template', isLoading: false });
      throw error;
    }
  },
})); 