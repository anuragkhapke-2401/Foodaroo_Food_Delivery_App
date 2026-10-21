/**
 * Calculates the total monetary amount of items currently in the cart.
 *
 * @param {Record<string, number>} cartItems - Map of itemId to quantity
 * @param {Array<{_id: string, price: number}>} foodList - Array of food items with prices
 * @returns {number} The total cost of items in cart
 */
export const calculateTotalCartAmount = (cartItems = {}, foodList = []) => {
  let totalAmount = 0;
  for (const item in cartItems) {
    if (cartItems[item] > 0) {
      const itemInfo = foodList.find((product) => product._id === item);
      if (itemInfo && typeof itemInfo.price === "number") {
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
  }
  return totalAmount;
};
