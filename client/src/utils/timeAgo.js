import { formatDistanceToNow } from "date-fns";

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });
