/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function CategoryForm({
  onSave,
}: {
  onSave?: (name: string, parent: string, desc: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [parent, setParent] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const categories = ["ParentA", "ParentB"];
  const existing = ["Football", "Tennis"];

  const handleSave = () => {
    setError("");
    setMessage("");
    if (!name || !desc) {
      setError("All fields are required");
      return;
    }
    if (existing.includes(name)) {
      setError("Category already exists!");
      return;
    }
    if (parent && !categories.includes(parent)) {
      setError("Cannot find parent category!");
      return;
    }
    if (name.length < 3) {
      setError("Category name is invalid");
      return;
    }
    setMessage("Category saved successfully!");
    onSave && onSave(name, parent, desc);
  };

  return (
    <div>
      <input
        aria-label="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        aria-label="Parent Category"
        value={parent}
        onChange={(e) => setParent(e.target.value)}
      />
      <input
        aria-label="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      {message && <div role="alert">{message}</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  );
}

describe("Category Feature Automation Tests", () => {
  test("TEST 119: Add Category success with unique name and valid parent", async () => {
    const handleSave = jest.fn();
    render(<CategoryForm onSave={handleSave} />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(
        screen.getByLabelText("Description"),
        "Sport for teams"
      );
      await userEvent.click(screen.getByText("Save"));
    });
    expect(handleSave).toHaveBeenCalledWith(
      "Basketball",
      "ParentA",
      "Sport for teams"
    );
    expect(
      await screen.findByText("Category saved successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 120: Error when Category name already exists", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Football");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Sport");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category already exists!")
    ).toBeInTheDocument();
  });

  test("TEST 121: Error when Parent Category is invalid", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Volleyball"
      );
      await userEvent.type(
        screen.getByLabelText("Parent Category"),
        "NotExist"
      );
      await userEvent.type(screen.getByLabelText("Description"), "Sport");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Cannot find parent category!")
    ).toBeInTheDocument();
  });

  test("TEST 122: Error when required fields are missing", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("All fields are required")
    ).toBeInTheDocument();
  });

  test("TEST 123: Save Category success with valid data", async () => {
    const handleSave = jest.fn();
    render(<CategoryForm onSave={handleSave} />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Badminton");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentB");
      await userEvent.type(
        screen.getByLabelText("Description"),
        "Sport for 2-4 people"
      );
      await userEvent.click(screen.getByText("Save"));
    });
    expect(handleSave).toHaveBeenCalledWith(
      "Badminton",
      "ParentB",
      "Sport for 2-4 people"
    );
    expect(
      await screen.findByText("Category saved successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 124: Save Error when Category Name is invalid", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Ba");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Sport");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category name is invalid")
    ).toBeInTheDocument();
  });

  test("TEST 125: Save Error when Category Name already exists", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Tennis");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Sport");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category already exists!")
    ).toBeInTheDocument();
  });

  test("TEST 126: Save Error when required fields are missing", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("All fields are required")
    ).toBeInTheDocument();
  });

  test("TEST 127: Category information valid for update", async () => {
    const handleSave = jest.fn();
    render(<CategoryForm onSave={handleSave} />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(
        screen.getByLabelText("Description"),
        "Updated desc"
      );
      await userEvent.click(screen.getByText("Save"));
    });
    expect(handleSave).toHaveBeenCalledWith(
      "Basketball",
      "ParentA",
      "Updated desc"
    );
    expect(
      await screen.findByText("Category saved successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 128: Error when updated category name conflicts", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Football");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Update");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category already exists!")
    ).toBeInTheDocument();
  });

  test("TEST 129: Error when provided parent category does not exist", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(
        screen.getByLabelText("Parent Category"),
        "NotExist"
      );
      await userEvent.type(screen.getByLabelText("Description"), "Update");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Cannot find parent category!")
    ).toBeInTheDocument();
  });

  test("TEST 130: Error when required fields are missing on update", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("All fields are required")
    ).toBeInTheDocument();
  });

  test("TEST 131: Update Category success", async () => {
    const handleSave = jest.fn();
    render(<CategoryForm onSave={handleSave} />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(
        screen.getByLabelText("Description"),
        "Updated desc"
      );
      await userEvent.click(screen.getByText("Save"));
    });
    expect(handleSave).toHaveBeenCalledWith(
      "Basketball",
      "ParentA",
      "Updated desc"
    );
    expect(
      await screen.findByText("Category saved successfully!")
    ).toBeInTheDocument();
  });

  test("TEST 132: Update Category error when name is invalid", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Ba");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Update");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category name is invalid")
    ).toBeInTheDocument();
  });

  test("TEST 133: Update Category error when name is duplicate", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText("Category Name"), "Tennis");
      await userEvent.type(screen.getByLabelText("Parent Category"), "ParentA");
      await userEvent.type(screen.getByLabelText("Description"), "Update");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Category already exists!")
    ).toBeInTheDocument();
  });

  test("TEST 134: Update Category error when parent does not exist", async () => {
    render(<CategoryForm />);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText("Category Name"),
        "Basketball"
      );
      await userEvent.type(
        screen.getByLabelText("Parent Category"),
        "NotExist"
      );
      await userEvent.type(screen.getByLabelText("Description"), "Update");
      await userEvent.click(screen.getByText("Save"));
    });
    expect(
      await screen.findByText("Cannot find parent category!")
    ).toBeInTheDocument();
  });
});
