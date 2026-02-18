export interface Booking {
  readonly id: string;
  readonly resourceId: string;
  readonly linkedResourceIds?: readonly string[];
  readonly type: string;
  readonly title: string;
  readonly student?: string;
  readonly instructor?: string;
  readonly aircraft?: string;
  readonly notes?: string;
  readonly startMinutes: number;
  readonly endMinutes: number;
  readonly status: "confirmed" | "pending" | "in-progress" | "completed" | "cancelled";
}
