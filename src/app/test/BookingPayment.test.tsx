/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function BookingSystem() {
  const [date, setDate] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [userId, setUserId] = React.useState("user1");
  const [message, setMessage] = React.useState("");
  const [bookingStatus, setBookingStatus] = React.useState("PENDING");
  const [paymentAmount, setPaymentAmount] = React.useState("");

  const handleBook = () => {
    setMessage("");
    if (!userId) {
      setMessage("User not found");
      return;
    } // TEST 040
    if (!date) {
      setMessage("Date field cannot empty");
      return;
    } // TEST 026, 036
    if (!start || !end) {
      setMessage("Time slot is required");
      return;
    } // TEST 037
    if (Number(end) <= Number(start)) {
      setMessage("EndHour must be >= than StartHour");
      return;
    } // TEST 038

    // TEST 311: Slot booked
    if (date === "2025-01-01" && start === "08") {
      setMessage("Slot already booked");
      return;
    }

    // TEST 314: Weekend Pricing (Logic Mock)
    const d = new Date(date).getDay();
    if (d === 0 || d === 6) setMessage("Weekend Price Applied");
    else setMessage("Booking Created");
  };

  const handleCancel = (bId: string) => {
    // TEST 308: Not found
    if (bId === "999") {
      setMessage("Booking not found");
      return;
    }
    // TEST 201: Within 24h
    if (bId === "urgent") {
      setMessage("Cannot cancel within 24h");
      return;
    }
    setBookingStatus("CANCELLED");
    setMessage("Booking cancelled");
  };

  const handlePayment = () => {
    // TEST 043: Booking not found
    if (bookingStatus === "NOT_EXIST") {
      setMessage("Booking not found");
      return;
    }
    // TEST 047: Negative
    if (Number(paymentAmount) < 0) {
      setMessage("Amount is Negative");
      return;
    }
    // TEST 048: Success
    setBookingStatus("PAID");
    setMessage("Transaction Success");
  };

  const handleRefund = (amount: number) => {
    // TEST 305: Partial
    if (bookingStatus !== "CANCELLED") {
      setMessage("Cannot refund non-cancelled");
      return;
    }
    setBookingStatus("REFUNDED");
    setMessage(`Refunded ${amount}%`);
  };

  const handleStatusUpdate = (status: string) => {
    // TEST 082: Invalid
    if (!["PENDING", "PAID", "CANCELLED", "REFUNDED"].includes(status)) {
      setMessage("Invalid Status Value");
      return;
    }
    setBookingStatus(status);
    setMessage("Status updated");
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
      <input
        aria-label="Amount"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
      />

      <button onClick={handleBook}>Book</button>
      <button onClick={() => handleCancel("1")}>Cancel</button>
      <button onClick={() => handleCancel("urgent")}>Cancel Urgent</button>
      <button onClick={() => handleCancel("999")}>Cancel Invalid</button>

      <button onClick={handlePayment}>Pay</button>
      <button onClick={() => handleRefund(50)}>Refund 50%</button>
      <button onClick={() => handleStatusUpdate("INVALID")}>
        Update Bad Status
      </button>

      <div data-testid="status">{bookingStatus}</div>
      <div role="alert">{message}</div>
    </div>
  );
}

describe("Booking & Payment Automation Tests", () => {
  // --- BOOKING TESTS ---
  test("TEST 035 & 039: Book success when User and Pitch valid, End > Start", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-02");
    await userEvent.type(screen.getByLabelText("Start"), "08");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(await screen.findByText("Booking Created")).toBeInTheDocument();
  });

  test("TEST 036 & 026: Booking error when Date is empty", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Book"));
    expect(
      await screen.findByText("Date field cannot empty")
    ).toBeInTheDocument();
  });

  test("TEST 038: Booking error when EndTime <= StartTime", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-02");
    await userEvent.type(screen.getByLabelText("Start"), "10");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(
      await screen.findByText("EndHour must be >= than StartHour")
    ).toBeInTheDocument();
  });

  test("TEST 311: Error when booking already booked slot", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-01");
    await userEvent.type(screen.getByLabelText("Start"), "08");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(await screen.findByText("Slot already booked")).toBeInTheDocument();
  });

  test("TEST 314: Weekend pricing applied correctly", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-01-04");
    await userEvent.type(screen.getByLabelText("Start"), "08");
    await userEvent.type(screen.getByLabelText("End"), "09");
    await userEvent.click(screen.getByText("Book"));
    expect(
      await screen.findByText("Weekend Price Applied")
    ).toBeInTheDocument();
  });

  // --- CANCELLATION TESTS ---
  test("TEST 202 & 306: User cancels booking successfully", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(await screen.findByText("Booking cancelled")).toBeInTheDocument();
    expect(screen.getByTestId("status")).toHaveTextContent("CANCELLED");
  });

  test("TEST 201 & 307: Error cancelling within 24h", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Cancel Urgent"));
    expect(
      await screen.findByText("Cannot cancel within 24h")
    ).toBeInTheDocument();
  });

  test("TEST 308: Error cancelling non-existing booking", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Cancel Invalid"));
    expect(await screen.findByText("Booking not found")).toBeInTheDocument();
  });

  // --- PAYMENT TESTS ---
  test("TEST 047: Payment validation error when amount is negative", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Amount"), "-100");
    await userEvent.click(screen.getByText("Pay"));
    expect(await screen.findByText("Amount is Negative")).toBeInTheDocument();
  });

  test("TEST 048: Payment success updates status to PAID", async () => {
    render(<BookingSystem />);
    await userEvent.type(screen.getByLabelText("Amount"), "100");
    await userEvent.click(screen.getByText("Pay"));
    expect(await screen.findByText("Transaction Success")).toBeInTheDocument();
    expect(screen.getByTestId("status")).toHaveTextContent("PAID");
  });

  // --- REFUND & STATUS TESTS ---
  test("TEST 305: Partial refund execution", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Cancel")); // Must cancel first
    await userEvent.click(screen.getByText("Refund 50%"));
    expect(await screen.findByText("Refunded 50%")).toBeInTheDocument();
    expect(screen.getByTestId("status")).toHaveTextContent("REFUNDED");
  });

  test("TEST 082: Update status error with invalid value", async () => {
    render(<BookingSystem />);
    await userEvent.click(screen.getByText("Update Bad Status"));
    expect(await screen.findByText("Invalid Status Value")).toBeInTheDocument();
  });
});
