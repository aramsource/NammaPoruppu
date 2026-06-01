import { isIssueCategory } from "@/lib/report-url";

const LAST_CATEGORY_KEY = "np_last_category";

export function rememberReportCategory(category: string) {
  if (!isIssueCategory(category)) return;
  try {
    localStorage.setItem(LAST_CATEGORY_KEY, category);
  } catch {}
}

export function loadRememberedCategory(): string | null {
  try {
    const saved = localStorage.getItem(LAST_CATEGORY_KEY);
    return saved && isIssueCategory(saved) ? saved : null;
  } catch {
    return null;
  }
}
