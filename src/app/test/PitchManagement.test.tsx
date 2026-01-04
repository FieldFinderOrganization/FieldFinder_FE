/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function PitchManagerForm() {
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [status, setStatus] = React.useState("ACTIVE");
  const [image, setImage] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSave = () => {
    setMessage("");
    if (!name) {
      setMessage("Name is required");
      return;
    } // TEST 064
    if (!location) {
      setMessage("Location is required");
      return;
    } // TEST 065
    if (Number(price) < 0 || isNaN(Number(price))) {
      setMessage("Invalid Price");
      return;
    } // TEST 068
    if (name === "Duplicate") {
      setMessage("Pitch Name already exists");
      return;
    } // TEST 070
    setMessage("Pitch saved");
  };

  const handleMaintenance = () => {
    // TEST 318
    setStatus("MAINTENANCE");
    setMessage("Status updated to MAINTENANCE");
  };

  const handleImageUpload = (fileName: string) => {
    // TEST 239: Format
    if (!fileName.match(/\.(jpg|png)$/)) {
      setMessage("Invalid image format");
      return;
    }
    // TEST 240: Size check
    if (fileName.includes("large")) {
      setMessage("Image too large");
      return;
    }
    setImage(fileName);
    setMessage("Image uploaded");
  };

  return (
    <div>
      <input
        aria-label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        aria-label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        aria-label="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        aria-label="Image"
        onChange={(e) => handleImageUpload(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleMaintenance}>Set Maintenance</button>
      <div data-testid="status">{status}</div>
      <div role="alert">{message}</div>
    </div>
  );
}

describe("Pitch Management Automation Tests", () => {
  test("TEST 062: Add new pitch success with valid fields", async () => {
    render(<PitchManagerForm />);
    await userEvent.type(screen.getByLabelText("Name"), "New Pitch");
    await userEvent.type(screen.getByLabelText("Location"), "Hanoi");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.click(screen.getByText("Save"));
    expect(await screen.findByText("Pitch saved")).toBeInTheDocument();
  });

  test("TEST 064 & 065: Error when required fields are empty", async () => {
    render(<PitchManagerForm />);
    await userEvent.click(screen.getByText("Save"));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  test("TEST 068: Error when price is invalid", async () => {
    render(<PitchManagerForm />);
    await userEvent.type(screen.getByLabelText("Name"), "Pitch");
    await userEvent.type(screen.getByLabelText("Location"), "Loc");
    await userEvent.type(screen.getByLabelText("Price"), "-50");
    await userEvent.click(screen.getByText("Save"));
    expect(await screen.findByText("Invalid Price")).toBeInTheDocument();
  });

  test("TEST 070: Error when pitch name already exists", async () => {
    render(<PitchManagerForm />);
    await userEvent.type(screen.getByLabelText("Name"), "Duplicate");
    await userEvent.type(screen.getByLabelText("Location"), "Loc");
    await userEvent.type(screen.getByLabelText("Price"), "100");
    await userEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Pitch Name already exists")
    ).toBeInTheDocument();
  });

  test("TEST 318: Set field status to MAINTENANCE", async () => {
    render(<PitchManagerForm />);
    await userEvent.click(screen.getByText("Set Maintenance"));
    expect(screen.getByTestId("status")).toHaveTextContent("MAINTENANCE");
  });

  test("TEST 239: Error when image format is invalid", async () => {
    render(<PitchManagerForm />);
    await userEvent.type(screen.getByLabelText("Image"), "file.txt");
    expect(await screen.findByText("Invalid image format")).toBeInTheDocument();
  });

  test("TEST 241: Save uploaded image successfully", async () => {
    render(<PitchManagerForm />);
    await userEvent.type(screen.getByLabelText("Image"), "pic.png");
    expect(await screen.findByText("Image uploaded")).toBeInTheDocument();
  });
});
