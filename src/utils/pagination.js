// Shared pagination helper for generating page-number items.
// Returns an array like [1, 2, 3, 'ellipsis', 10] for compact display.
export function getPaginationItems(currentPage, totalPages) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }

  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i += 1) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = totalPages - 4; i <= totalPages; i += 1) pages.push(i);
  } else {
    pages.push(1);
    pages.push('ellipsis');
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}
