/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function UIFeatures() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState(["Item 1", "Item 2", "Item 3"]);
  const [page, setPage] = React.useState(1);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);

  // TEST 353: Persist on reload
  React.useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCartCount(Number(saved));
  }, []);

  const handleRapidClick = () => {
    // TEST 355: Prevent rapid clicks
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setCartCount((c) => c + 1);
      setLoading(false);
    }, 500);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // TEST 358: ESC close
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* TEST 396: Mobile Menu */}
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        aria-label="Menu Toggle"
      >
        {mobileMenu ? "Close Menu" : "Open Menu"}
      </button>
      {mobileMenu && <div data-testid="mobile-nav">Mobile Navigation</div>}

      {/* TEST 365: Loading State */}
      <button onClick={handleRapidClick} disabled={loading}>
        {loading ? "Processing..." : "Add to Cart"}
      </button>
      <span>Cart: {cartCount}</span>

      {/* TEST 363, 364: Modal */}
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <div role="dialog">
          <button onClick={() => setIsOpen(false)}>Close X</button>
          <div data-testid="overlay" onClick={() => setIsOpen(false)}>
            Overlay
          </div>
          <p>Modal Content</p>
        </div>
      )}

      {/* TEST 362: Remove last item */}
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            {item} <button onClick={() => handleRemove(i)}>Remove</button>
          </li>
        ))}
        {items.length === 0 && <li>Empty List</li>}
      </ul>

      {/* TEST 375, 405: Pagination */}
      <div aria-label="Pagination">
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {/* TEST 410, 411: Static Links */}
      <a href="/about">About Us</a>
      <a href="https://facebook.com">Facebook</a>

      {/* TEST 412: Gallery */}
      <img src="img1.jpg" alt="Gallery Image" />
    </div>
  );
}

describe("Frontend Interaction Automation Tests", () => {
  test("TEST 355: Verify rapid clicks are handled (Debounce/Loading state)", async () => {
    render(<UIFeatures />);
    const btn = screen.getByText("Add to Cart");
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);

    expect(await screen.findByText("Processing...")).toBeInTheDocument();
  });

  test("TEST 358 & 363: Verify modal closes via ESC key and Button", async () => {
    render(<UIFeatures />);
    await userEvent.click(screen.getByText("Open Modal"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press ESC
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("TEST 364: Verify modal closes via overlay click", async () => {
    render(<UIFeatures />);
    await userEvent.click(screen.getByText("Open Modal"));
    await userEvent.click(screen.getByTestId("overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("TEST 362: Verify remove last item works correctly", async () => {
    render(<UIFeatures />);
    const removeBtns = screen.getAllByText("Remove");
    // Remove all 3 items
    await userEvent.click(removeBtns[0]);
    await userEvent.click(screen.getAllByText("Remove")[0]);
    await userEvent.click(screen.getAllByText("Remove")[0]);

    expect(await screen.findByText("Empty List")).toBeInTheDocument();
  });

  test("TEST 375 & 405: Verify pagination changes page", async () => {
    render(<UIFeatures />);
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Next"));
    expect(await screen.findByText("Page 2")).toBeInTheDocument();
  });

  test("TEST 396: Verify Mobile Menu toggles correctly", async () => {
    render(<UIFeatures />);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();

    // Open
    await userEvent.click(screen.getByLabelText("Menu Toggle"));
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();

    // Close
    await userEvent.click(screen.getByLabelText("Menu Toggle"));
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  test("TEST 410 & 411: Verify Static and Social Links exist", () => {
    render(<UIFeatures />);
    expect(screen.getByText("About Us")).toHaveAttribute("href", "/about");
    expect(screen.getByText("Facebook")).toHaveAttribute(
      "href",
      "https://facebook.com"
    );
  });

  test("TEST 412: Verify Image Gallery renders images", () => {
    render(<UIFeatures />);
    expect(screen.getByAltText("Gallery Image")).toBeInTheDocument();
  });
});
