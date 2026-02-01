import { type ReactNode, type FormEvent } from "react";
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
import { Loader2 } from "lucide-react";

export interface FormDialogProps {
  // Dialog state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;

  // Content (form fields)
  children: ReactNode;

  // Form handling
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;

  // Submit button
  submitLabel: string;
  submitIcon?: LucideIcon;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  submitDisabled?: boolean;
  isSubmitting?: boolean;

  // Cancel button
  cancelLabel?: string;
  showCancelButton?: boolean;

  // Layout options
  size?: "sm" | "md" | "lg" | "xl" | "full" | "4xl";
  fullHeight?: boolean;

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
  "4xl": "sm:max-w-4xl",
  full: "sm:max-w-3xl",
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  onSubmit,
  onCancel,
  submitLabel,
  submitIcon: SubmitIcon,
  submitVariant = "default",
  submitDisabled = false,
  isSubmitting = false,
  cancelLabel,
  showCancelButton = true,
  size = "md",
  fullHeight = false,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  closeOnOverlayClick = true,
}: FormDialogProps) {
  const { isRTL } = useDirection();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={closeOnOverlayClick ? onOpenChange : undefined}
    >
      <DialogContent
        className={cn(
          sizeClasses[size],
          fullHeight && "h-[90vh] flex flex-col p-0 gap-0",
          className,
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <form
          onSubmit={onSubmit}
          className={cn("flex flex-col", fullHeight ? "h-full" : "gap-4")}
        >
          {/* Header */}
          <div
            className={cn(
              fullHeight && "p-6 border-b shrink-0",
              !fullHeight && "pb-2",
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
              !fullHeight && "max-h-[60vh] overflow-y-auto",
              contentClassName,
            )}
          >
            {children}
          </div>

          {/* Footer */}
          <div
            className={cn(
              fullHeight && "p-4 border-t shrink-0",
              !fullHeight && "pt-4",
              footerClassName,
            )}
          >
            <DialogFooter className="gap-2">
              {showCancelButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {cancelLabel || "Cancel"}
                </Button>
              )}
              <Button
                type="submit"
                variant={submitVariant}
                disabled={submitDisabled || isSubmitting}
                className={cn(SubmitIcon && "gap-2")}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  SubmitIcon && <SubmitIcon className="h-4 w-4" />
                )}
                {submitLabel}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
