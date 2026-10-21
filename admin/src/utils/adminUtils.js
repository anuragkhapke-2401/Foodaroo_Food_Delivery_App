/**
 * Formats a customer's full name from the order address object.
 */
export const formatCustomerName = (address = {}) => {
  if (!address) return "";
  const first = (address.firstName || "").trim();
  const last = (address.lastName || "").trim();
  return `${first} ${last}`.trim();
};

/**
 * Formats order items into a comma-separated readable string (e.g. "Salad x 2, Rolls x 1").
 */
export const formatOrderItemsSummary = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
};

/**
 * Formats full address string.
 */
export const formatFullAddress = (address = {}) => {
  if (!address) return "";
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipcode,
  ].filter(Boolean);
  return parts.join(", ");
};

/**
 * Allowed food categories in admin dashboard.
 */
export const ALLOWED_CATEGORIES = [
  "Salad",
  "Rolls",
  "Deserts",
  "Sandwich",
  "Cake",
  "Pure Veg",
  "Pasta",
  "Noodles",
];

/**
 * Validates dish form submission data.
 */
export const validateDishForm = (data = {}, image = null) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Dish name is required");
  }

  if (!data.description || typeof data.description !== "string" || !data.description.trim()) {
    errors.push("Dish description is required");
  }

  const priceNum = Number(data.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    errors.push("Price must be a valid number greater than 0");
  }

  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }

  if (!image) {
    errors.push("Dish image is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valid order status values.
 */
export const VALID_ORDER_STATUSES = [
  "Food Processing",
  "Out for delivery",
  "Delivered",
];

/**
 * Checks whether an order status string is valid.
 */
export const isValidOrderStatus = (status) => {
  return VALID_ORDER_STATUSES.includes(status);
};
