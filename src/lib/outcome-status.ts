export type OutcomeStatus = "pending" | "success" | "partial" | "failure" | "inconclusive";

export const OUTCOME_STATUS_LABELS: Record<OutcomeStatus, string> = {
  pending: "Pending",
  success: "Success",
  partial: "Partial",
  failure: "Failure",
  inconclusive: "Inconclusive",
};

export const OUTCOME_STATUS_COLOURS: Record<OutcomeStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failure: "bg-red-100 text-red-700",
  inconclusive: "bg-purple-100 text-purple-700",
};
