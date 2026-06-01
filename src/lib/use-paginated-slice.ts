import { useEffect, useMemo, useState } from "react";

export function usePaginatedSlice<T>(items: T[], pageSize: number, resetKey = "") {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const slice = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const rangeStart = items.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, items.length);

  return {
    page: safePage,
    setPage,
    totalPages,
    slice,
    rangeStart,
    rangeEnd,
    total: items.length,
  };
}
