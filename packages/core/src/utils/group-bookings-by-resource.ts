import type { Booking } from "../interfaces/booking";

interface GroupBookingsByResourceParams {
  readonly bookings: readonly Booking[];
}

export function groupBookingsByResource({
  bookings,
}: GroupBookingsByResourceParams): Map<string, Booking[]> {
  const map = new Map<string, Booking[]>();

  for (const booking of bookings) {
    addToGroup({ map, resourceId: booking.resourceId, booking });
    addLinkedResources({ map, booking });
  }

  return map;
}

interface AddToGroupParams {
  readonly map: Map<string, Booking[]>;
  readonly resourceId: string;
  readonly booking: Booking;
}

function addToGroup({ map, resourceId, booking }: AddToGroupParams): void {
  const existing = map.get(resourceId);
  if (existing) {
    existing.push(booking);
    return;
  }
  map.set(resourceId, [booking]);
}

interface AddLinkedResourcesParams {
  readonly map: Map<string, Booking[]>;
  readonly booking: Booking;
}

function addLinkedResources({ map, booking }: AddLinkedResourcesParams): void {
  if (!booking.linkedResourceIds) {
    return;
  }

  for (const linkedId of booking.linkedResourceIds) {
    addToGroup({ map, resourceId: linkedId, booking });
  }
}
