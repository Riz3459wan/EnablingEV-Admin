import { useEffect, useMemo, useState } from "react";

const usePagination = (list, initialPageSize = 25) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = list?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    if (!list) return [];
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, page, pageSize]);

  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const reset = () => setPage(1);

  return {
    page,
    pageSize,
    total,
    totalPages,
    pageItems,
    setPage,
    setPageSize: changePageSize,
    reset,
  };
};

export default usePagination;
