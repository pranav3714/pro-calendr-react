import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Calendar } from "../Calendar";

describe("Calendar", () => {
  it("renders without crashing", () => {
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react")).toBeInTheDocument();
  });

  it("accepts events prop", () => {
    render(
      <Calendar
        events={[
          {
            id: "1",
            title: "Test Event",
            start: new Date().toISOString(),
            end: new Date().toISOString(),
          },
        ]}
      />,
    );
    expect(screen.getByTestId("pro-calendr-react")).toBeInTheDocument();
  });
});
