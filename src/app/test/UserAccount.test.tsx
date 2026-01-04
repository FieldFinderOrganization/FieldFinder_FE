import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function UserAccount() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [wishlist, setWishlist] = React.useState<string[]>([]);

  const handleLogin = () => {
    // TEST 010, 011
    if (!email || !password) {
      setMessage("Email/Pass required");
      return;
    }
    // TEST 009
    if (!email.includes("@")) {
      setMessage("Invalid email format");
      return;
    }
    // TEST 008
    if (email === "unknown@mail.com") {
      setMessage("User not found");
      return;
    }
    // TEST 012
    if (email === "blocked@mail.com") {
      setMessage("Account blocked");
      return;
    }
    setMessage("Login success");
  };

  const handleUpdateProfile = () => {
    // TEST 322: Phone format
    if (phone && !/^\d{10}$/.test(phone)) {
      setMessage("Invalid phone format");
      return;
    }
    setMessage("Profile updated");
  };

  const handleAddress = (action: string) => {
    // TEST 054, 059
    if (!address) {
      setMessage("Address empty");
      return;
    }
    // TEST 056, 061
    if (address === "Duplicate St") {
      setMessage("Address exists");
      return;
    }
    setMessage(action === "add" ? "Address added" : "Address updated");
  };

  const handleResetPass = () => {
    // TEST 205
    if (email === "unknown@mail.com") {
      setMessage("Email not exist");
      return;
    }
    setMessage("Reset link sent");
  };

  const handleWishlist = (item: string) => {
    // TEST 282
    if (wishlist.includes(item)) {
      setMessage("Duplicate wishlist");
      return;
    }
    setWishlist([...wishlist, item]);
    setMessage("Added to wishlist");
  };

  return (
    <div>
      <input
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        aria-label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        aria-label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        aria-label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <button onClick={() => handleAddress("add")}>Add Address</button>
      <button onClick={() => handleAddress("update")}>Update Address</button>
      <button onClick={handleResetPass}>Reset Pass</button>
      <button onClick={() => handleWishlist("Item1")}>Add Wishlist</button>

      <div role="alert">{message}</div>
    </div>
  );
}

describe("User Account Automation Tests", () => {
  // --- LOGIN ---
  test("TEST 007: Login success with valid credentials", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Email"), "user@mail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123");
    await userEvent.click(screen.getByText("Login"));
    expect(await screen.findByText("Login success")).toBeInTheDocument();
  });

  test("TEST 008: Error login with non-existent email", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Email"), "unknown@mail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123");
    await userEvent.click(screen.getByText("Login"));
    expect(await screen.findByText("User not found")).toBeInTheDocument();
  });

  test("TEST 012: Error login with blocked account", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Email"), "blocked@mail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123");
    await userEvent.click(screen.getByText("Login"));
    expect(await screen.findByText("Account blocked")).toBeInTheDocument();
  });

  // --- PROFILE ---
  test("TEST 322: Profile update error on invalid phone format", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Phone"), "123");
    await userEvent.click(screen.getByText("Update Profile"));
    expect(await screen.findByText("Invalid phone format")).toBeInTheDocument();
  });

  // --- ADDRESS ---
  test("TEST 052: Add new address success", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Address"), "New St");
    await userEvent.click(screen.getByText("Add Address"));
    expect(await screen.findByText("Address added")).toBeInTheDocument();
  });

  test("TEST 054: Add address error when empty", async () => {
    render(<UserAccount />);
    await userEvent.click(screen.getByText("Add Address"));
    expect(await screen.findByText("Address empty")).toBeInTheDocument();
  });

  test("TEST 061: Update address error when duplicate", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Address"), "Duplicate St");
    await userEvent.click(screen.getByText("Update Address"));
    expect(await screen.findByText("Address exists")).toBeInTheDocument();
  });

  // --- PASSWORD & WISHLIST ---
  test("TEST 205: Password reset error when email does not exist", async () => {
    render(<UserAccount />);
    await userEvent.type(screen.getByLabelText("Email"), "unknown@mail.com");
    await userEvent.click(screen.getByText("Reset Pass"));
    expect(await screen.findByText("Email not exist")).toBeInTheDocument();
  });

  test("TEST 281 & 282: Wishlist add success and duplicate check", async () => {
    render(<UserAccount />);
    await userEvent.click(screen.getByText("Add Wishlist"));
    expect(await screen.findByText("Added to wishlist")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Add Wishlist"));
    expect(await screen.findByText("Duplicate wishlist")).toBeInTheDocument();
  });
});
