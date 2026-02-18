import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingBlock } from "../BookingBlock";
import type { Booking } from "../../interfaces/booking";
import type { BookingTypeConfig } from "../../interfaces/booking-type";
import { BOOKING_TYPES } from "../../constants/booking-types";

function makeBooking(overrides?: Partial<Booking>): Booking {
  return {
    id: "test-1",
    resourceId: "ac-1",
    type: "flight",
    title: "VFR Navigation",
    student: "Carlos Mendes",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
    ...overrides,
  };
}

const FLIGHT_TYPE: BookingTypeConfig = BOOKING_TYPES.flight;

describe("BookingBlock", () => {
  it("renders the booking title", () => {
    const booking = makeBooking();
    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    expect(screen.getByText("VFR Navigation")).toBeDefined();
  });

  it("applies correct type color classes", () => {
    const booking = makeBooking();
    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.className).toContain("border-l-blue-500");
  });

  it("shows student name and duration in full mode", () => {
    const booking = makeBooking();
    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    expect(screen.getByText("Carlos")).toBeDefined();
    expect(screen.getByText("120m")).toBeDefined();
  });

  it("hides details row when width is narrow", () => {
    const booking = makeBooking();
    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={60}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    expect(screen.getByText("VFR Navigation")).toBeDefined();
    expect(screen.queryByText("Carlos")).toBeNull();
  });

  it("hides plane icon when width is tiny", () => {
    const booking = makeBooking({ type: "flight" });
    const { container } = render(
      <BookingBlock
        booking={booking}
        left={100}
        width={40}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    // Tiny mode should not render SVG plane icon
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("fires onClick with booking and anchor", () => {
    const booking = makeBooking();
    const handleClick = vi.fn();

    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({
        booking: expect.objectContaining({ id: "test-1" }),
        anchor: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      }),
    );
  });

  it("shows status dot for pending bookings", () => {
    const booking = makeBooking({ status: "pending" });
    const { container } = render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    const dot = container.querySelector(".bg-amber-400");
    expect(dot).not.toBeNull();
  });

  it("does not show status dot for confirmed bookings", () => {
    const booking = makeBooking({ status: "confirmed" });
    const { container } = render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    const dot = container.querySelector(".bg-amber-400");
    expect(dot).toBeNull();
  });

  it("sets data-booking-id attribute", () => {
    const booking = makeBooking({ id: "my-booking-42" });
    render(
      <BookingBlock
        booking={booking}
        left={100}
        width={200}
        top={4}
        height={48}
        typeConfig={FLIGHT_TYPE}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.getAttribute("data-booking-id")).toBe("my-booking-42");
  });
});
