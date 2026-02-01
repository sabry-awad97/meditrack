import { Search } from "lucide-react";
import { useDirection } from "@meditrack/i18n";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  const { isRTL } = useDirection();

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
          isRTL ? "right-3" : "left-3",
        )}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={isRTL ? "pr-10" : "pl-10"}
      />
    </div>
  );
}
