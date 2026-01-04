import React, { useState } from "react";
import { cartItemReq } from "@/services/cartItem";

interface CartItemFormProps {
  onAdd: (item: cartItemReq) => void;
}

const CartItemForm: React.FC<CartItemFormProps> = ({ onAdd }) => {
  const [cartId, setCartId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!cartId || !productId || !quantity || !size) {
      setError("All fields are required");
      return;
    }
    if (
      isNaN(Number(cartId)) ||
      isNaN(Number(productId)) ||
      isNaN(Number(quantity))
    ) {
      setError("IDs and quantity must be numbers");
      return;
    }
    if (Number(quantity) < 1) {
      setError("Quantity must be at least 1");
      return;
    }
    onAdd({
      cartId: Number(cartId),
      productId: Number(productId),
      quantity: Number(quantity),
      size,
      userId: undefined,
    });
    setSuccess("Item added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="Cart ID"
        placeholder="Cart ID"
        value={cartId}
        onChange={(e) => setCartId(e.target.value)}
      />
      <input
        aria-label="Product ID"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />
      <input
        aria-label="Quantity"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        aria-label="Size"
        placeholder="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      />
      <button type="submit">Add</button>
      {error && <div role="alert">{error}</div>}
      {success && <div role="alert">{success}</div>}
    </form>
  );
};

export default CartItemForm;
