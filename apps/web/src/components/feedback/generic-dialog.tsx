import type { ReactNode } from "react";
import { useDirection } from "@meditrack/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface GenericDialogProps {
  // Dialog state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;

  // Content
  children: ReactNode;

  // Footer actions
  actions?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
  }[];

  // Layout options
  size?: "sm" | "md" | "lg" | "xl" | "full";
  fullHeight?: boolean; // For form dialogs
  scrollable?: boolean; // Whether content should scroll

  // Style options
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;

  // Behavior
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-3xl",
};

export function GenericDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  actions,
  size = "md",
  fullHeight = false,
  scrollable = true,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  closeOnOverlayClick = true,
}: GenericDialogProps) {
  const { isRTL } = useDirection();

  return (
    <Dialog
      open={open}
      onOpenChange={closeOnOverlayClick ? onOpenChange : undefined}
    >
      <DialogContent
        className={cn(
          sizeClasses[size],
          fullHeight && "h-[90vh] flex flex-col p-0",
          className,
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          className={cn(
            fullHeight && "p-4 border-b shrink-0",
            !fullHeight && "pb-4",
            headerClassName,
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn(
                "flex items-center gap-2",
                fullHeight && "text-2xl",
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Content */}
        <div
          className={cn(
            fullHeight && "flex-1 overflow-y-auto p-6",
            !fullHeight && scrollable && "max-h-[60vh] overflow-y-auto",
            contentClassName,
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {actions && actions.length > 0 && (
          <div
            className={cn(
              fullHeight && "p-4 border-t shrink-0",
              !fullHeight && "pt-4",
              footerClassName,
            )}
          >
            <DialogFooter className={cn("gap-2", isRTL && "flex-row-reverse")}>
              {actions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className={cn(ActionIcon && "gap-2")}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {action.label}
                  </Button>
                );
              })}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
