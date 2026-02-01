import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string | null;
  label: string;
}

interface FilterSelectProps<T extends string = string> {
  items: FilterOption[];
  value: T | "all" | null;
  onValueChange: (value: T | "all" | null) => void;
  placeholder?: string;
  className?: string;
}

export function FilterSelect<T extends string = string>({
  items,
  value,
  onValueChange,
  placeholder = "Select...",
  className,
}: FilterSelectProps<T>) {
  return (
    <Select
      items={items}
      value={value as string | null}
      onValueChange={onValueChange as (value: string | null) => void}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items
          .filter((item) => item.value !== null)
          .map((item) => (
            <SelectItem key={item.value} value={item.value as string}>
              {item.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
