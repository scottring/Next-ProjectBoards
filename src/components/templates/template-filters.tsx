import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type SortOption = 'popular' | 'newest' | 'oldest' | 'alphabetical';

interface TemplateCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface TemplateFiltersProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function TemplateCategories({ selectedCategory, onSelectCategory }: TemplateCategoriesProps) {
  const categories = [
    "All",
    "Project Management",
    "Marketing",
    "Development",
    "Design",
    "Sales",
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={category === selectedCategory ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}

export function TemplateFilters({ sortOption, onSortChange }: TemplateFiltersProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Sort by: {sortOptions.find(opt => opt.value === sortOption)?.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 