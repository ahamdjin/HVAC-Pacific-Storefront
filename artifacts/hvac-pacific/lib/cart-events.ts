export const CART_UPDATED_EVENT = "hvac:cart-updated";

type CartSummary = {
  totalQuantity?: number;
  lines: { nodes: Array<{ quantity: number }> };
};

export function cartItemCount(cart: CartSummary): number {
  if (Number.isInteger(cart.totalQuantity) && cart.totalQuantity! >= 0) {
    return cart.totalQuantity!;
  }
  return cart.lines.nodes.reduce((total, line) => total + line.quantity, 0);
}

export function notifyCartChanged(cart: CartSummary) {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, {
    detail: cartItemCount(cart),
  }));
}