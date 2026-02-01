export interface FormData {
  // Step 1: Basic Info
  name: string;
  generic_name: string;
  concentration: string;
  form: string;
  manufacturer_id: string;
  barcode: string;
  // Step 2: Stock & Pricing
  stock_quantity: string;
  min_stock_level: string;
  unit_price: string;
  // Step 3: Classification & Details
  requires_prescription: boolean;
  is_controlled: boolean;
  storage_instructions: string;
  notes: string;
}

export interface ValidationErrors {
  [key: string]: string;
}
