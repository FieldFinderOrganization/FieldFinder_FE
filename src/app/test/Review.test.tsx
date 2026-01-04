/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function ProductForm({
  onSave,
}: {
  onSave?: (
    name: string,
    category: string,
    price: number,
    stock: number,
    imageUrl?: string
  ) => void;
}) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const categories = ["Football", "Tennis"];
  const products = ["Ball", "Racket"];

  const handleSave = () => {
    setError("");
    setMessage("");

    if (!name) {
      setError("Product name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    if (!price || !stock) {
      setError("Price and stock are required");
      return;
    }

    if (!categories.includes(category)) {
      setError("Category not found!");
      return;
    }
    if (products.includes(name)) {
      setError("Product already exists!");
      return;
    }
    if (name.length < 3) {
      setError("Product name is invalid");
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (isNaN(priceNum) || isNaN(stockNum) || priceNum < 0 || stockNum < 0) {
      setError("Price and stock must be non-negative numbers");
      return;
    }

    // TEST 172: Image URL validation
    if (imageUrl && !imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/)) {
      setError("Invalid image URL format");
      return;
    }

    setMessage("Product saved successfully!");
    onSave && onSave(name, category, priceNum, stockNum, imageUrl);
  };

  return (
    <div>
      <input
        aria-label="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        aria-label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        aria-label="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        aria-label="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <input
        aria-label="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      {message && <div role="alert">{message}</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe("Product Feature Automation Tests", () => {
  // --- BASIC CRUD TESTS ---
  test("TEST 135: Add Product success with valid fields", async () => {
    const handleSave = jest.fn();
    render(<ProductForm onSave={handleSave} />);

    await userEvent.type(screen.getByLabelText("Product Name"), "Shoes");
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.click(screen.getByText("Save"));

    expect(handleSave).toHaveBeenCalledWith("Shoes", "Football", 100, 10, "");
    expect(
      await screen.findByText("Product saved successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 136: Error when provided category does not exist", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "Shoes");
    await userEvent.type(screen.getByLabelText("Category"), "NotExist");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.click(screen.getByText("Save"));

    expect(await screen.findByText("Category not found!")).toBeInTheDocument();
  });

  test("TEST 138: Error when Price or Stock Quantity is invalid", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "Shoes");
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "-10");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Price and stock must be non-negative numbers")
    ).toBeInTheDocument();
  });

  test("TEST 140: Save Error when Product Name is invalid", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "Ba"); // Too short
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Product name is invalid")
    ).toBeInTheDocument();
  });

  test("TEST 142: Save Error when required fields are missing", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "Shoes");
    await userEvent.click(screen.getByText("Save"));
    expect(await screen.findByText("Category is required")).toBeInTheDocument();
  });

  // --- ADMIN TESTS ---
  test("TEST 169: Admin error when product name is empty", async () => {
    render(<ProductForm />);
    await userEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Product name is required")
    ).toBeInTheDocument();
  });

  test("TEST 170: Admin error when price is negative", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "AdminBall");
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "-50");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Price and stock must be non-negative numbers")
    ).toBeInTheDocument();
  });

  test("TEST 172: Admin error when image URL is invalid", async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText("Product Name"), "AdminBall");
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "50");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.type(screen.getByLabelText("Image URL"), "not-a-url");
    await userEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Invalid image URL format")
    ).toBeInTheDocument();
  });

  test("TEST 173: System updates product successfully with valid new information (including Image)", async () => {
    const handleSave = jest.fn();
    render(<ProductForm onSave={handleSave} />);

    await userEvent.type(screen.getByLabelText("Product Name"), "AdminBall");
    await userEvent.type(screen.getByLabelText("Category"), "Football");
    await userEvent.type(screen.getByLabelText("Price"), "50");
    await userEvent.type(screen.getByLabelText("Stock"), "10");
    await userEvent.type(
      screen.getByLabelText("Image URL"),
      "https://example.com/image.png"
    );
    await userEvent.click(screen.getByText("Save"));

    expect(handleSave).toHaveBeenCalledWith(
      "AdminBall",
      "Football",
      50,
      10,
      "https://example.com/image.png"
    );
    expect(
      await screen.findByText("Product saved successfully!")
    ).toBeInTheDocument();
  });
});
