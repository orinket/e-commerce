'use client';

import { TagInput } from 'rsuite';
import { useAppSelector } from '../store/hooks';
import JoditEditorComponent from './JoditEditor';
import SelectPickerRsuite from './SelectPickerRsuite';
import {
  ARTICLE_TYPE_OPTIONS,
  FieldError,
  ImageField,
  ROBOTS_OPTIONS,
  STATUS_OPTIONS,
  TextareaField,
  TextField,
  ToggleField,
} from './blogMasterFormFields';

export const BLOG_FORM_TABS = [
  { label: 'Basic Information', subtitle: 'Title, slug, excerpt, full content, and featured image.' },
  { label: 'Category & Organization', subtitle: 'Category, tags, author, and source details.' },
  { label: 'Publishing', subtitle: 'Status, dates, featured and trending flags.' },
  { label: 'SEO', subtitle: 'Meta tags, canonical URL, Open Graph, and Twitter cards.' },
  { label: 'URL & Visibility', subtitle: 'Robots and sitemap settings.' },
  { label: 'Content Extras', subtitle: 'Reading time, TOC, views, likes, shares, comments.' },
  { label: 'Monetization', subtitle: 'Ad slots and affiliate links.' },
  { label: 'Media & Gallery', subtitle: 'Gallery uploads, video URL, and embed code.' },
  { label: 'Schema', subtitle: 'Structured data and article schema fields.' },
];

export function BlogMasterFormTabPanels({
  activeTab,
  formData,
  errors,
  uploadingFields,
  onTrackTempAsset,
  onFieldChange,
  onResetSlug,
  onUploadSingleImage,
  onUploadGalleryImages,
  onRemoveGalleryImage,
}) {
  const masterdata = useAppSelector((s) => s.masterdata);
  switch (activeTab) {
    case 0:
      return (
        <>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(value) => onFieldChange('title', value)}
            placeholder="Enter blog title"
            error={errors.title}
          />
          <label className="form-label">Slug</label>
          <div className="input-group mb-1">
            <input
              className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
              value={formData.slug || ''}
              placeholder="blog-url-slug"
              onChange={(e) => onFieldChange('slug', e.target.value)}
            />
            <button type="button" className="btn btn-outline-secondary" onClick={onResetSlug}>
              Auto
            </button>
          </div>
          <FieldError message={errors.slug} />
          <TextareaField
            label="Short Description (Excerpt)"
            value={formData.shortDescription}
            onChange={(value) => onFieldChange('shortDescription', value)}
            placeholder="Short intro / excerpt"
            rows={3}
            error={errors.shortDescription}
          />
          <div className="mb-3">
            <label className="form-label">Full Content (Rich Text / HTML)</label>
            <JoditEditorComponent
              value={formData.fullContent || ''}
              name="fullContent"
              placeholder="Write the complete blog article"
              height={360}
              onAssetUpload={onTrackTempAsset}
              onChange={(event) => onFieldChange('fullContent', event.target.value)}
            />
            <FieldError message={errors.fullContent} />
          </div>
          <div className="row">
            <div className="col-12 col-lg-6">
              <ImageField
                label="Featured Image"
                value={formData.featuredImage}
                onChange={(value) => onFieldChange('featuredImage', value)}
                onUpload={(file) => onUploadSingleImage('featuredImage', file)}
                uploading={uploadingFields.featuredImage}
              />
            </div>
            <div className="col-12 col-lg-6">
              <TextField
                label="Image Alt Text"
                value={formData.imageAltText}
                onChange={(value) => onFieldChange('imageAltText', value)}
                placeholder="Describe featured image"
              />
            </div>
          </div>
        </>
      );
    case 1:
      return (
        <>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="form-group validate-input mb-3">
                <label className="label-form-control">Category</label>
                <SelectPickerRsuite
                  data={masterdata?.category || []}
                  placeholder="Select Category"
                  onChange={(value) => onFieldChange('category', value)}
                  value={formData.category}
                  className="col-12 h-35p"
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group validate-input mb-3">
                <label className="label-form-control">Sub Category</label>
                <SelectPickerRsuite
                  data={masterdata?.subcategorymaster || []}
                  placeholder="Select Sub Category"
                  onChange={(value) => onFieldChange('subCategory', value)}
                  value={formData.subCategory}
                  className="col-12 h-35p"
                  disabled={!formData.category}
                />
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Tags</label>
            <TagInput value={formData.tags || []} block trigger={['Enter', 'Comma']} onChange={(value) => onFieldChange('tags', value)} />
          </div>
          <div className="row">
            <div className="col-12 col-lg-6">
              <TextField
                label="Author Name"
                value={formData.authorName}
                onChange={(value) => onFieldChange('authorName', value)}
                placeholder="Author name"
              />
            </div>
            <div className="col-12 col-lg-6">
              <ImageField
                label="Author Image"
                value={formData.authorImage}
                onChange={(value) => onFieldChange('authorImage', value)}
                onUpload={(file) => onUploadSingleImage('authorImage', file)}
                uploading={uploadingFields.authorImage}
              />
            </div>
          </div>
          <TextField
            label="Source / Reference"
            value={formData.sourceReference}
            onChange={(value) => onFieldChange('sourceReference', value)}
            placeholder="Optional source / reference URL"
          />
        </>
      );
    case 2:
      return (
        <>
          <div className="row">
            <div className="col-12 col-md-4">
              <div className="form-group validate-input mb-3">
                <label className="label-form-control">Status</label>
                <select className="form-select" value={formData.status || ''} onChange={(e) => onFieldChange('status', e.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                label="Publish Date"
                type="datetime-local"
                value={formData.publishDate}
                onChange={(value) => onFieldChange('publishDate', value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                label="Schedule Date"
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(value) => onFieldChange('scheduleDate', value)}
                error={errors.scheduleDate}
              />
            </div>
          </div>
          <ToggleField label="Is Featured" checked={formData.isFeatured} onChange={(value) => onFieldChange('isFeatured', value)} />
          <ToggleField label="Is Trending" checked={formData.isTrending} onChange={(value) => onFieldChange('isTrending', value)} />
        </>
      );
    case 3:
      return (
        <>
          <TextField
            label="Meta Title"
            value={formData.metaTitle}
            onChange={(value) => onFieldChange('metaTitle', value)}
            placeholder="SEO meta title"
          />
          <TextareaField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(value) => onFieldChange('metaDescription', value)}
            placeholder="SEO meta description"
          />
          <div className="mb-3">
            <label className="form-label">Meta Keywords</label>
            <TagInput value={formData.metaKeywords || []} block trigger={['Enter', 'Comma']} onChange={(value) => onFieldChange('metaKeywords', value)} />
          </div>
          <TextField
            label="Canonical URL"
            value={formData.canonicalUrl}
            onChange={(value) => onFieldChange('canonicalUrl', value)}
            placeholder="https://example.com/blog/slug"
          />
          <div className="row">
            <div className="col-12 col-lg-6">
              <TextField
                label="OG Title"
                value={formData.ogTitle}
                onChange={(value) => onFieldChange('ogTitle', value)}
                placeholder="Open Graph title"
              />
            </div>
            <div className="col-12 col-lg-6">
              <TextField
                label="OG Description"
                value={formData.ogDescription}
                onChange={(value) => onFieldChange('ogDescription', value)}
                placeholder="Open Graph description"
              />
            </div>
          </div>
          <ImageField
            label="OG Image"
            value={formData.ogImage}
            onChange={(value) => onFieldChange('ogImage', value)}
            onUpload={(file) => onUploadSingleImage('ogImage', file)}
            uploading={uploadingFields.ogImage}
          />
          <div className="row">
            <div className="col-12 col-lg-6">
              <TextField
                label="Twitter Card Title"
                value={formData.twitterCardTitle}
                onChange={(value) => onFieldChange('twitterCardTitle', value)}
                placeholder="Twitter card title"
              />
            </div>
            <div className="col-12 col-lg-6">
              <ImageField
                label="Twitter Card Image"
                value={formData.twitterCardImage}
                onChange={(value) => onFieldChange('twitterCardImage', value)}
                onUpload={(file) => onUploadSingleImage('twitterCardImage', file)}
                uploading={uploadingFields.twitterCardImage}
              />
            </div>
          </div>
        </>
      );
    case 4:
      return (
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="form-group validate-input mb-3">
                <label className="label-form-control">Robots</label>
                <select className="form-select" value={formData.robots || ''} onChange={(e) => onFieldChange('robots', e.target.value)}>
                  {ROBOTS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
          </div>
          <div className="col-12 col-md-6 pt-md-4">
            <ToggleField label="Sitemap Include" checked={formData.sitemapInclude} onChange={(value) => onFieldChange('sitemapInclude', value)} />
          </div>
        </div>
      );
    case 5:
      return (
        <>
          <div className="row">
            <div className="col-12 col-md-6">
              <TextField label="Reading Time (Auto)" value={formData.readingTime} onChange={() => {}} readOnly />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                label="Views Count"
                type="number"
                value={formData.viewsCount}
                onChange={(value) => onFieldChange('viewsCount', value)}
              />
            </div>
          </div>
          <TextareaField
            label="Table of Contents (Auto Generate)"
            value={(formData.tableOfContents || []).map((item) => `${item.level.toUpperCase()} - ${item.text}`).join('\n')}
            onChange={() => {}}
            rows={5}
            readOnly
          />
          <div className="row">
            <div className="col-12 col-md-4">
              <TextField
                label="Likes Count"
                type="number"
                value={formData.likesCount}
                onChange={(value) => onFieldChange('likesCount', value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                label="Shares Count"
                type="number"
                value={formData.sharesCount}
                onChange={(value) => onFieldChange('sharesCount', value)}
              />
            </div>
            <div className="col-12 col-md-4 pt-md-4">
              <ToggleField label="Comments Enable" checked={formData.commentsEnabled} onChange={(value) => onFieldChange('commentsEnabled', value)} />
            </div>
          </div>
        </>
      );
    case 6:
      return (
        <>
          <TextareaField
            label="Ad Slot 1 (Top Banner Code)"
            value={formData.adSlot1}
            onChange={(value) => onFieldChange('adSlot1', value)}
            placeholder="Paste top banner ad code"
          />
          <TextareaField
            label="Ad Slot 2 (Middle Content)"
            value={formData.adSlot2}
            onChange={(value) => onFieldChange('adSlot2', value)}
            placeholder="Paste middle content ad code"
          />
          <TextareaField
            label="Ad Slot 3 (Bottom)"
            value={formData.adSlot3}
            onChange={(value) => onFieldChange('adSlot3', value)}
            placeholder="Paste bottom ad code"
          />
          <div className="mb-3">
            <label className="form-label">Affiliate Links</label>
            <TagInput value={formData.affiliateLinks || []} block trigger={['Enter', 'Comma']} onChange={(value) => onFieldChange('affiliateLinks', value)} />
          </div>
        </>
      );
    case 7:
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Multiple Images Upload</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              disabled={uploadingFields.galleryImages}
              onChange={(e) => {
                onUploadGalleryImages(e.target.files);
                e.target.value = '';
              }}
            />
            {uploadingFields.galleryImages ? <div className="text-primary small mt-1">Uploading gallery images...</div> : null}
            <div className="row g-2 mt-2">
              {(formData.galleryImages || []).map((url) => (
                <div key={url} className="col-6 col-md-4 col-lg-3">
                  <div className="border rounded-3 p-2 h-100">
                    <img src={url} alt="Gallery" className="img-fluid rounded mb-2" style={{ height: 120, width: '100%', objectFit: 'cover' }} />
                    <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => onRemoveGalleryImage(url)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TextField
            label="Video URL (YouTube / Vimeo)"
            value={formData.videoUrl}
            onChange={(value) => onFieldChange('videoUrl', value)}
            placeholder="https://youtube.com/..."
          />
          <TextareaField
            label="Embed Code"
            value={formData.embedCode}
            onChange={(value) => onFieldChange('embedCode', value)}
            placeholder="<iframe ... />"
            rows={4}
          />
        </>
      );
    case 8:
      return (
        <>
          <div className="row">
            <div className="col-12 col-md-4">
              <div className="form-group validate-input mb-3">
                <label className="label-form-control">Article Type</label>
                <select className="form-select" value={formData.articleType || ''} onChange={(e) => onFieldChange('articleType', e.target.value)}>
                  {ARTICLE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                label="Published Date"
                type="datetime-local"
                value={formData.publishedDate}
                onChange={(value) => onFieldChange('publishedDate', value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                label="Modified Date"
                type="datetime-local"
                value={formData.modifiedDate}
                onChange={(value) => onFieldChange('modifiedDate', value)}
              />
            </div>
          </div>
          <TextareaField
            label="Author Schema"
            value={formData.authorSchema}
            onChange={(value) => onFieldChange('authorSchema', value)}
            placeholder='{"@type":"Person","name":"Author Name"}'
            rows={5}
          />
        </>
      );
    default:
      return null;
  }
}
