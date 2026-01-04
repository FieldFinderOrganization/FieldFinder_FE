/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function AuthForm({
  mode = "signup",
  onSubmit,
}: {
  mode?: "signup" | "login";
  onSubmit: (email: string, password: string) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const existingUsers = ["user@example.com", "triet17@gmail.com"];
  const blockedUsers = ["blocked@example.com"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    // --- LOGIC SIGNUP ---
    if (mode === "signup") {
      if (existingUsers.includes(email)) {
        setError("Email already exists. Please use a different email!");
        return;
      }
      // Check Case-insensitive (TEST 003)
      if (existingUsers.some((u) => u.toLowerCase() === email.toLowerCase())) {
        setError("Email already exists. Please use a different email!");
        return;
      }
    }

    // --- LOGIC LOGIN ---
    if (mode === "login") {
      // Check format email (TEST 009)
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError("Invalid email format");
        return;
      }
      // Check user exists (TEST 008)
      if (!existingUsers.includes(email) && !blockedUsers.includes(email)) {
        setError("User not found");
        return;
      }
      // Check blocked user (TEST 012)
      if (blockedUsers.includes(email)) {
        setError("Account is blocked");
        return;
      }
    }

    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        aria-label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">{mode === "signup" ? "Signup" : "Login"}</button>
      {error && <div role="alert">{error}</div>}
    </form>
  );
}

describe("Authentication Feature Automation Tests", () => {
  // --- SIGNUP TEST CASES ---
  test("TEST 001: User cannot sign-up by using duplicate email", async () => {
    const handleSubmit = jest.fn();
    render(<AuthForm mode="signup" onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "triet17@gmail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Signup"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already exists. Please use a different email!"
    );
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("TEST 003: System treats email as case-insensitive during signup", async () => {
    const handleSubmit = jest.fn();
    render(<AuthForm mode="signup" onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "TRIET17@gmail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Signup"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already exists. Please use a different email!"
    );
  });

  test("TEST 004: User can sign-up by using valid email and password", async () => {
    const handleSubmit = jest.fn();
    render(<AuthForm mode="signup" onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "newuser@gmail.com");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Signup"));

    expect(handleSubmit).toHaveBeenCalledWith("newuser@gmail.com", "123456");
  });

  // --- LOGIN TEST CASES ---
  test("TEST 007: User can login using existing email and valid password", async () => {
    const handleSubmit = jest.fn();
    render(<AuthForm mode="login" onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByText("Login"));

    expect(handleSubmit).toHaveBeenCalledWith(
      "user@example.com",
      "password123"
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("TEST 008: User cannot login using non-existent email", async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText("Email"), "ghost@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Login"));

    expect(await screen.findByText("User not found")).toBeInTheDocument();
  });

  test("TEST 009: Verify email format when logging in", async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText("Email"), "invalid-email");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Login"));

    expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
  });

  test("TEST 010 & 011: Email and Password must be filled when logging", async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);
    await userEvent.click(screen.getByText("Login"));
    expect(
      await screen.findByText("All fields are required")
    ).toBeInTheDocument();
  });

  test("TEST 012: User cannot login using a blocked account", async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText("Email"), "blocked@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "123456");
    await userEvent.click(screen.getByText("Login"));

    expect(await screen.findByText("Account is blocked")).toBeInTheDocument();
  });
});
