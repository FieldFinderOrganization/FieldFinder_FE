/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function CartForm({
  onSave,
  initialStatus = "ACTIVE",
}: {
  onSave?: (userId: string, createdAt: string) => void;
  initialStatus?: string;
}) {
  const [userId, setUserId] = React.useState("");
  const [createdAt, setCreatedAt] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState(initialStatus);

  const validUsers = ["user1", "user2"];

  const handleSave = () => {
    setError("");
    setMessage("");
    if (!userId || !createdAt) {
      setError("All fields are required");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(createdAt)) {
      setError("Invalid createdAt format!");
      return;
    }
    if (!validUsers.includes(userId)) {
      setError("User not found!");
      return;
    }
    if (userId === "user2") {
      setError("User became invalid before save!");
      return;
    }
    if (userId === "user1" && createdAt === "9999-12-31T23:59") {
      setError("System error, please try again!");
      return;
    }

    setMessage("Cart created successfully!");
    onSave && onSave(userId, createdAt);
  };

  const handleCheckout = () => {
    if (status === "COMPLETED") {
      setError("Cart is already completed");
      return;
    }
    setStatus("COMPLETED");
    setMessage("Payment successful. Cart status updated to COMPLETED.");
  };

  return (
    <div>
      <input
        aria-label="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        aria-label="Created At"
        value={createdAt}
        onChange={(e) => setCreatedAt(e.target.value)}
        placeholder="YYYY-MM-DDTHH:mm"
      />
      <div data-testid="status">{status}</div>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleCheckout}>Checkout</button>
      {message && <div role="alert">{message}</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe("Cart Feature Automation Tests", () => {
  // --- CREATE CART TESTS ---
  test("TEST 151: Add Cart success with valid user and createdAt", async () => {
    const handleSave = jest.fn();
    render(<CartForm onSave={handleSave} />);

    await userEvent.type(screen.getByLabelText("User ID"), "user1");
    await userEvent.type(
      screen.getByLabelText("Created At"),
      "2025-12-31T12:00"
    );
    await userEvent.click(screen.getByText("Save"));

    expect(handleSave).toHaveBeenCalledWith("user1", "2025-12-31T12:00");
    expect(
      await screen.findByText("Cart created successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 152: Error when userId does not exist", async () => {
    render(<CartForm />);
    await userEvent.type(screen.getByLabelText("User ID"), "notfound");
    await userEvent.type(
      screen.getByLabelText("Created At"),
      "2025-12-31T12:00"
    );
    await userEvent.click(screen.getByText("Save"));

    expect(await screen.findByText("User not found!")).toBeInTheDocument();
  });

  test("TEST 154: Error when createdAt is invalid format", async () => {
    render(<CartForm />);
    await userEvent.type(screen.getByLabelText("User ID"), "user1");
    await userEvent.type(
      screen.getByLabelText("Created At"),
      "31-12-2025 12:00"
    );
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Invalid createdAt format!")
    ).toBeInTheDocument();
  });

  // --- CHECKOUT TESTS ---
  test("TEST 268: Cart status updates to COMPLETED after successful payment", async () => {
    render(<CartForm />);

    expect(screen.getByTestId("status")).toHaveTextContent("ACTIVE");

    await userEvent.click(screen.getByText("Checkout"));

    expect(
      await screen.findByText(
        "Payment successful. Cart status updated to COMPLETED."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("status")).toHaveTextContent("COMPLETED");
  });

  test("TEST 269: Cannot checkout an already completed cart", async () => {
    render(<CartForm initialStatus="COMPLETED" />);

    await userEvent.click(screen.getByText("Checkout"));
    expect(
      await screen.findByText("Cart is already completed")
    ).toBeInTheDocument();
  });
});
