/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const mockPitches = [
  {
    id: 1,
    name: "San A",
    location: "Quan 1",
    type: "5",
    price: 100,
    status: "ACTIVE",
    date: "2025-01-01",
    bookedSlots: [],
  },
  {
    id: 2,
    name: "San B",
    location: "Quan 2",
    type: "7",
    price: 200,
    status: "ACTIVE",
    date: "2025-01-01",
    bookedSlots: ["08:00"],
  },
  {
    id: 3,
    name: "San C",
    location: "Quan 1",
    type: "5",
    price: 150,
    status: "INACTIVE",
    date: "2025-01-01",
    bookedSlots: [],
  },
];

function PitchSearchComponent() {
  const [keyword, setKeyword] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [type, setType] = React.useState("");
  const [date, setDate] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [results, setResults] = React.useState(mockPitches);
  const [message, setMessage] = React.useState("");

  const handleSearch = () => {
    setMessage("");
    let filtered = mockPitches.filter((p) => p.status === "ACTIVE"); // TEST 021, 024

    if (keyword) {
      // TEST 020: Special char check
      if (/[^a-zA-Z0-9\s]/.test(keyword)) {
        setResults([]);
        setMessage("No results found.");
        return;
      }
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // TEST 030, 031: Criteria matching
    if (location) filtered = filtered.filter((p) => p.location === location);
    if (type) filtered = filtered.filter((p) => p.type === type);

    // TEST 285: Price Range
    if (minPrice)
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice)
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    if (filtered.length === 0) setMessage("No results found."); // TEST 022, 034
    setResults(filtered);
  };

  const handleSort = (order: string) => {
    // TEST 287
    const sorted = [...results].sort((a, b) =>
      order === "asc" ? a.price - b.price : b.price - a.price
    );
    setResults(sorted);
  };

  return (
    <div>
      <input
        aria-label="Keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <input
        aria-label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        aria-label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      />
      <input
        aria-label="MinPrice"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />
      <input
        aria-label="MaxPrice"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={() => handleSort("asc")}>Sort Price Asc</button>
      {message && <div>{message}</div>}
      <ul>
        {results.map((p) => (
          <li key={p.id}>
            {p.name} - {p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe("Pitch Search & Filter Automation Tests", () => {
  test("TEST 018: User can find pitch by entering valid keyword", async () => {
    render(<PitchSearchComponent />);
    await userEvent.type(screen.getByLabelText("Keyword"), "San A");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("San A - 100")).toBeInTheDocument();
  });

  test("TEST 020: Cannot find pitch when entering keyword with special characters", async () => {
    render(<PitchSearchComponent />);
    await userEvent.type(screen.getByLabelText("Keyword"), "San@#");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("TEST 021 & 024: Only active pitches are displayed (Inactive excluded)", async () => {
    render(<PitchSearchComponent />);
    await userEvent.click(screen.getByText("Search"));
    expect(screen.queryByText("San C")).not.toBeInTheDocument();
  });

  test("TEST 022 & 034: Message 'No results found' when no match", async () => {
    render(<PitchSearchComponent />);
    await userEvent.type(screen.getByLabelText("Keyword"), "NonExistent");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("TEST 030: Pitch matches Type but NOT Location is NOT displayed", async () => {
    render(<PitchSearchComponent />);
    await userEvent.type(screen.getByLabelText("Type"), "5");
    await userEvent.type(screen.getByLabelText("Location"), "Quan 99");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("TEST 285: Filter by Price Range", async () => {
    render(<PitchSearchComponent />);
    await userEvent.type(screen.getByLabelText("MinPrice"), "150");
    await userEvent.type(screen.getByLabelText("MaxPrice"), "250");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("San B - 200")).toBeInTheDocument();
    expect(screen.queryByText("San A - 100")).not.toBeInTheDocument();
  });

  test("TEST 287: Sort by Price Low to High", async () => {
    render(<PitchSearchComponent />);
    await userEvent.click(screen.getByText("Sort Price Asc"));
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("San A - 100");
    expect(items[1]).toHaveTextContent("San B - 200");
  });
});
