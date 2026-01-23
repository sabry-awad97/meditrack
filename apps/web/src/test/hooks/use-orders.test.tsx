import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateOrder } from "@/hooks";
import type { OrderFormData } from "@/lib/types";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useOrders", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    // Clear any cached data
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should create a new order", async () => {
    const newOrderData: OrderFormData = {
      customerName: "محمد أحمد",
      phoneNumber: "0501234567",
      medicines: [
        {
          name: "باراسيتامول",
          concentration: "500mg",
          form: "أقراص",
          quantity: 2,
        },
      ],
      notes: "طلب جديد",
    };

    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    let createdOrder: any = null;
    result.current.mutate(newOrderData, {
      onSuccess: (order) => {
        createdOrder = order;
      },
    });

    await waitFor(() => expect(createdOrder).not.toBeNull());

    expect(createdOrder.customerName).toBe(newOrderData.customerName);
    expect(createdOrder.phoneNumber).toBe(newOrderData.phoneNumber);
  });

  it("should handle validation errors when creating order", async () => {
    const invalidOrderData = {
      customerName: "", // Invalid: empty name
      phoneNumber: "0501234567",
      medicines: [],
      notes: "",
    } as OrderFormData;

    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    let errorOccurred = false;
    try {
      result.current.mutate(invalidOrderData, {
        onError: () => {
          errorOccurred = true;
        },
      });
    } catch (error) {
      errorOccurred = true;
    }

    await waitFor(() => expect(errorOccurred).toBe(true));
  });
});
