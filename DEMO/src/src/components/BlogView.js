'use client';

import { BiFilterAlt } from 'react-icons/bi';
import { Drawer } from 'rsuite';
import BlogGridList from './BlogGridList';
import BlogRightSidebar from './BlogRightSidebar';
import SearchBar from './SearchBar';

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-3 p-3 shadow-sm">
      <div className="text-muted text-uppercase small">{label}</div>
      <div className="fw-semibold fs-5 mt-1">{value}</div>
    </div>
  );
}

const BlogView = ({
  loading,
  saving,
  rows,
  primaryRow,
  totalCount,
  sourceRowCount,
  filterActive,
  pageLimit,
  formData,
  errors,
  sidebarOpen,
  uploadingFields,
  searchTerm,
  searchApplied,
  setSearchTerm,
  handleSearch,
  onClearSearch,
  filterOpen,
  setFilterOpen,
  draftStatusFilter,
  setDraftStatusFilter,
  appliedStatusFilter,
  onApplyListFilters,
  onClearStatusFilter,
  onClearAllListFilters,
  onCreate,
  onRefresh,
  onEdit,
  onPageSizeChange,
  onCloseSidebar,
  onFieldChange,
  onTrackTempAsset,
  onSave,
  onResetSlug,
  onUploadSingleImage,
  onUploadGalleryImages,
  onRemoveGalleryImage,
}) => {
  void onRefresh;

  const statusLabel = primaryRow?.status || 'draft';
  const readingTime = primaryRow?.readingTime || '1 min read';
  const seoReadyCount = [
    primaryRow?.metaTitle,
    primaryRow?.metaDescription,
    primaryRow?.canonicalUrl,
    primaryRow?.ogImage,
  ].filter(Boolean).length;

  return (
    <div className="d-flex flex-column gap-3 min-h-0 h-100 overflow-hidden">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 flex-shrink-0">
        <h1 className="h4 mb-0 text-dark">Blog Master</h1>
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <div className="flex-shrink-1" style={{ width: '280px', maxWidth: '100%' }}>
            <SearchBar handleSearch={handleSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <button type="button" className="btn btn-primary flex-shrink-0" onClick={onCreate}>
            Create
          </button>
          <button
            type="button"
            className="btn btn-primary py-4p px-9p d-flex align-items-center flex-shrink-0"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
          >
            <BiFilterAlt className="text-white text-20" />
          </button>
        </div>
      </div>

      {searchApplied.trim() ? (
        <div className="filter-display d-flex flex-wrap gap-2 flex-shrink-0 px-1">
          <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
            <span className="text-primary fw-bold me-1">SEARCH:</span>
            <span className="text-dark fw-medium">{searchApplied.trim()}</span>
            <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-danger" onClick={onClearSearch}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {appliedStatusFilter ? (
        <div className="px-1 flex-shrink-0">
          <span className="badge bg-dark bg-opacity-10 text-dark border text-capitalize">
            Status: {appliedStatusFilter}
            <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-danger" onClick={onClearStatusFilter}>
              Clear
            </button>
          </span>
        </div>
      ) : null}

      <div className="row g-3 flex-shrink-0">
        <div className="col-12 col-md-3">
          <StatCard label="Current status" value={String(statusLabel || 'draft').replace(/^\w/, (m) => m.toUpperCase())} />
        </div>
        <div className="col-12 col-md-3">
          <StatCard label="Reading time" value={readingTime} />
        </div>
        <div className="col-12 col-md-3">
          <StatCard label="Tags" value={primaryRow?.tags?.length || 0} />
        </div>
        <div className="col-12 col-md-3">
          <StatCard label="SEO fields ready" value={`${seoReadyCount}/4`} />
        </div>
      </div>

      <div className="flex-grow-1 min-h-0 d-flex flex-column">
        <BlogGridList
          loading={loading}
          rows={rows}
          totalCount={totalCount}
          sourceRowCount={sourceRowCount}
          filterActive={filterActive}
          pageLimit={pageLimit}
          onPageSizeChange={onPageSizeChange}
          onCreate={onCreate}
          onEdit={onEdit}
          onClearListFilters={onClearAllListFilters}
        />
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} size="xs">
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="d-flex flex-column gap-3 p-1">
            <div>
              <label className="form-label small fw-semibold">Status</label>
              <select
                className="form-select"
                value={draftStatusFilter}
                onChange={(e) => setDraftStatusFilter(e.target.value)}
              >
                <option value="">Any</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="d-flex flex-column gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={onApplyListFilters}>
                Apply
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setDraftStatusFilter('');
                  onClearStatusFilter();
                }}
              >
                Clear status filter
              </button>
            </div>
          </div>
        </Drawer.Body>
      </Drawer>

      <BlogRightSidebar
        open={sidebarOpen}
        onClose={onCloseSidebar}
        formData={formData}
        errors={errors}
        saving={saving}
        uploadingFields={uploadingFields}
        onFieldChange={onFieldChange}
        onTrackTempAsset={onTrackTempAsset}
        onSave={onSave}
        onResetSlug={onResetSlug}
        onUploadSingleImage={onUploadSingleImage}
        onUploadGalleryImages={onUploadGalleryImages}
        onRemoveGalleryImage={onRemoveGalleryImage}
      />
    </div>
  );
};

export default BlogView;
