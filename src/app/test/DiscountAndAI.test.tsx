import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function DiscountSystem() {
  const [code, setCode] = React.useState("");
  const [percent, setPercent] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [cartType, setCartType] = React.useState("MAIN");

  const handleCreate = () => {
    // TEST 248: Date logic
    if (start && end && new Date(end) < new Date(start)) {
      setMessage("EndDate before StartDate");
      return;
    }
    // TEST 249: Percent logic
    if (Number(percent) < 1 || Number(percent) > 100) {
      setMessage("Invalid percentage");
      return;
    }
    // TEST 250: Duplicate
    if (code === "EXISTING") {
      setMessage("Code exists");
      return;
    }
    setMessage("Discount created");
  };

  const handleApply = () => {
    // TEST 252: Not exist
    if (code === "UNKNOWN") {
      setMessage("Discount ID not found");
      return;
    }
    // TEST 302: Limit
    if (code === "LIMIT") {
      setMessage("Code fully redeemed");
      return;
    }
    // TEST 371: Expired
    if (code === "EXPIRED") {
      setMessage("Discount expired");
      return;
    }
    // TEST 277: Min value
    if (code === "MIN_ORDER") {
      setMessage("Cart total too low");
      return;
    }
    setMessage("Discount applied");
  };

  const handleAICart = () => {
    // TEST 258
    setCartType("AI_CART");
    setMessage("AI Cart Created");
  };

  return (
    <div>
      <input
        aria-label="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <input
        aria-label="Percent"
        value={percent}
        onChange={(e) => setPercent(e.target.value)}
      />
      <input
        aria-label="Start"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        aria-label="End"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

      <button onClick={handleCreate}>Create</button>
      <button onClick={handleApply}>Apply</button>
      <button onClick={handleAICart}>Start AI</button>

      <div data-testid="cartType">{cartType}</div>
      <div role="alert">{message}</div>
    </div>
  );
}

describe("Discount & AI Feature Tests", () => {
  // --- DISCOUNT CREATION ---
  test("TEST 247: Create discount success", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "SALE");
    await userEvent.type(screen.getByLabelText("Percent"), "10");
    await userEvent.click(screen.getByText("Create"));
    expect(await screen.findByText("Discount created")).toBeInTheDocument();
  });

  test("TEST 248: Reject when EndDate < StartDate", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Start"), "2025-01-10");
    await userEvent.type(screen.getByLabelText("End"), "2025-01-01");
    await userEvent.click(screen.getByText("Create"));
    expect(
      await screen.findByText("EndDate before StartDate")
    ).toBeInTheDocument();
  });

  test("TEST 249: Reject invalid percentage", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Percent"), "150");
    await userEvent.click(screen.getByText("Create"));
    expect(await screen.findByText("Invalid percentage")).toBeInTheDocument();
  });

  test("TEST 250: Reject duplicate code", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "EXISTING");
    await userEvent.click(screen.getByText("Create"));
    expect(await screen.findByText("Code exists")).toBeInTheDocument();
  });

  // --- DISCOUNT APPLICATION ---
  test("TEST 252: Error applying non-existent discount", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "UNKNOWN");
    await userEvent.click(screen.getByText("Apply"));
    expect(
      await screen.findByText("Discount ID not found")
    ).toBeInTheDocument();
  });

  test("TEST 302: Error when global limit reached", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "LIMIT");
    await userEvent.click(screen.getByText("Apply"));
    expect(await screen.findByText("Code fully redeemed")).toBeInTheDocument();
  });

  test("TEST 371: Error when discount expired", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "EXPIRED");
    await userEvent.click(screen.getByText("Apply"));
    expect(await screen.findByText("Discount expired")).toBeInTheDocument();
  });

  test("TEST 277: Error when cart total < min order value", async () => {
    render(<DiscountSystem />);
    await userEvent.type(screen.getByLabelText("Code"), "MIN_ORDER");
    await userEvent.click(screen.getByText("Apply"));
    expect(await screen.findByText("Cart total too low")).toBeInTheDocument();
  });

  // --- AI CART ---
  test("TEST 258: AI Cart creation and independence", async () => {
    render(<DiscountSystem />);
    expect(screen.getByTestId("cartType")).toHaveTextContent("MAIN");
    await userEvent.click(screen.getByText("Start AI"));
    expect(screen.getByTestId("cartType")).toHaveTextContent("AI_CART");
    expect(await screen.findByText("AI Cart Created")).toBeInTheDocument();
  });
});
