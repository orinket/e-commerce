'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../utils/apiService';
import BlogView from '../../components/BlogView';

const ALIAS = 'storefrontblogsectionmaster';

const DEFAULT_FORM = {
  _id: '',
  title: '',
  slug: '',
  shortDescription: '',
  fullContent: '',
  featuredImage: '',
  imageAltText: '',
  category: '',
  subCategory: '',
  tags: [],
  authorName: '',
  authorImage: '',
  sourceReference: '',
  status: 'draft',
  publishDate: '',
  scheduleDate: '',
  isFeatured: false,
  isTrending: false,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [],
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCardTitle: '',
  twitterCardImage: '',
  robots: 'index',
  sitemapInclude: true,
  tableOfContents: [],
  readingTime: '1 min read',
  viewsCount: 0,
  likesCount: 0,
  sharesCount: 0,
  commentsEnabled: true,
  adSlot1: '',
  adSlot2: '',
  adSlot3: '',
  affiliateLinks: [],
  galleryImages: [],
  videoUrl: '',
  embedCode: '',
  articleType: 'BlogPosting',
  publishedDate: '',
  modifiedDate: '',
  authorSchema: '',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value > 0;
  return fallback;
}

function stripHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined') return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const div = window.document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function computeReadingTime(html) {
  const text = stripHtml(html);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function computeTableOfContents(html) {
  if (!html) return [];
  if (typeof window === 'undefined') return [];
  const div = window.document.createElement('div');
  div.innerHTML = html;
  const headings = Array.from(div.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  return headings
    .map((node, index) => {
      const text = (node.textContent || '').trim();
      if (!text) return null;
      return {
        id: slugify(text) || `section-${index + 1}`,
        text,
        level: node.tagName.toLowerCase(),
      };
    })
    .filter(Boolean);
}

function toIsoLocalDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function normalizeRow(row = {}) {
  const merged = {
    ...DEFAULT_FORM,
    ...row,
    tags: normalizeArray(row.tags),
    metaKeywords: normalizeArray(row.metaKeywords),
    affiliateLinks: normalizeArray(row.affiliateLinks),
    galleryImages: normalizeArray(row.galleryImages),
    isFeatured: normalizeBoolean(row.isFeatured, false),
    isTrending: normalizeBoolean(row.isTrending, false),
    sitemapInclude: normalizeBoolean(row.sitemapInclude, true),
    commentsEnabled: normalizeBoolean(row.commentsEnabled, true),
    viewsCount: Number(row.viewsCount || 0),
    likesCount: Number(row.likesCount || 0),
    sharesCount: Number(row.sharesCount || 0),
    publishDate: toIsoLocalDate(row.publishDate),
    scheduleDate: toIsoLocalDate(row.scheduleDate),
    publishedDate: toIsoLocalDate(row.publishedDate),
    modifiedDate: toIsoLocalDate(row.modifiedDate),
  };

  const derivedSlug = merged.slug || slugify(merged.title);
  const derivedReadingTime = merged.readingTime || computeReadingTime(merged.fullContent);
  const derivedToc = Array.isArray(merged.tableOfContents) && merged.tableOfContents.length
    ? merged.tableOfContents
    : computeTableOfContents(merged.fullContent);

  return {
    ...merged,
    slug: derivedSlug,
    readingTime: derivedReadingTime,
    tableOfContents: derivedToc,
  };
}

function hasMeaningfulContent(row = {}) {
  return Boolean(
    String(row.title || '').trim() ||
      String(row.slug || '').trim() ||
      String(stripHtml(row.fullContent || '')).trim() ||
      String(row.featuredImage || '').trim()
  );
}

const BLOG_IMAGE_FIELDS = ['featuredImage', 'authorImage', 'ogImage', 'twitterCardImage'];
const HTML_IMAGE_SRC_REGEX = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

function isTempAssetUrl(url) {
  return /\/temp\//i.test(String(url || '').trim());
}

function extractEditorImageUrls(html) {
  const value = String(html || '');
  const urls = [];
  let match;

  while ((match = HTML_IMAGE_SRC_REGEX.exec(value)) !== null) {
    if (match[1]) urls.push(String(match[1]).trim());
  }

  HTML_IMAGE_SRC_REGEX.lastIndex = 0;
  return urls.filter(Boolean);
}

function collectBlogAssetUrls(row = {}) {
  const urls = new Set();

  BLOG_IMAGE_FIELDS.forEach((field) => {
    const url = String(row?.[field] || '').trim();
    if (url) urls.add(url);
  });

  (Array.isArray(row.galleryImages) ? row.galleryImages : []).forEach((url) => {
    const normalized = String(url || '').trim();
    if (normalized) urls.add(normalized);
  });

  extractEditorImageUrls(row.fullContent).forEach((url) => urls.add(url));

  return [...urls];
}

const BlogController = () => {
  const [rows, setRows] = useState([]);
  const [pageLimit, setPageLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});
  const [searchApplied, setSearchApplied] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatusFilter, setDraftStatusFilter] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
  const sessionTempAssetsRef = useRef(new Set());

  useEffect(() => {
    if (!filterOpen) return;
    setDraftStatusFilter(appliedStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when drawer opens
  }, [filterOpen]);

  const syncDerivedFields = useCallback((draft) => {
    const next = { ...draft };
    if (!slugManuallyEdited || !String(next.slug || '').trim()) {
      next.slug = slugify(next.title);
    }
    next.readingTime = computeReadingTime(next.fullContent);
    next.tableOfContents = computeTableOfContents(next.fullContent);
    return next;
  }, [slugManuallyEdited]);

  const loadBlog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiService.read(ALIAS, {
        pagination: { page: 1, limit: 1 },
        sort: { field: 'updatedAt', order: -1 },
      });
      const rawRow = response?.data?.[0] || {};
      const normalized = normalizeRow(rawRow);
      setFormData(normalized);
      setSlugManuallyEdited(Boolean(normalized.slug));
      setRows(hasMeaningfulContent(normalized) ? [normalized] : []);
    } catch (error) {
      toast.error(error.message || 'Could not load blog master');
      const empty = normalizeRow(DEFAULT_FORM);
      setFormData(empty);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const handleSearch = useCallback((term) => {
    const t = String(term ?? '').trim();
    setSearchApplied(t);
    setSearchTerm(String(term ?? ''));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchApplied('');
    setSearchTerm('');
  }, []);

  const handleApplyListFilters = useCallback(() => {
    setAppliedStatusFilter(draftStatusFilter);
    setFilterOpen(false);
  }, [draftStatusFilter]);

  const handleClearStatusFilter = useCallback(() => {
    setAppliedStatusFilter('');
    setDraftStatusFilter('');
  }, []);

  const handleClearAllListFilters = useCallback(() => {
    handleClearSearch();
    handleClearStatusFilter();
  }, [handleClearSearch, handleClearStatusFilter]);

  const resetTempAssetTracking = useCallback(() => {
    sessionTempAssetsRef.current = new Set();
  }, []);

  const trackTempAsset = useCallback((url) => {
    const normalized = String(url || '').trim();
    if (!isTempAssetUrl(normalized)) return;
    sessionTempAssetsRef.current.add(normalized);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    if (field === 'slug') setSlugManuallyEdited(true);
    setFormData((prev) => {
      const next = syncDerivedFields({ ...prev, [field]: value });
      return next;
    });
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, [syncDerivedFields]);

  const handleResetSlug = useCallback(() => {
    setSlugManuallyEdited(false);
    setFormData((prev) => ({
      ...prev,
      slug: slugify(prev.title),
    }));
    setErrors((prev) => {
      if (!prev.slug) return prev;
      const next = { ...prev };
      delete next.slug;
      return next;
    });
  }, []);

  const handleOpenCreate = useCallback(() => {
    const base = normalizeRow({
      ...DEFAULT_FORM,
      _id: formData._id || '',
    });
    resetTempAssetTracking();
    setFormData(base);
    setErrors({});
    setSlugManuallyEdited(false);
    setSidebarOpen(true);
  }, [formData._id, resetTempAssetTracking]);

  const handleEdit = useCallback((row) => {
    const normalized = normalizeRow(row);
    resetTempAssetTracking();
    setFormData(normalized);
    setErrors({});
    setSlugManuallyEdited(Boolean(normalized.slug && normalized.slug !== slugify(normalized.title)));
    setSidebarOpen(true);
  }, [resetTempAssetTracking]);

  const handleUploadSingleImage = useCallback(async (field, file) => {
    if (!file) return;
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    try {
      const result = await ApiService.upload(file);
      if (result.status === 200 && result.data?.url) {
        trackTempAsset(result.data.url);
        handleFieldChange(field, result.data.url);
        toast.success('Image uploaded');
      } else {
        toast.error(result.message || 'Could not upload image');
      }
    } catch (error) {
      toast.error(error.message || 'Could not upload image');
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  }, [handleFieldChange, trackTempAsset]);

  const handleUploadGalleryImages = useCallback(async (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    setUploadingFields((prev) => ({ ...prev, galleryImages: true }));
    try {
      const uploaded = [];
      for (const file of incoming) {
        const result = await ApiService.upload(file);
        if (result.status === 200 && result.data?.url) {
          uploaded.push(result.data.url);
          trackTempAsset(result.data.url);
        }
      }
      if (!uploaded.length) {
        toast.error('Could not upload gallery images');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...uploaded],
      }));
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (error) {
      toast.error(error.message || 'Could not upload gallery images');
    } finally {
      setUploadingFields((prev) => ({ ...prev, galleryImages: false }));
    }
  }, [trackTempAsset]);

  const handleRemoveGalleryImage = useCallback((url) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((item) => item !== url),
    }));
  }, []);

  const validateForm = useCallback((draft) => {
    const nextErrors = {};
    if (!String(draft.title || '').trim()) nextErrors.title = 'Title is required';
    if (!String(draft.slug || '').trim()) nextErrors.slug = 'Slug is required';
    if (!String(draft.shortDescription || '').trim()) nextErrors.shortDescription = 'Short description is required';
    if (!String(stripHtml(draft.fullContent || '')).trim()) nextErrors.fullContent = 'Full content is required';
    if (draft.status === 'scheduled' && !draft.scheduleDate) nextErrors.scheduleDate = 'Schedule date is required for scheduled status';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, []);

  const handleSave = useCallback(async () => {
    const prepared = syncDerivedFields({
      ...formData,
      tempAssetUrls: [...sessionTempAssetsRef.current].filter((url) => {
        const normalized = String(url || '').trim();
        if (!normalized) return false;
        return collectBlogAssetUrls(formData).includes(normalized) || isTempAssetUrl(normalized);
      }),
      publishedDate: formData.publishedDate || formData.publishDate || '',
      modifiedDate: new Date().toISOString(),
    });

    if (!validateForm(prepared)) return;

    setSaving(true);
    try {
      const response = prepared._id
        ? await ApiService.update(ALIAS, prepared._id, prepared)
        : await ApiService.create(ALIAS, prepared);

      if (response.status !== 200 || !response.success) {
        toast.error(response.message || 'Could not save blog master');
        return;
      }

      const saved = normalizeRow(response.data || prepared);
      setFormData(saved);
      setRows(hasMeaningfulContent(saved) ? [saved] : []);
      setSidebarOpen(false);
      resetTempAssetTracking();
      setSlugManuallyEdited(Boolean(saved.slug && saved.slug !== slugify(saved.title)));
      toast.success(prepared._id ? 'Blog updated successfully' : 'Blog created successfully');
    } catch (error) {
      toast.error(error.message || 'Could not save blog master');
    } finally {
      setSaving(false);
    }
  }, [formData, resetTempAssetTracking, syncDerivedFields, validateForm]);

  const handleCloseSidebar = useCallback(async () => {
    const draftUrls = collectBlogAssetUrls(formData);
    const cleanupCandidates = [...sessionTempAssetsRef.current].filter((url) => isTempAssetUrl(url) || draftUrls.includes(url));
    if (cleanupCandidates.length) {
      const response = await ApiService.cleanupTempUploads(cleanupCandidates);
      if (!response.success) {
        toast.error(response.message || 'Could not clean temporary images');
      }
    }
    resetTempAssetTracking();
    setSidebarOpen(false);
  }, [formData, resetTempAssetTracking]);

  const primaryRow = useMemo(() => rows[0] || null, [rows]);

  const filteredRows = useMemo(() => {
    let list = rows;
    if (appliedStatusFilter) {
      list = list.filter((r) => String(r.status || '').toLowerCase() === appliedStatusFilter);
    }
    if (searchApplied.trim()) {
      const q = searchApplied.trim().toLowerCase();
      list = list.filter(
        (r) =>
          String(r.title || '')
            .toLowerCase()
            .includes(q) ||
          String(r.slug || '')
            .toLowerCase()
            .includes(q) ||
          String(r.shortDescription || '')
            .toLowerCase()
            .includes(q) ||
          String(r.category || '')
            .toLowerCase()
            .includes(q)
      );
    }
    return list;
  }, [rows, appliedStatusFilter, searchApplied]);

  const visibleRows = useMemo(() => filteredRows.slice(0, pageLimit), [filteredRows, pageLimit]);
  const filterActive = Boolean(searchApplied.trim() || appliedStatusFilter);
  const sourceRowCount = rows.length;

  return (
    <BlogView
      loading={loading}
      saving={saving}
      rows={visibleRows}
      primaryRow={primaryRow}
      totalCount={filteredRows.length}
      sourceRowCount={sourceRowCount}
      filterActive={filterActive}
      pageLimit={pageLimit}
      formData={formData}
      errors={errors}
      sidebarOpen={sidebarOpen}
      uploadingFields={uploadingFields}
      searchTerm={searchTerm}
      searchApplied={searchApplied}
      setSearchTerm={setSearchTerm}
      handleSearch={handleSearch}
      onClearSearch={handleClearSearch}
      filterOpen={filterOpen}
      setFilterOpen={setFilterOpen}
      draftStatusFilter={draftStatusFilter}
      setDraftStatusFilter={setDraftStatusFilter}
      appliedStatusFilter={appliedStatusFilter}
      onApplyListFilters={handleApplyListFilters}
      onClearStatusFilter={handleClearStatusFilter}
      onClearAllListFilters={handleClearAllListFilters}
      onRefresh={loadBlog}
      onCreate={handleOpenCreate}
      onEdit={handleEdit}
      onPageSizeChange={setPageLimit}
      onCloseSidebar={handleCloseSidebar}
      onFieldChange={handleFieldChange}
      onTrackTempAsset={trackTempAsset}
      onSave={handleSave}
      onResetSlug={handleResetSlug}
      onUploadSingleImage={handleUploadSingleImage}
      onUploadGalleryImages={handleUploadGalleryImages}
      onRemoveGalleryImage={handleRemoveGalleryImage}
    />
  );
};

export default BlogController;
