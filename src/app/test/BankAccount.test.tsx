/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function BankAccountForm({
  onSave,
  initialAccount = "",
  initialBank = "",
  mode = "create",
}: {
  onSave?: (acc: string, bank: string) => void;
  initialAccount?: string;
  initialBank?: string;
  mode?: "create" | "update";
}) {
  const [account, setAccount] = React.useState(initialAccount);
  const [bank, setBank] = React.useState(initialBank);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const supportedBanks = ["Vietcombank", "ACB", "Techcombank"];
  const existingAccounts = ["987654321098"];

  const handleSave = () => {
    setError("");
    setMessage("");
    if (!account) {
      setError("Account number is required");
      return;
    }
    if (!bank) {
      setError("Bank name is required");
      return;
    }

    if (!/^\d{12}$/.test(account)) {
      setError("Invalid account number format!");
      return;
    }
    if (!supportedBanks.includes(bank)) {
      setError("Invalid bank name");
      return;
    }

    if (existingAccounts.includes(account) && account !== initialAccount) {
      setError("Bank account already exists!");
      return;
    }

    if (mode === "update" && account === "000000000000") {
      setError("Database error");
      return;
    }

    setMessage(
      mode === "create"
        ? "Bank account information validated successfully"
        : "Updated successfully"
    );
    onSave && onSave(account, bank);
  };

  return (
    <div>
      <input
        aria-label="Bank Account Number"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
      />
      <input
        aria-label="Bank Name"
        value={bank}
        onChange={(e) => setBank(e.target.value)}
      />
      <button onClick={handleSave}>
        {mode === "create" ? "Save" : "Update"}
      </button>
      {message && <div>{message}</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe("Bank Account Automation Tests", () => {
  // --- VALIDATE TESTS ---
  it("TEST 094: Validate bank account success", async () => {
    render(<BankAccountForm />);
    await userEvent.type(
      screen.getByLabelText("Bank Account Number"),
      "123456789012"
    );
    await userEvent.type(screen.getByLabelText("Bank Name"), "Vietcombank");
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Bank account information validated successfully")
    ).toBeInTheDocument();
  });

  it("TEST 095: Error when account number format is invalid", async () => {
    render(<BankAccountForm />);
    await userEvent.type(
      screen.getByLabelText("Bank Account Number"),
      "12AB-3456-7890"
    );
    await userEvent.type(screen.getByLabelText("Bank Name"), "Vietcombank");
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Invalid account number format!")
    ).toBeInTheDocument();
  });

  it("TEST 096: Error when bank name is invalid", async () => {
    render(<BankAccountForm />);
    await userEvent.type(
      screen.getByLabelText("Bank Account Number"),
      "456789012345"
    );
    await userEvent.type(screen.getByLabelText("Bank Name"), "FooPay Bank");
    await userEvent.click(screen.getByText("Save"));

    expect(await screen.findByText("Invalid bank name")).toBeInTheDocument();
  });

  it("TEST 097: Error when account already exists", async () => {
    render(<BankAccountForm />);
    await userEvent.type(
      screen.getByLabelText("Bank Account Number"),
      "987654321098"
    );
    await userEvent.type(screen.getByLabelText("Bank Name"), "Vietcombank");
    await userEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Bank account already exists!")
    ).toBeInTheDocument();
  });

  it("TEST 098: Error when required fields are empty", async () => {
    render(<BankAccountForm />);
    await userEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Account number is required")
    ).toBeInTheDocument();
  });

  // --- UPDATE TESTS ---
  it("TEST 099: Update bank account success", async () => {
    const handleSave = jest.fn();
    render(
      <BankAccountForm
        mode="update"
        initialAccount="123456789012"
        initialBank="ACB"
        onSave={handleSave}
      />
    );

    const accInput = screen.getByLabelText("Bank Account Number");
    const bankInput = screen.getByLabelText("Bank Name");

    await userEvent.clear(accInput);
    await userEvent.type(accInput, "123456789999");
    await userEvent.clear(bankInput);
    await userEvent.type(bankInput, "Vietcombank");
    await userEvent.click(screen.getByText("Update"));

    expect(await screen.findByText("Updated successfully")).toBeInTheDocument();
    expect(handleSave).toHaveBeenCalledWith("123456789999", "Vietcombank");
  });

  it("TEST 100: Update error when account format is invalid", async () => {
    render(<BankAccountForm mode="update" initialAccount="123456789012" />);

    const accInput = screen.getByLabelText("Bank Account Number");
    await userEvent.clear(accInput);
    await userEvent.type(accInput, "abc");
    await userEvent.click(screen.getByText("Update"));

    expect(
      await screen.findByText("Invalid account number format!")
    ).toBeInTheDocument();
  });

  it("TEST 101: Update error when bank name is invalid", async () => {
    render(<BankAccountForm mode="update" initialAccount="123456789012" />);

    const bankInput = screen.getByLabelText("Bank Name");
    await userEvent.clear(bankInput);
    await userEvent.type(bankInput, "FakeBank");
    await userEvent.click(screen.getByText("Update"));

    expect(await screen.findByText("Invalid bank name")).toBeInTheDocument();
  });

  it("TEST 102: Update error when required fields are missing", async () => {
    render(<BankAccountForm mode="update" initialAccount="123456789012" />);

    await userEvent.clear(screen.getByLabelText("Bank Account Number"));
    await userEvent.click(screen.getByText("Update"));

    expect(
      await screen.findByText("Account number is required")
    ).toBeInTheDocument();
  });
});
