import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  DollarSign,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useDirection, useTranslation } from "@meditrack/i18n";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useActiveManufacturers } from "@/hooks";
import type {
  CreateInventoryItemWithStock,
  InventoryItemWithStockResponse,
} from "@/api/inventory.api";
import {
  BasicInfoStep,
  StockPricingStep,
  ClassificationStep,
  ReviewStep,
  type FormData,
  type ValidationErrors,
} from "./form";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInventoryItemWithStock) => void;
  mode?: "create" | "edit";
  item?: InventoryItemWithStockResponse | null;
}

const getSteps = (t: (key: string) => string) => [
  {
    id: 1,
    title: t("form.step1.title"),
    description: t("form.step1.description"),
    icon: Package,
  },
  {
    id: 2,
    title: t("form.step2.title"),
    description: t("form.step2.description"),
    icon: DollarSign,
  },
  {
    id: 3,
    title: t("form.step3.title"),
    description: t("form.step3.description"),
    icon: Shield,
  },
  {
    id: 4,
    title: t("form.step4.title"),
    description: t("form.step4.description"),
    icon: Check,
  },
];

export function InventoryForm({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  item = null,
}: InventoryFormProps) {
  const { isRTL } = useDirection();
  const { t } = useTranslation("inventory");
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const STEPS = getSteps(t);

  // Fetch active manufacturers for dropdown
  const { data: manufacturers = [], isLoading: isLoadingManufacturers } =
    useActiveManufacturers();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    generic_name: "",
    concentration: "",
    form: "",
    manufacturer_id: "",
    barcode: "",
    stock_quantity: "0",
    min_stock_level: "10",
    unit_price: "0",
    requires_prescription: false,
    is_controlled: false,
    storage_instructions: "",
    notes: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (open && mode === "edit" && item) {
      setFormData({
        name: item.name,
        generic_name: item.generic_name || "",
        concentration: item.concentration,
        form: item.form,
        manufacturer_id: item.manufacturer_id || "",
        barcode:
          item.barcodes.find((b) => b.is_primary)?.barcode ||
          item.barcodes[0]?.barcode ||
          "",
        stock_quantity: item.stock_quantity.toString(),
        min_stock_level: item.min_stock_level.toString(),
        unit_price: item.unit_price.toString(),
        requires_prescription: item.requires_prescription,
        is_controlled: item.is_controlled,
        storage_instructions: item.storage_instructions || "",
        notes: item.notes || "",
      });
    } else if (open && mode === "create") {
      setFormData({
        name: "",
        generic_name: "",
        concentration: "",
        form: "",
        manufacturer_id: "",
        barcode: "",
        stock_quantity: "0",
        min_stock_level: "10",
        unit_price: "0",
        requires_prescription: false,
        is_controlled: false,
        storage_instructions: "",
        notes: "",
      });
    }
  }, [open, mode, item]);

  const updateField = (
    field: keyof FormData,
    value: FormData[keyof FormData],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = t("form.validation.nameRequired");
      }
      if (!formData.concentration.trim()) {
        newErrors.concentration = t("form.validation.concentrationRequired");
      }
      if (!formData.form) {
        newErrors.form = t("form.validation.formRequired");
      }
    }

    if (step === 2) {
      const stockQty = parseFloat(formData.stock_quantity);
      const minStock = parseFloat(formData.min_stock_level);
      const price = parseFloat(formData.unit_price);

      if (isNaN(stockQty) || stockQty < 0) {
        newErrors.stock_quantity = t("form.validation.stockQuantityRequired");
      }
      if (isNaN(minStock) || minStock < 0) {
        newErrors.min_stock_level = t("form.validation.minStockRequired");
      }
      if (isNaN(price) || price <= 0) {
        newErrors.unit_price = t("form.validation.unitPriceRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    const submitData: CreateInventoryItemWithStock = {
      name: formData.name.trim(),
      generic_name: formData.generic_name.trim() || undefined,
      concentration: formData.concentration.trim(),
      form: formData.form,
      manufacturer_id: formData.manufacturer_id || undefined,
      barcodes: formData.barcode.trim()
        ? [
            {
              barcode: formData.barcode.trim(),
              is_primary: true,
              barcode_type: undefined,
              description: undefined,
            },
          ]
        : [],
      stock_quantity: parseInt(formData.stock_quantity),
      min_stock_level: parseInt(formData.min_stock_level),
      unit_price: parseFloat(formData.unit_price),
      requires_prescription: formData.requires_prescription,
      is_controlled: formData.is_controlled,
      storage_instructions: formData.storage_instructions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setErrors({});
    setFormData({
      name: "",
      generic_name: "",
      concentration: "",
      form: "",
      manufacturer_id: "",
      barcode: "",
      stock_quantity: "0",
      min_stock_level: "10",
      unit_price: "0",
      requires_prescription: false,
      is_controlled: false,
      storage_instructions: "",
      notes: "",
    });
    onOpenChange(false);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          className={cn(
            "relative border-b bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 shrink-0",
            isRTL ? "pl-14 pr-6 py-6" : "pr-14 pl-6 py-6",
          )}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {mode === "create" ? t("form.addTitle") : t("form.editTitle")}
                </DialogTitle>
                <DialogDescription>
                  {STEPS[currentStep - 1].description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    currentStep >= step.id
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 bg-background",
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-primary to-primary/80"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <BasicInfoStep
                    formData={formData}
                    errors={errors}
                    manufacturers={manufacturers}
                    isLoadingManufacturers={isLoadingManufacturers}
                    onUpdateField={updateField}
                  />
                )}

                {currentStep === 2 && (
                  <StockPricingStep
                    formData={formData}
                    errors={errors}
                    onUpdateField={updateField}
                  />
                )}

                {currentStep === 3 && (
                  <ClassificationStep
                    formData={formData}
                    onUpdateField={updateField}
                  />
                )}

                {currentStep === 4 && (
                  <ReviewStep
                    formData={formData}
                    manufacturers={manufacturers}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handlePrevious}
              className="gap-2"
            >
              {isRTL ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {currentStep === 1
                ? t("form.buttons.cancel")
                : t("form.buttons.previous")}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("form.stepProgress", {
                  current: currentStep,
                  total: STEPS.length,
                })}
              </span>
            </div>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="gap-2">
                {t("form.buttons.next")}
                {isRTL ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                <Check className="h-4 w-4" />
                {t("form.buttons.submit")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
