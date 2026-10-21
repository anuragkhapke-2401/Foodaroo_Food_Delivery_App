/**
 * Builds the order payload structure required by the backend API.
 */
export const buildOrderPayload = (address = {}, cartItems = {}, foodList = [], cartTotal = 0) => {
  const orderItems = [];
  (foodList || []).forEach((item) => {
    if (cartItems && cartItems[item._id] > 0) {
      orderItems.push({
        ...item,
        quantity: cartItems[item._id],
      });
    }
  });

  const deliveryFee = cartTotal === 0 ? 0 : 2;
  return {
    address,
    items: orderItems,
    amount: cartTotal + deliveryFee,
  };
};

/**
 * Calculates item count and summary figures for checkout.
 */
export const calculateOrderMetrics = (cartItems = {}, cartTotal = 0) => {
  const itemCount = Object.values(cartItems || {}).reduce(
    (total, quantity) => total + (quantity > 0 ? quantity : 0),
    0
  );
  const deliveryFee = cartTotal === 0 ? 0 : 2;
  const total = cartTotal === 0 ? 0 : cartTotal + deliveryFee;

  return {
    itemCount,
    subtotal: cartTotal,
    deliveryFee,
    total,
  };
};

/**
 * Validates delivery address inputs for checkout.
 */
export const validateDeliveryAddress = (address = {}) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "street",
    "city",
    "state",
    "zipcode",
    "country",
    "phone",
  ];

  const missingFields = requiredFields.filter(
    (field) => !address[field] || !String(address[field]).trim()
  );

  const isValidEmail = Boolean(
    address.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(address.email).trim())
  );

  const errors = [];
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }
  if (address.email && !isValidEmail) {
    errors.push("Invalid email address format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
