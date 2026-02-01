export function getStockStatus(
  stockQuantity: number,
  minStockLevel: number,
): "in_stock" | "low_stock" | "out_of_stock" {
  if (stockQuantity === 0) return "out_of_stock";
  if (stockQuantity <= minStockLevel) return "low_stock";
  return "in_stock";
}

export function getStockStatusColor(
  status: "in_stock" | "low_stock" | "out_of_stock",
): string {
  switch (status) {
    case "out_of_stock":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "in_stock":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
}

export function getStockStatusLabel(
  status: "in_stock" | "low_stock" | "out_of_stock",
  t: (key: string) => string,
): string {
  switch (status) {
    case "out_of_stock":
      return t("stockStatus.outOfStock");
    case "low_stock":
      return t("stockStatus.lowStock");
    case "in_stock":
      return t("stockStatus.inStock");
  }
}

// Helper function to generate pagination items with ellipsis
export function generatePaginationItems(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 0; i < totalPages; i++) {
      items.push(i);
    }
  } else {
    // Always show first page
    items.push(0);

    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        items.push(i);
      }
      items.push("ellipsis");
      items.push(totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      // Near the end
      items.push("ellipsis");
      for (let i = totalPages - 5; i < totalPages - 1; i++) {
        items.push(i);
      }
      items.push(totalPages - 1);
    } else {
      // In the middle
      items.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        items.push(i);
      }
      items.push("ellipsis");
      items.push(totalPages - 1);
    }
  }

  return items;
}
