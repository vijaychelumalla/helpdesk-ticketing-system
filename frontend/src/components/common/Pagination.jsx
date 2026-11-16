import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        borderTop: "1px solid var(--border-color)",
        backgroundColor: "#fafbfc",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
        Showing <strong style={{ color: "var(--text-main)" }}>{startItem}</strong> to{" "}
        <strong style={{ color: "var(--text-main)" }}>{endItem}</strong> of{" "}
        <strong style={{ color: "var(--text-main)" }}>{totalItems}</strong> entries
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: "0.35rem 0.65rem" }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Only show a window of pages if totalPages is large
            if (
              totalPages > 7 &&
              Math.abs(pageNum - currentPage) > 2 &&
              pageNum !== 1 &&
              pageNum !== totalPages
            ) {
              if (Math.abs(pageNum - currentPage) === 3) {
                return (
                  <span
                    key={pageNum}
                    style={{ padding: "0.25rem 0.5rem", color: "var(--text-subtle)", fontSize: "0.8125rem" }}
                  >
                    ...
                  </span>
                );
              }
              return null;
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`}
                style={{
                  minWidth: "32px",
                  padding: "0.35rem 0.5rem",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: "0.35rem 0.65rem" }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
