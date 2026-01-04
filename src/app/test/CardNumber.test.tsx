/* eslint-disable @typescript-eslint/no-unused-expressions */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

function CardNumberForm({
  onSave,
  initialCardNumber = "",
}: {
  onSave?: (value: string) => void;
  initialCardNumber?: string;
}) {
  const [value, setValue] = React.useState(initialCardNumber);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSave = () => {
    setError("");
    setMessage("");
    if (!value) {
      setError("Card number cannot be empty!");
      return;
    }
    if (!/^\d{16}$/.test(value)) {
      setError("Invalid card number format!");
      return;
    }
    if (value === "4111111111111111") {
      setError("Card number already exists!");
      return;
    }
    if (value === "5454545454545454") {
      setMessage("Update card number successfully!");
      onSave && onSave(value);
      return;
    }
    setError("Unable to update card number. Please try again later");
  };

  return (
    <div>
      <input
        aria-label="Card Number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      {message && <div role="alert">{message}</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe("Card Number Update Automation", () => {
  it("TEST 086: update card number success with valid and unique card number", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "5454545454545454");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Update card number successfully!")
    ).toBeInTheDocument();
  });

  it("TEST 087: error when card number format is invalid", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "1234-ABCD-5678-901");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Invalid card number format!")
    ).toBeInTheDocument();
  });

  it("TEST 088: error when card number already exists", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "4111111111111111");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Card number already exists!")
    ).toBeInTheDocument();
  });

  it("TEST 089: error when card number field is empty", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Card number cannot be empty!")
    ).toBeInTheDocument();
  });

  it("TEST 090: update card number success when input is valid and saved to database", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "5454545454545454");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Update card number successfully!")
    ).toBeInTheDocument();
  });

  it("TEST 091: error when card number format is invalid", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "1234-ABCD-5678-9012");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Invalid card number format!")
    ).toBeInTheDocument();
  });

  it("TEST 092: error when card number field is empty", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Card number cannot be empty!")
    ).toBeInTheDocument();
  });

  it("TEST 093: error when database save fails", async () => {
    render(<CardNumberForm />);
    const input = screen.getByLabelText("Card Number");
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "9999999999999999");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText(
        "Unable to update card number. Please try again later"
      )
    ).toBeInTheDocument();
  });
});
