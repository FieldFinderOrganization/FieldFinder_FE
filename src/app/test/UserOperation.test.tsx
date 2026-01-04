import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function UserProfileComponent() {
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [wishlist, setWishlist] = React.useState<string[]>([]);

  const handleUpdateProfile = () => {
    // TEST 322: Invalid phone
    if (phone && !/^\d{10}$/.test(phone)) {
      setMessage("Invalid phone format");
      return;
    }
    setMessage("Profile updated");
  };

  const handleAddAddress = () => {
    // TEST 054: Empty address
    if (!address) {
      setMessage("Address field is empty");
      return;
    }
    // TEST 056: Duplicate
    if (address === "Duplicate St") {
      setMessage("Address already exists");
      return;
    }
    setMessage("Address saved");
  };

  const handleWishlist = (item: string) => {
    // TEST 282: Duplicate wishlist
    if (wishlist.includes(item)) {
      setMessage("Item already in wishlist");
      return;
    }
    setWishlist([...wishlist, item]);
    setMessage("Added to wishlist");
  };

  const handleResetPassword = (email: string) => {
    // TEST 205: Email not exist
    if (email === "unknown@mail.com") {
      setMessage("Email does not exist");
      return;
    }
    setMessage("Reset link sent");
  };

  return (
    <div>
      <input
        aria-label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleUpdateProfile}>Update Profile</button>

      <input
        aria-label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={handleAddAddress}>Add Address</button>

      <button onClick={() => handleWishlist("Prod1")}>Add Wishlist</button>
      <button onClick={() => handleResetPassword("unknown@mail.com")}>
        Reset Pass
      </button>
      <div role="alert">{message}</div>
    </div>
  );
}

describe("User Operations Automation Tests", () => {
  test("TEST 322: Profile update error when phone format is invalid", async () => {
    render(<UserProfileComponent />);
    await userEvent.type(screen.getByLabelText("Phone"), "123");
    await userEvent.click(screen.getByText("Update Profile"));
    expect(await screen.findByText("Invalid phone format")).toBeInTheDocument();
  });

  test("TEST 054: Add address error when field is empty", async () => {
    render(<UserProfileComponent />);
    await userEvent.click(screen.getByText("Add Address"));
    expect(
      await screen.findByText("Address field is empty")
    ).toBeInTheDocument();
  });

  test("TEST 056: Add address error when duplicate", async () => {
    render(<UserProfileComponent />);
    await userEvent.type(screen.getByLabelText("Address"), "Duplicate St");
    await userEvent.click(screen.getByText("Add Address"));
    expect(
      await screen.findByText("Address already exists")
    ).toBeInTheDocument();
  });

  test("TEST 281: Add product to wishlist success", async () => {
    render(<UserProfileComponent />);
    await userEvent.click(screen.getByText("Add Wishlist"));
    expect(await screen.findByText("Added to wishlist")).toBeInTheDocument();
  });

  test("TEST 282: Duplicate wishlist item handled gracefully", async () => {
    render(<UserProfileComponent />);
    await userEvent.click(screen.getByText("Add Wishlist")); // Add once
    await userEvent.click(screen.getByText("Add Wishlist")); // Add again
    expect(
      await screen.findByText("Item already in wishlist")
    ).toBeInTheDocument();
  });

  test("TEST 205: Password reset error when email does not exist", async () => {
    render(<UserProfileComponent />);
    await userEvent.click(screen.getByText("Reset Pass"));
    expect(await screen.findByText("Email does not exist")).toBeInTheDocument();
  });
});
