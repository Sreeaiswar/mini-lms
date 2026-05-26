export type AppNotificationType = "reminder" | "milestone" | "general";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: AppNotificationType;
  createdAt: string;
  read: boolean;
  dedupeKey?: string;
}

export interface AddAppNotificationInput {
  title: string;
  body: string;
  type: AppNotificationType;
  dedupeKey?: string;
}
