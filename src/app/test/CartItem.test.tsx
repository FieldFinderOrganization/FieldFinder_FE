/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function CartItemForm({ onAdd }: { onAdd: any }) {
  const [cartId, setCartId] = React.useState("");
  const [productId, setProductId] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [size, setSize] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const products: Record<string, { stock: number }> = {
    "2": { stock: 10 },
    "99": { stock: 0 },
  };

  const handleAdd = () => {
    setError("");
    setSuccess("");

    if (!cartId || !productId || !qty || !size) {
      setError("All fields are required");
      return;
    }
    if (
      isNaN(Number(cartId)) ||
      isNaN(Number(productId)) ||
      isNaN(Number(qty))
    ) {
      setError("IDs and quantity must be numbers");
      return;
    }

    const quantity = Number(qty);
    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    // --- Business Logic Checks ---
    if (cartId === "999") {
      setError("Cart not found!");
      return;
    }
    if (!products[productId]) {
      setError("Product not found!");
      return;
    }

    // Check stock logic
    if (quantity > products[productId].stock) {
      setError(
        `Cannot add ${quantity}. Only ${products[productId].stock} left in stock.`
      );
      return;
    }

    setSuccess("Item added!");
    onAdd({
      cartId: Number(cartId),
      productId: Number(productId),
      quantity,
      size,
    });
  };

  return (
    <div>
      <input
        aria-label="Cart ID"
        value={cartId}
        onChange={(e) => setCartId(e.target.value)}
      />
      <input
        aria-label="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />
      <input
        aria-label="Quantity"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />
      <input
        aria-label="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      {error && <div role="alert">{error}</div>}
      {success && <div role="alert">{success}</div>}
    </div>
  );
}

describe("Cart Item Feature Automation Tests", () => {
  // --- VALIDATION TESTS ---
  test("TEST 166: Save Error when required fields are missing", async () => {
    const handleAdd = jest.fn();
    render(<CartItemForm onAdd={handleAdd} />);
    await userEvent.click(screen.getByText("Add"));
    expect(handleAdd).not.toHaveBeenCalled();
    expect(
      await screen.findByText("All fields are required")
    ).toBeInTheDocument();
  });

  test("TEST 167: Error when IDs or quantity are not numbers", async () => {
    render(<CartItemForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "abc");
    await userEvent.type(screen.getByLabelText("Product ID"), "2");
    await userEvent.type(screen.getByLabelText("Quantity"), "3");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));
    expect(
      await screen.findByText("IDs and quantity must be numbers")
    ).toBeInTheDocument();
  });

  test("TEST 168: Error when quantity < 1", async () => {
    render(<CartItemForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "1");
    await userEvent.type(screen.getByLabelText("Product ID"), "2");
    await userEvent.type(screen.getByLabelText("Quantity"), "0");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));
    expect(
      await screen.findByText("Quantity must be at least 1")
    ).toBeInTheDocument();
  });

  // --- LOGIC TESTS (New) ---
  test("TEST 159: Add Item success with valid cart, product, and quantity", async () => {
    const handleAdd = jest.fn();
    render(<CartItemForm onAdd={handleAdd} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "1");
    await userEvent.type(screen.getByLabelText("Product ID"), "2");
    await userEvent.type(screen.getByLabelText("Quantity"), "5");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));

    expect(handleAdd).toHaveBeenCalledWith({
      cartId: 1,
      productId: 2,
      quantity: 5,
      size: "M",
    });
    expect(await screen.findByText("Item added!")).toBeInTheDocument();
  });

  test("TEST 160: Error when cart is not found", async () => {
    render(<CartItemForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "999");
    await userEvent.type(screen.getByLabelText("Product ID"), "2");
    await userEvent.type(screen.getByLabelText("Quantity"), "1");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));

    expect(await screen.findByText("Cart not found!")).toBeInTheDocument();
  });

  test("TEST 161: Error when product is not found", async () => {
    render(<CartItemForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "1");
    await userEvent.type(screen.getByLabelText("Product ID"), "888");
    await userEvent.type(screen.getByLabelText("Quantity"), "1");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));

    expect(await screen.findByText("Product not found!")).toBeInTheDocument();
  });

  test("TEST 162 & 164: Error when quantity exceeds available stock", async () => {
    render(<CartItemForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText("Cart ID"), "1");
    await userEvent.type(screen.getByLabelText("Product ID"), "2");
    await userEvent.type(screen.getByLabelText("Quantity"), "15");
    await userEvent.type(screen.getByLabelText("Size"), "M");
    await userEvent.click(screen.getByText("Add"));

    expect(
      await screen.findByText("Cannot add 15. Only 10 left in stock.")
    ).toBeInTheDocument();
  });
});
