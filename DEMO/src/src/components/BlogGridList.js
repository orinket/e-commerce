'use client';

import { BsThreeDotsVertical } from 'react-icons/bs';
import { TbGridDots } from 'react-icons/tb';
import { Placeholder } from 'rsuite';
import NoDataFound from './NoDataFound';
import Pagination from './Pagination';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const normalized = String(status || 'draft').toLowerCase();
  const className =
    normalized === 'published'
      ? 'bg-success'
      : normalized === 'scheduled'
        ? 'bg-warning text-dark'
        : 'bg-secondary';

  return <span className={`badge ${className}`}>{normalized}</span>;
}

const BlogGridList = ({
  loading,
  rows,
  totalCount,
  sourceRowCount = 0,
  filterActive = false,
  pageLimit,
  onPageSizeChange,
  onCreate,
  onEdit,
  onClearListFilters,
}) => {
  if (!rows.length) {
    const showFilteredEmpty = !loading && sourceRowCount > 0 && filterActive;
    return (
      <section className="table-section flex-grow-1 d-flex flex-column min-h-0 h-100">
        <div className="blog-master-table-shell position-relative table-custom overflow-hidden flex-grow-1 d-flex flex-column min-h-0 h-100">
          <div className="overflow-x-auto flex-grow-1 min-h-0">
            <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
              <table className="table table-striped table-hover w-100">
                <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                  <tr>
                    <th className="px-3 py-2 min-w-0 tbl-w-50p text-center">
                      <div className="d-flex justify-content-center align-items-center">
                        <TbGridDots className="text-secondary fs-5" />
                      </div>
                    </th>
                    <th className="px-4 py-2">
                      <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      <tr className="shimmer-effect-row">
                        <td className="px-3 py-1 min-w-0 tbl-w-50p text-center">
                          <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-30p mx-auto" />
                        </td>
                        <td>
                          <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" />
                        </td>
                      </tr>
                      <tr className="shimmer-effect-row">
                        <td className="px-3 py-1 min-w-0 tbl-w-50p text-center">
                          <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-30p mx-auto" />
                        </td>
                        <td>
                          <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" />
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={50}>
                        <div className="py-5 text-center px-3">
                          {showFilteredEmpty ? (
                            <>
                              <p className="text-secondary mb-3">No blog matches your search or filters.</p>
                              <button type="button" className="btn btn-outline-primary me-2" onClick={onClearListFilters}>
                                Clear search &amp; filters
                              </button>
                            </>
                          ) : (
                            <>
                              <NoDataFound />
                              <div className="d-flex justify-content-center mt-3">
                                <button type="button" className="btn btn-primary" onClick={onCreate}>
                                  Create
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            totalCount={loading ? 0 : totalCount}
            showingCount={0}
            pageSize={pageLimit}
            onPageSizeChange={onPageSizeChange}
            loading={loading}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="table-section flex-grow-1 d-flex flex-column min-h-0 h-100">
      <div className="blog-master-table-shell position-relative table-custom overflow-hidden flex-grow-1 d-flex flex-column min-h-0 h-100">
        <div className="overflow-x-auto flex-grow-1 min-h-0">
          <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
            <table className="table table-striped table-hover w-100">
              <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                <tr>
                  <th className="px-3 py-2 min-w-0 tbl-w-50p text-center">
                    <div className="d-flex justify-content-center align-items-center">
                      <TbGridDots className="text-secondary fs-5" aria-hidden />
                    </div>
                  </th>
                  <th className="px-2 pt-12p pb-12p tbl-w-240p">TITLE</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-220p">SLUG</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-180p">CATEGORY</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-140p">STATUS</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-180p">PUBLISH DATE</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-150p">READING TIME</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-180p">FLAGS</th>
                  <th className="px-2 pt-12p pb-12p tbl-w-120p text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <tr className="shimmer-effect-row">
                      <td className="px-3 py-1 min-w-0 tbl-w-50p text-center">
                        <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-30p mx-auto" />
                      </td>
                      <td className="tbl-w-240p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-220p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-140p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-150p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-120p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                    </tr>
                    <tr className="shimmer-effect-row">
                      <td className="px-3 py-1 min-w-0 tbl-w-50p text-center">
                        <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-30p mx-auto" />
                      </td>
                      <td className="tbl-w-240p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-220p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-140p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-150p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-180p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                      <td className="tbl-w-120p"><Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-100" /></td>
                    </tr>
                  </>
                ) : null}
                {rows.map((row) => (
                  <tr key={row._id || row.slug || 'blog-master'}>
                    <td className="px-3 py-1 text-center position-relative">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center h-30p w-30p mx-auto"
                        onClick={() => onEdit(row)}
                        title="Edit blog"
                      >
                        <BsThreeDotsVertical />
                      </button>
                    </td>
                    <td className="px-3 py-1 align-middle">
                      <div className="fw-semibold">{row.title || 'Untitled blog'}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: 260 }}>
                        {row.shortDescription || 'No short description'}
                      </div>
                    </td>
                    <td className="px-3 py-1 align-middle text-break">{row.slug || '—'}</td>
                    <td className="px-3 py-1 align-middle">
                      <div>{row.category || '—'}</div>
                      <div className="text-muted small">{row.subCategory || 'No sub category'}</div>
                    </td>
                    <td className="px-3 py-1 align-middle"><StatusBadge status={row.status} /></td>
                    <td className="px-3 py-1 align-middle">{formatDate(row.publishDate || row.publishedDate || row.scheduleDate)}</td>
                    <td className="px-3 py-1 align-middle">{row.readingTime || '—'}</td>
                    <td className="px-3 py-1 align-middle">
                      <div className="d-flex flex-column gap-1 small">
                        <span>{row.isFeatured ? 'Featured' : 'Not featured'}</span>
                        <span>{row.isTrending ? 'Trending' : 'Not trending'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1 align-middle text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          totalCount={totalCount}
          showingCount={rows.length}
          pageSize={pageLimit}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
        />
      </div>
    </section>
  );
};

export default BlogGridList;
