import { REVIEW_DELAYS } from "@/lib/utils/constants";
import type { WordStatus } from "@/types/db";
import type { ReviewAction } from "@/types/review";

export function getNextStatus(status: WordStatus, action: Exclude<ReviewAction, "skip">): WordStatus {
  if (action === "fail") {
    return "vague";
  }

  if (action === "again") {
    return status;
  }

  if (status === "known") {
    return "mastered";
  }

  if (status === "mastered") {
    return "mastered";
  }

  return "known";
}

export function getNextReviewTime(status: WordStatus, action: Exclude<ReviewAction, "skip">, now = Date.now()) {
  if (action === "fail") {
    return now + REVIEW_DELAYS.fail;
  }

  if (action === "again") {
    return now + REVIEW_DELAYS.again;
  }

  if (status === "known") {
    return now + REVIEW_DELAYS.master;
  }

  if (status === "mastered") {
    return now + REVIEW_DELAYS.mastered;
  }

  return now + REVIEW_DELAYS.promote;
}
