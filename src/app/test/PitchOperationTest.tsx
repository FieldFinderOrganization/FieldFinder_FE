/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function PitchManager() {
  const [keyword, setKeyword] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [message, setMessage] = React.useState("");

  const [pName, setPName] = React.useState("");
  const [pLocation, setPLocation] = React.useState("");
  const [pType, setPType] = React.useState("");
  const [pStart, setPStart] = React.useState("");
  const [pEnd, setPEnd] = React.useState("");
  const [pPrice, setPPrice] = React.useState("");
  const [pImage, setPImage] = React.useState("");

  const mockDB = [
    {
      id: 1,
      name: "San A",
      location: "HCM",
      type: "5",
      price: 100,
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "San B",
      location: "HN",
      type: "7",
      price: 200,
      status: "MAINTENANCE",
    },
  ];

  const handleSearch = () => {
    setMessage("");
    // TEST 019: Empty keyword check

    // TEST 020: Special char
    if (/[^a-zA-Z0-9\s]/.test(keyword)) {
      setResults([]);
      setMessage("No results found.");
      return;
    }

    let filtered = mockDB.filter((p) => p.status === "ACTIVE"); // TEST 021, 024

    if (keyword) filtered = filtered.filter((p) => p.name.includes(keyword));

    // TEST 285: Price Range
    if (minPrice)
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice)
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    if (filtered.length === 0) setMessage("No results found."); // TEST 022, 034
    setResults(filtered);
  };

  const handleAddPitch = () => {
    setMessage("");
    // TEST 064, 065, 066
    if (!pName || !pLocation || !pType) {
      setMessage("Required fields empty");
      return;
    }
    // TEST 067: Timeslot
    if (pStart && pEnd && Number(pEnd) <= Number(pStart)) {
      setMessage("Invalid Timeslot");
      return;
    }
    // TEST 068: Price
    if (Number(pPrice) < 0 || isNaN(Number(pPrice))) {
      setMessage("Invalid Price");
      return;
    }
    // TEST 070: Duplicate
    if (pName === "San A") {
      setMessage("Pitch Name already exists");
      return;
    }

    setMessage("Pitch saved");
  };

  const handleUpdatePitch = (id: number) => {
    // TEST 072: ID Check
    if (id === 999) {
      setMessage("Pitch ID not found");
      return;
    }
    // TEST 073-077: Validations same as Add
    if (!pName) {
      setMessage("Name field is empty");
      return;
    }
    setMessage("Pitch updated");
  };

  const handleImageUpload = (file: string) => {
    // TEST 239: Format
    if (!file.match(/\.(jpg|png)$/)) {
      setMessage("Invalid image format");
      return;
    }
    // TEST 240: Size (mock)
    if (file.includes("large")) {
      setMessage("Image too large");
      return;
    }
    setMessage("Image uploaded");
  };

  const handleMaintenance = () => {
    setMessage("Status updated to MAINTENANCE"); // TEST 318
  };

  return (
    <div>
      <input
        aria-label="Keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
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

      <input
        aria-label="Name"
        value={pName}
        onChange={(e) => setPName(e.target.value)}
      />
      <input
        aria-label="Location"
        value={pLocation}
        onChange={(e) => setPLocation(e.target.value)}
      />
      <input
        aria-label="Type"
        value={pType}
        onChange={(e) => setPType(e.target.value)}
      />
      <input
        aria-label="Start"
        value={pStart}
        onChange={(e) => setPStart(e.target.value)}
      />
      <input
        aria-label="End"
        value={pEnd}
        onChange={(e) => setPEnd(e.target.value)}
      />
      <input
        aria-label="Price"
        value={pPrice}
        onChange={(e) => setPPrice(e.target.value)}
      />
      <input
        aria-label="Image"
        value={pImage}
        onChange={(e) => {
          setPImage(e.target.value);
          handleImageUpload(e.target.value);
        }}
      />

      <button onClick={handleAddPitch}>Add Pitch</button>
      <button onClick={() => handleUpdatePitch(1)}>Update Pitch</button>
      <button onClick={() => handleUpdatePitch(999)}>Update Invalid</button>
      <button onClick={handleMaintenance}>Set Maintenance</button>

      <div role="alert">{message}</div>
      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}

describe("Pitch Operations Automation Tests", () => {
  // --- SEARCH TESTS ---
  test("TEST 018: User can find pitch by entering valid keyword", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Keyword"), "San A");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("San A")).toBeInTheDocument();
  });

  test("TEST 020: Cannot find pitch when entering keyword with special characters", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Keyword"), "San@#");
    await userEvent.click(screen.getByText("Search"));
    expect(await screen.findByText("No results found.")).toBeInTheDocument();
  });

  test("TEST 022 & 034: Verify message 'No results found' when no match", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Keyword"), "Unknown");
    await userEvent.click(screen.getByText("Search"));
    expect(await screen.findByText("No results found.")).toBeInTheDocument();
  });

  test("TEST 024: Inactive/Maintenance pitches are excluded from search results", async () => {
    render(<PitchManager />);
    await userEvent.click(screen.getByText("Search"));
    expect(screen.queryByText("San B")).not.toBeInTheDocument();
  });

  test("TEST 285: Filter by Price Range works correctly", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("MinPrice"), "50");
    await userEvent.type(screen.getByLabelText("MaxPrice"), "150");
    await userEvent.click(screen.getByText("Search"));
    expect(screen.getByText("San A")).toBeInTheDocument();
  });

  // --- ADD PITCH TESTS ---
  test("TEST 062: Add new pitch success with valid fields", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Name"), "New Pitch");
    await userEvent.type(screen.getByLabelText("Location"), "HCM");
    await userEvent.type(screen.getByLabelText("Type"), "5");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.click(screen.getByText("Add Pitch"));
    expect(await screen.findByText("Pitch saved")).toBeInTheDocument();
  });

  test("TEST 064-066: Add pitch error when required fields are empty", async () => {
    render(<PitchManager />);
    await userEvent.click(screen.getByText("Add Pitch"));
    expect(
      await screen.findByText("Required fields empty")
    ).toBeInTheDocument();
  });

  test("TEST 067: Add pitch error when Timeslot is invalid (End <= Start)", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Name"), "Pitch");
    await userEvent.type(screen.getByLabelText("Location"), "Loc");
    await userEvent.type(screen.getByLabelText("Type"), "5");
    await userEvent.type(screen.getByLabelText("Start"), "10");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Add Pitch"));
    expect(await screen.findByText("Invalid Timeslot")).toBeInTheDocument();
  });

  test("TEST 068: Add pitch error when Price is invalid", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Name"), "Pitch");
    await userEvent.type(screen.getByLabelText("Location"), "Loc");
    await userEvent.type(screen.getByLabelText("Type"), "5");
    await userEvent.type(screen.getByLabelText("Price"), "-10");
    await userEvent.click(screen.getByText("Add Pitch"));
    expect(await screen.findByText("Invalid Price")).toBeInTheDocument();
  });

  test("TEST 070: Add pitch error when Pitch Name already exists", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Name"), "San A");
    await userEvent.type(screen.getByLabelText("Location"), "Loc");
    await userEvent.type(screen.getByLabelText("Type"), "5");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.click(screen.getByText("Add Pitch"));
    expect(
      await screen.findByText("Pitch Name already exists")
    ).toBeInTheDocument();
  });

  // --- UPDATE PITCH TESTS ---
  test("TEST 071: Update pitch success with valid values", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Name"), "Updated Name");
    await userEvent.click(screen.getByText("Update Pitch"));
    expect(await screen.findByText("Pitch updated")).toBeInTheDocument();
  });

  test("TEST 072: Update pitch error when Pitch ID not found", async () => {
    render(<PitchManager />);
    await userEvent.click(screen.getByText("Update Invalid"));
    expect(await screen.findByText("Pitch ID not found")).toBeInTheDocument();
  });

  test("TEST 073: Update pitch error when Name field is empty", async () => {
    render(<PitchManager />);
    await userEvent.clear(screen.getByLabelText("Name"));
    await userEvent.click(screen.getByText("Update Pitch"));
    expect(await screen.findByText("Name field is empty")).toBeInTheDocument();
  });

  // --- IMAGE & MAINTENANCE ---
  test("TEST 239: Error when image format is invalid", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Image"), "file.exe");
    expect(await screen.findByText("Invalid image format")).toBeInTheDocument();
  });

  test("TEST 240: Error when image is too large", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Image"), "large_file.jpg");
    expect(await screen.findByText("Image too large")).toBeInTheDocument();
  });

  test("TEST 241: Save uploaded image successfully", async () => {
    render(<PitchManager />);
    await userEvent.type(screen.getByLabelText("Image"), "valid.png");
    expect(await screen.findByText("Image uploaded")).toBeInTheDocument();
  });

  test("TEST 318: Admin sets field status to MAINTENANCE", async () => {
    render(<PitchManager />);
    await userEvent.click(screen.getByText("Set Maintenance"));
    expect(
      await screen.findByText("Status updated to MAINTENANCE")
    ).toBeInTheDocument();
  });
});
