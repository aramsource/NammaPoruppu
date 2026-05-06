import { IssueCategory } from "@/lib/domain";
import {
  escalationSteps,
  responsibilityByCategory,
} from "@/lib/accountability-config";

export function getResponsibilityForCategory(category: IssueCategory) {
  return responsibilityByCategory.find((entry) => entry.category === category) ?? null;
}

export function getEscalationSteps() {
  return escalationSteps;
}
