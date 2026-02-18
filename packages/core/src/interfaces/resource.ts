export interface Resource {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly groupId: string;
}

export interface ResourceGroup {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly resources: readonly Resource[];
}
