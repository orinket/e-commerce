'use client';

import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setMasterData, setMasterDataList } from '../store/reducer';
import ModalRsuite from './modalrsuite';
import { BLOG_FORM_TABS, BlogMasterFormTabPanels } from './BlogMasterTabPanels';
import { SectionCard } from './blogMasterFormFields';
import apiService from '../utils/apiService';
import { getCurrentState } from '../utils/reduxUtils';

const DEFAULT_BLOG_TAB_INDEX = 0;

const BlogRightSidebar = ({
  open,
  onClose,
  formData,
  errors,
  saving,
  uploadingFields,
  onFieldChange,
  onTrackTempAsset,
  onSave,
  onResetSlug,
  onUploadSingleImage,
  onUploadGalleryImages,
  onRemoveGalleryImage,
}) => {
  const dispatch = useAppDispatch();
  const masterdata = useAppSelector((s) => s.masterdata);
  const isEdit = Boolean(formData._id);
  const primaryLabel = saving ? 'Saving...' : isEdit ? 'Save' : 'Create';
  const [activeTab, setActiveTab] = useState(DEFAULT_BLOG_TAB_INDEX);
  const tabsRef = useRef(null);
  const [tabsNavState, setTabsNavState] = useState({ hasOverflow: false, showLeft: false, showRight: false });

  // Load master data for dropdowns - Fixed compilation errors
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        // Load categories
        const categoryResult = await apiService.read('category', {
          pagination: { limit: 1000 },
          filters: { status: 1 },
          projection: { categoryname: 1, _id: 1 }
        });

        if (categoryResult.status === 200) {
          const categoryData = categoryResult.data.map((item) => ({
            label: item.categoryname,
            value: item._id,
          }));

          const currentState = getCurrentState();
          dispatch(setMasterData({ ...currentState.masterdata, category: categoryData }));
          dispatch(setMasterDataList({ ...currentState.masterdatalist, category: categoryResult.data }));
        }

        // Load subcategories
        const subcategoryResult = await apiService.read('subcategorymaster', {
          pagination: { limit: 1000 },
          filters: { status: 1 },
          projection: { subcategoryname: 1, _id: 1, categoryid: 1 }
        });

        if (subcategoryResult.status === 200) {
          const subcategoryData = subcategoryResult.data.map((item) => ({
            label: item.subcategoryname,
            value: item._id,
            categoryid: item.categoryid,
          }));

          const currentState = getCurrentState();
          dispatch(setMasterData({ ...currentState.masterdata, subcategorymaster: subcategoryData }));
          dispatch(setMasterDataList({ ...currentState.masterdatalist, subcategorymaster: subcategoryResult.data }));
        }
      } catch (error) {
        console.error('Error loading master data:', error);
      }
    };

    if (open && (!masterdata.category || masterdata.category.length === 0)) {
      loadMasterData();
    }
  }, [open, masterdata.category, dispatch]);

  useEffect(() => {
    if (open) document.body.classList.add('blog-master-modal-open');
    else document.body.classList.remove('blog-master-modal-open');
    return () => document.body.classList.remove('blog-master-modal-open');
  }, [open]);

  useEffect(() => {
    if (open) setActiveTab(DEFAULT_BLOG_TAB_INDEX);
  }, [open]);

  const updateTabsOverflowState = () => {
    const tabElement = tabsRef.current;
    if (!tabElement) {
      setTabsNavState({ hasOverflow: false, showLeft: false, showRight: false });
      return;
    }

    const maxScrollLeft = Math.max(0, tabElement.scrollWidth - tabElement.clientWidth);
    const hasOverflow = maxScrollLeft > 1;
    const showLeft = hasOverflow && tabElement.scrollLeft > 1;
    const showRight = hasOverflow && tabElement.scrollLeft < maxScrollLeft - 1;
    setTabsNavState({ hasOverflow, showLeft, showRight });
  };

  const scrollTabsBy = (direction) => {
    const tabElement = tabsRef.current;
    if (!tabElement) return;
    const scrollAmount = Math.max(180, Math.floor(tabElement.clientWidth * 0.55));
    tabElement.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    window.setTimeout(updateTabsOverflowState, 220);
  };

  useEffect(() => {
    updateTabsOverflowState();
    window.addEventListener('resize', updateTabsOverflowState);
    return () => window.removeEventListener('resize', updateTabsOverflowState);
  }, [open, activeTab]);

  const modalTitle = isEdit ? 'Edit Blog Master' : 'Create Blog Master';

  const modalBody = (
    <div className="blog-master-modal-scroll">
      <div className="container-fluid py-3 py-lg-4 px-3 px-lg-4 d-flex flex-column min-h-0 h-100">
        <div className="row g-3 flex-grow-1 min-h-0">
          <div className="col-12 col-xl-8 d-flex flex-column min-h-0">
            <div className="blog-master-editor-surface d-flex flex-column min-h-0">
              <div className={`tabs-nav-shell ${tabsNavState.hasOverflow ? 'is-overflow' : ''}`}>
                <button
                  type="button"
                  className="tab-nav-arrow tab-nav-arrow-left"
                  aria-label="Scroll tabs left"
                  onClick={() => scrollTabsBy(-1)}
                  disabled={!tabsNavState.showLeft}
                >
                  <FiChevronLeft size={16} />
                </button>
                <div className="tabs-nav-viewport">
                  <div
                    ref={tabsRef}
                  className="tabs_square line_tabs flex-shrink-0 mb-0 rounded-top"
                    onScroll={updateTabsOverflowState}
                  >
                    <ul className="line_tabs_list" role="tablist" aria-label="Blog form sections">
                      {BLOG_FORM_TABS.map((tab, index) => (
                        <li key={tab.label} className="line_tabs_items">
                          <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === index}
                            aria-controls={`blog-master-tab-${index}`}
                            id={`blog-master-tab-btn-${index}`}
                            className={`tabs_links ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  type="button"
                  className="tab-nav-arrow tab-nav-arrow-right"
                  aria-label="Scroll tabs right"
                  onClick={() => scrollTabsBy(1)}
                  disabled={!tabsNavState.showRight}
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
            <div
              className="blog-master-section-card border rounded-3 p-3 p-lg-4 mb-0 bg-white shadow-sm blog-master-tab-panel flex-grow-1 min-h-0 overflow-auto pt-3"
              role="tabpanel"
              id={`blog-master-tab-${activeTab}`}
              aria-labelledby={`blog-master-tab-btn-${activeTab}`}
            >
              <div className="blog-master-tab-content px-2 px-lg-3 pb-3">
                <BlogMasterFormTabPanels
                  activeTab={activeTab}
                  formData={formData}
                  errors={errors}
                  uploadingFields={uploadingFields}
                  onTrackTempAsset={onTrackTempAsset}
                  onFieldChange={onFieldChange}
                  onResetSlug={onResetSlug}
                  onUploadSingleImage={onUploadSingleImage}
                  onUploadGalleryImages={onUploadGalleryImages}
                  onRemoveGalleryImage={onRemoveGalleryImage}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <SectionCard title="Quick Preview" className="blog-master-preview-card">
              <div className="blog-preview-content">
                {formData.featuredImage && (
                  <img 
                    src={formData.featuredImage} 
                    alt={formData.imageAltText || formData.title || 'Featured'} 
                    className="img-fluid rounded mb-3" 
                    style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                {formData.title && (
                  <h3 className="h4 fw-bold mb-2">{formData.title}</h3>
                )}
                {formData.shortDescription && (
                  <p className="text-muted mb-3">{formData.shortDescription}</p>
                )}
                {formData.fullContent && (
                  <div 
                    className="blog-content-preview"
                    dangerouslySetInnerHTML={{ __html: formData.fullContent }}
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  />
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ModalRsuite
      open={open}
      onClose={onClose}
      size="full"
      className="blog-master-form-modal"
      backdrop="static"
      container={() => document.body}
      title={modalTitle}
      bodyClassName="blog-master-modal-body"
      body={modalBody}
      footer={
        <div className="d-flex gap-10">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {primaryLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      }
    />
  );
};

export default BlogRightSidebar;
