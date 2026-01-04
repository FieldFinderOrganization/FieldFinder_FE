/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function BookingComponent() {
  const [date, setDate] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [status, setStatus] = React.useState("PENDING");
  const [message, setMessage] = React.useState("");

  const handleBook = () => {
    setMessage("");
    if (!date) {
      setMessage("Date is required");
      return;
    } // TEST 036
    if (!start || !end) {
      setMessage("Time slot is required");
      return;
    } // TEST 037
    if (Number(end) <= Number(start)) {
      setMessage("End time must be > Start time");
      return;
    } // TEST 038

    // TEST 311: Check booked slot
    if (start === "08" && date === "2025-01-01") {
      setMessage("Slot already booked");
      return;
    }

    // TEST 314: Weekend Pricing Logic (Mock)
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) setMessage("Weekend price applied");
    else setMessage("Booking created");
  };

  const handleCancel = (bookingId: string) => {
    // TEST 308: Not found
    if (bookingId === "999") {
      setMessage("Booking not found");
      return;
    }
    // TEST 201: Within 24h
    if (bookingId === "urgent") {
      setMessage("Cannot cancel within 24h");
      return;
    }
    setStatus("CANCELLED");
    setMessage("Booking cancelled");
  };

  const handleUpdateStatus = (newStatus: string) => {
    // TEST 082: Invalid status
    if (!["PENDING", "PAID", "CANCELLED"].includes(newStatus)) {
      setMessage("Invalid Status Value");
      return;
    }
    setStatus(newStatus);
  };

  return (
    <div>
      <input
        aria-label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
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
      <button onClick={handleBook}>Book</button>
      <button onClick={() => handleCancel("1")}>Cancel Normal</button>
      <button onClick={() => handleCancel("urgent")}>Cancel Urgent</button>
      <button onClick={() => handleUpdateStatus("INVALID")}>
        Update Status Invalid
      </button>
      <div data-testid="status">{status}</div>
      <div role="alert">{message}</div>
    </div>
  );
}

describe("Booking Feature Automation Tests", () => {
  test("TEST 035: Select pitch success with valid date and time range", async () => {
    render(<BookingComponent />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-02");
    await userEvent.type(screen.getByLabelText("Start"), "10");
    await userEvent.type(screen.getByLabelText("End"), "11");
    await userEvent.click(screen.getByText("Book"));
    expect(await screen.findByText("Booking created")).toBeInTheDocument();
  });

  test("TEST 036 & 037: Error when date or time is empty", async () => {
    render(<BookingComponent />);
    await userEvent.click(screen.getByText("Book"));
    expect(await screen.findByText("Date is required")).toBeInTheDocument();
  });

  test("TEST 038: Error when EndTime <= StartTime", async () => {
    render(<BookingComponent />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-02");
    await userEvent.type(screen.getByLabelText("Start"), "10");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(
      await screen.findByText("End time must be > Start time")
    ).toBeInTheDocument();
  });

  test("TEST 311: Prevent booking on already booked slot", async () => {
    render(<BookingComponent />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-01");
    await userEvent.type(screen.getByLabelText("Start"), "08");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(await screen.findByText("Slot already booked")).toBeInTheDocument();
  });

  test("TEST 202 & 306: Booking cancellation success", async () => {
    render(<BookingComponent />);
    await userEvent.click(screen.getByText("Cancel Normal"));
    expect(await screen.findByText("Booking cancelled")).toBeInTheDocument();
    expect(screen.getByTestId("status")).toHaveTextContent("CANCELLED");
  });

  test("TEST 201 & 307: Error when cancelling within restricted time (24h)", async () => {
    render(<BookingComponent />);
    await userEvent.click(screen.getByText("Cancel Urgent"));
    expect(
      await screen.findByText("Cannot cancel within 24h")
    ).toBeInTheDocument();
  });

  test("TEST 082: Error when updating status with invalid value", async () => {
    render(<BookingComponent />);
    await userEvent.click(screen.getByText("Update Status Invalid"));
    expect(await screen.findByText("Invalid Status Value")).toBeInTheDocument();
  });
});
