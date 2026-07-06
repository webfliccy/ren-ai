import { ExperimentRecord } from "@/db/schema";

export const EMPTY_EXPERIMENT: ExperimentRecord = {
  hypothesis: "",
  method: "",
  model: "",
  trials: null,
  duration: "",
  scoredBy: "",
  outcome: "",
};

export function parseExperiment(raw: string): ExperimentRecord {
  try {
    return { ...EMPTY_EXPERIMENT, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_EXPERIMENT };
  }
}
