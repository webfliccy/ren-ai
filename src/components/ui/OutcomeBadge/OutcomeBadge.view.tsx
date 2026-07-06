import { OutcomeStatus, OUTCOME_STATUS_LABELS } from "@/lib/outcome-status";

const BADGE_CLASSES: Record<OutcomeStatus, string> = {
  pending: "bg-ink/7 text-ink-light",
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-800",
  failure: "bg-red-100 text-red-700",
  inconclusive: "bg-purple-100 text-purple-700",
};

export type OutcomeBadgeProps = {
  outcome: OutcomeStatus;
};

export function OutcomeBadgeView({ outcome }: OutcomeBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-courier text-[10px] font-bold tracking-2 uppercase ${BADGE_CLASSES[outcome]}`}
    >
      {OUTCOME_STATUS_LABELS[outcome]}
    </span>
  );
}
