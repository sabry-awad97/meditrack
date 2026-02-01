import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface ComboboxSelectProps<T = string> {
  items: ComboboxOption<T>[];
  value?: T | null;
  onValueChange: (value: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  renderItem?: (item: ComboboxOption<T>) => React.ReactNode;
  virtualizeThreshold?: number; // Number of items before virtualization kicks in
}

export function ComboboxSelect<T = string>({
  items,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  className,
  disabled = false,
  renderItem,
  virtualizeThreshold = 50, // Default to virtualize when more than 50 items
}: ComboboxSelectProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Find the selected item
  const selectedItem = items.find((item) => item.value === value);

  // Create a default item for placeholder
  const defaultItem: ComboboxOption<T> = {
    value: null as T,
    label: placeholder,
  };

  // Only virtualize if items exceed threshold
  const shouldVirtualize = items.length > virtualizeThreshold;

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // Estimated height of each item in pixels
    overscan: 5, // Number of items to render outside of the visible area
  });

  const renderItemContent = (item: ComboboxOption<T>) => {
    if (renderItem) {
      return renderItem(item);
    }
    if (item.description) {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{item.label}</span>
          <span className="text-xs text-muted-foreground">
            {item.description}
          </span>
        </div>
      );
    }
    return item.label;
  };

  return (
    <Combobox
      items={items}
      value={selectedItem || defaultItem}
      onValueChange={(item) => {
        if (item && item.value !== null) {
          onValueChange(item.value);
        } else {
          onValueChange(null);
        }
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between font-normal",
              !selectedItem && "text-muted-foreground",
              className,
            )}
            disabled={disabled}
          >
            <ComboboxValue />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder={searchPlaceholder} />
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        {shouldVirtualize ? (
          <div
            ref={parentRef}
            className="max-h-[300px] overflow-auto"
            style={{ contain: "strict" }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = items[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <ComboboxItem
                      value={item}
                      disabled={item.disabled}
                      className="cursor-pointer"
                    >
                      {renderItemContent(item)}
                    </ComboboxItem>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <ComboboxList>
            {(item) => (
              <ComboboxItem
                key={String(item.value)}
                value={item}
                disabled={item.disabled}
              >
                {renderItemContent(item)}
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
