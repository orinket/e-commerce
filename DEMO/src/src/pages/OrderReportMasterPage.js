import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dropdown, Modal } from 'rsuite';
import { BiFilterAlt } from 'react-icons/bi';
import DrawerRsuite from '../components/DrawerRsuite';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import './OrderReportMasterPage.css';

function authHeaders(accept) {
  const headers = { Accept: accept || 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const REPORT_OPTIONS = [
  { value: 'full_orders', label: 'Full orders' },
  { value: 'orders_summary', label: 'Orders summary' },
  { value: 'order_line_items', label: 'Order line items' },
  { value: 'pending_failed_payments', label: 'Pending / failed payments' },
  { value: 'cod_prepaid_split', label: 'COD vs prepaid split' },
  { value: 'cancelled_refunded', label: 'Cancelled & refunded' },
];

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending (incl. processing)' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Arrived home' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'return_requested', label: 'Return requested' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' },
];

const DATE_PRESETS = [
  { id: 'all_time', label: 'All time (same as Order management)' },
  { id: 'current_month', label: 'Current month' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 days' },
  { id: 'weekly', label: 'This week' },
  { id: 'last_30_days', label: 'Last 30 days' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_year', label: 'Last year' },
  { id: 'custom', label: 'Custom' },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toYMD(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getPresetRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case 'all_time':
      return { from: '', to: '' };
    case 'today':
      return { from: toYMD(today), to: toYMD(today) };
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: toYMD(y), to: toYMD(y) };
    }
    case 'last_7_days': {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return { from: toYMD(s), to: toYMD(today) };
    }
    case 'weekly': {
      const d = new Date(today);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      return { from: toYMD(d), to: toYMD(today) };
    }
    case 'last_30_days': {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return { from: toYMD(s), to: toYMD(today) };
    }
    case 'last_month': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toYMD(first), to: toYMD(last) };
    }
    case 'current_month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toYMD(first), to: toYMD(today) };
    }
    case 'last_year': {
      const y = today.getFullYear() - 1;
      const first = new Date(y, 0, 1);
      const last = new Date(y, 11, 31);
      return { from: toYMD(first), to: toYMD(last) };
    }
    default:
      return { from: '', to: '' };
  }
}

function buildExportQueryParams(applied) {
  const qs = new URLSearchParams();
  qs.set('report', applied.reportType);
  if (applied.dateFrom) qs.set('dateFrom', applied.dateFrom);
  if (applied.dateTo) qs.set('dateTo', applied.dateTo);
  if (applied.orderStatus) qs.set('orderStatus', applied.orderStatus);
  if (applied.paymentStatus) qs.set('paymentStatus', applied.paymentStatus);
  if (applied.paymentMethod) qs.set('paymentMethod', applied.paymentMethod);
  if (applied.channel) qs.set('channel', applied.channel);
  if (applied.search.trim()) qs.set('q', applied.search.trim());
  return qs;
}

function buildSummaryQueryParams(applied) {
  const qs = new URLSearchParams();
  if (applied.dateFrom) qs.set('dateFrom', applied.dateFrom);
  if (applied.dateTo) qs.set('dateTo', applied.dateTo);
  if (applied.paymentStatus) qs.set('paymentStatus', applied.paymentStatus);
  if (applied.paymentMethod) qs.set('paymentMethod', applied.paymentMethod);
  if (applied.channel) qs.set('channel', applied.channel);
  if (applied.search.trim()) qs.set('q', applied.search.trim());
  return qs;
}

function buildOrdersQueryParams(applied, page, limit) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  qs.set('sort', 'createdAt');
  qs.set('order', 'desc');
  if (applied.dateFrom) qs.set('dateFrom', applied.dateFrom);
  if (applied.dateTo) qs.set('dateTo', applied.dateTo);
  if (applied.orderStatus) qs.set('orderStatus', applied.orderStatus);
  if (applied.paymentStatus) qs.set('paymentStatus', applied.paymentStatus);
  if (applied.paymentMethod) qs.set('paymentMethod', applied.paymentMethod);
  if (applied.channel) qs.set('channel', applied.channel);
  if (applied.search.trim()) qs.set('q', applied.search.trim());
  return qs;
}

/** Clear text (avoid em dash — mistaken for minus) */
function na(v) {
  if (v == null || v === '') return 'N/A';
  const s = String(v).trim();
  return s || 'N/A';
}

function formatInr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(x);
}

function displayStatus(row) {
  const raw = row.displayStatus || row.orderStatus || '';
  const canon = String(raw).toLowerCase();
  if (canon === 'delivered') return 'Arrived home';
  return String(raw).replace(/_/g, ' ') || 'N/A';
}

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('deliver') || s.includes('arrived home')) return 'bg-success-subtle text-success';
  if (s.includes('cancel') || s.includes('refund') || s.includes('return')) return 'bg-danger-subtle text-danger';
  if (s.includes('ship') || s.includes('pack')) return 'bg-primary-subtle text-primary';
  if (s.includes('pending') || s.includes('confirm')) return 'bg-warning-subtle text-dark';
  return 'bg-secondary-subtle text-secondary';
}

function seriesHasTrend(values) {
  return Array.isArray(values) && values.some((n) => Number(n) !== 0);
}

function MiniSparkline({ values, color, height = 44 }) {
  const v = values?.length ? values : [0];
  const max = Math.max(...v, 1);
  const min = Math.min(...v, 0);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const step = v.length > 1 ? w / (v.length - 1) : w;
  const pts = v
    .map((val, i) => {
      const x = i * step;
      const y = h - 3 - ((val - min) / range) * (h - 6);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="ork-sparkline" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function OrderRowsTable({ rows, showViewLink }) {
  return (
    <table className="table table-hover align-middle mb-0 ork-data-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th className="text-end">Amount</th>
          <th>Payment</th>
          <th>Pay status</th>
          <th>Status</th>
          <th>Date</th>
          {showViewLink ? <th className="text-end"> </th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const id = row._id;
          const ship = row.shippingAddress || {};
          const name = na(ship.name || row.user?.name);
          const created = row.createdAt
            ? new Date(row.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
            : 'N/A';
          const payM = row.paymentMethod ? String(row.paymentMethod) : '';
          const payS = row.paymentStatus ? String(row.paymentStatus) : '';
          return (
            <tr key={String(id)}>
              <td className="fw-semibold text-nowrap">{row.orderNumber ? row.orderNumber : String(id).slice(-8)}</td>
              <td>{name}</td>
              <td className="text-end fw-medium">{formatInr(row.totalAmount)}</td>
              <td className="text-capitalize">{payM || 'N/A'}</td>
              <td className="text-capitalize">{payS || 'N/A'}</td>
              <td>
                <span className={`ork-badge ${statusBadgeClass(displayStatus(row))}`}>{displayStatus(row)}</span>
              </td>
              <td className="text-nowrap small text-secondary">{created}</td>
              {showViewLink ? (
                <td className="text-end">
                  <Link to={`/order-management/detail/${id}`} className="btn btn-sm btn-link text-decoration-none">
                    View
                  </Link>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const OrderReportMasterPage = () => {
  const [applied, setApplied] = useState(() => ({
    reportType: 'orders_summary',
    dateFrom: '',
    dateTo: '',
    datePreset: 'all_time',
    orderStatus: '',
    paymentStatus: '',
    paymentMethod: '',
    channel: '',
    search: '',
  }));

  const [draft, setDraft] = useState(() => ({ ...applied, search: applied.search }));
  const [filterOpen, setFilterOpen] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  const [headerSearch, setHeaderSearch] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfPreviewRows, setPdfPreviewRows] = useState([]);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

  useEffect(() => {
    setHeaderSearch(applied.search);
  }, [applied.search]);

  const openFilters = () => {
    setDraft({
      ...applied,
      datePreset: applied.datePreset || 'all_time',
    });
    setFilterOpen(true);
  };

  const setDraftPreset = (presetId) => {
    setDraft((prev) => {
      if (presetId === 'custom') {
        return { ...prev, datePreset: 'custom' };
      }
      const { from, to } = getPresetRange(presetId);
      return { ...prev, datePreset: presetId, dateFrom: from, dateTo: to };
    });
  };

  const applyFilters = () => {
    setApplied({ ...draft });
    setFilterOpen(false);
    setPage(1);
  };

  const cancelFilters = () => {
    setDraft({
      ...applied,
      datePreset: applied.datePreset || 'all_time',
    });
    setFilterOpen(false);
  };

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const qs = buildSummaryQueryParams(applied);
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/reports/summary?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && json.data) {
        setSummary(json.data);
      } else {
        setSummary(null);
        toast.error(json?.message || 'Could not load summary');
      }
    } catch (_e) {
      setSummary(null);
      toast.error('Could not load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [applied]);

  const fetchOrders = useCallback(async () => {
    setTableLoading(true);
    try {
      const qs = buildOrdersQueryParams(applied, page, pageSize);
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
        setTotal(Number(json.total || 0));
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch (_e) {
      setRows([]);
      setTotal(0);
    } finally {
      setTableLoading(false);
    }
  }, [applied, page]);

  const fetchPdfPreview = useCallback(async () => {
    setPdfPreviewLoading(true);
    try {
      const qs = buildOrdersQueryParams(applied, 1, 50);
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      setPdfPreviewRows(Array.isArray(json?.data) ? json.data : []);
    } catch (_e) {
      setPdfPreviewRows([]);
    } finally {
      setPdfPreviewLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (pdfModalOpen) fetchPdfPreview();
  }, [pdfModalOpen, fetchPdfPreview]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      fetchSummary();
      fetchOrders();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchSummary, fetchOrders]);

  const download = useCallback(
    async (format) => {
      setDownloading(format);
      try {
        const qs = buildExportQueryParams(applied);
        qs.set('format', format);
        const accept =
          format === 'csv'
            ? 'text/csv'
            : format === 'xlsx'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/pdf';
        const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/reports/export?${qs.toString()}`, {
          credentials: 'include',
          headers: authHeaders(accept),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err?.message || 'Download failed');
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
        a.download = `${applied.reportType}-${new Date().toISOString().slice(0, 10)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        toast.success('Download started');
      } catch (_e) {
        toast.error('Download failed');
      } finally {
        setDownloading(null);
      }
    },
    [applied]
  );

  const confirmPdfDownload = async () => {
    await download('pdf');
    setPdfModalOpen(false);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const commitHeaderSearch = () => {
    setApplied((prev) => ({ ...prev, search: headerSearch.trim() }));
    setPage(1);
  };

  const kpiLoading = summaryLoading;

  return (
    <div className="ork-report-page master-view d-flex flex-column h-100 min-h-0">
      <div className="d-flex flex-column flex-xl-row align-items-xl-start justify-content-xl-between gap-3 pb-3">
        <div className="flex-grow-1 min-w-0">
          <nav className="ork-report-breadcrumb" aria-label="Breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span className="px-1">/</span>
            <span>Report</span>
            <span className="px-1">/</span>
            <span className="text-dark fw-medium">Order report</span>
          </nav>
          <h1 className="ork-report-title mb-0">Order report</h1>
        </div>
        <div className="ork-header-actions d-flex flex-wrap align-items-center gap-2 justify-content-xl-end">
          <select
            className="form-select form-select-sm ork-header-report-select"
            value={applied.reportType}
            onChange={(e) => setApplied((p) => ({ ...p, reportType: e.target.value }))}
            aria-label="Report type"
          >
            {REPORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="search"
            className="form-control form-control-sm ork-header-search"
            placeholder="Search… Enter"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitHeaderSearch();
            }}
          />
          <Dropdown
            title={downloading ? '…' : 'Download'}
            disabled={!!downloading}
            placement="bottomEnd"
            toggleClassName="btn btn-primary btn-sm"
          >
            <Dropdown.Item
              onSelect={() => {
                setPdfModalOpen(true);
              }}
              disabled={!!downloading}
            >
              Download PDF…
            </Dropdown.Item>
            <Dropdown.Item onSelect={() => download('xlsx')} disabled={!!downloading}>
              Download Excel
            </Dropdown.Item>
            <Dropdown.Item onSelect={() => download('csv')} disabled={!!downloading}>
              Download CSV
            </Dropdown.Item>
          </Dropdown>
          <Link to="/order-management" className="btn btn-outline-secondary btn-sm text-nowrap">
            Order management
          </Link>
          <button
            type="button"
            className="btn btn-primary py-4p px-9p d-flex align-items-center flex-shrink-0 h-38p shadow-sm"
            onClick={openFilters}
            aria-label="Open filters"
            title="Filters"
          >
            <BiFilterAlt className="text-white text-20" />
          </button>
        </div>
      </div>

      <div className="ork-kpi-grid">
        <div className="ork-kpi-card ork-kpi-card--profit">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon" aria-hidden>
              ↑
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Total profit</div>
              <div className="ork-kpi-value">{kpiLoading ? '…' : formatInr(summary?.totalProfit ?? 0)}</div>
            </div>
            {!kpiLoading && seriesHasTrend(summary?.profitSeries) ? (
              <MiniSparkline values={summary?.profitSeries} color="#16a34a" />
            ) : null}
          </div>
        </div>

        <div className="ork-kpi-card ork-kpi-card--loss">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon ork-kpi-icon--loss" aria-hidden>
              ↓
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Total loss</div>
              <div className="ork-kpi-value">{kpiLoading ? '…' : formatInr(summary?.totalLoss ?? 0)}</div>
            </div>
            {!kpiLoading && seriesHasTrend(summary?.lossSeries) ? (
              <MiniSparkline values={summary?.lossSeries} color="#dc2626" />
            ) : null}
          </div>
        </div>

        <div className="ork-kpi-card ork-kpi-card--gross">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon" aria-hidden>
              Σ
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Gross sales</div>
              <div className="ork-kpi-value">{kpiLoading ? '…' : formatInr(summary?.grossSales ?? 0)}</div>
            </div>
          </div>
        </div>

        <div className="ork-kpi-card ork-kpi-card--pending">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon" aria-hidden>
              ⏳
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Pending payment</div>
              <div className="ork-kpi-value">{kpiLoading ? '…' : formatInr(summary?.pendingPaymentTotal ?? 0)}</div>
            </div>
          </div>
        </div>

        <div className="ork-kpi-card ork-kpi-card--avg">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon" aria-hidden>
              ÷
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Avg order value</div>
              <div className="ork-kpi-value">{kpiLoading ? '…' : formatInr(summary?.avgOrderValue ?? 0)}</div>
            </div>
          </div>
        </div>

        <div className="ork-kpi-card ork-kpi-card--split">
          <div className="ork-kpi-card-inner">
            <div className="ork-kpi-icon" aria-hidden>
              %
            </div>
            <div className="ork-kpi-body">
              <div className="ork-kpi-label">Payment mix</div>
              <div className="ork-kpi-value ork-kpi-value--sm">
                {kpiLoading ? '…' : `COD ${summary?.codOrderCount ?? 0} · Online ${summary?.onlineOrderCount ?? 0}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ork-report-panel">
        <div className="ork-table-wrap">
          {tableLoading ? (
            <div className="text-center py-5 text-secondary">Loading orders…</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-5 text-secondary">No orders for these filters.</div>
          ) : (
            <OrderRowsTable rows={rows} showViewLink />
          )}
        </div>

        <div className="ork-pagination-bar">
          <span>
            {total ? (
              <>
                Page {page} of {totalPages} — {total} orders
              </>
            ) : (
              'No data'
            )}
          </span>
          <div className="d-flex gap-1">
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal open={pdfModalOpen} onClose={() => setPdfModalOpen(false)} size="lg" className="ork-pdf-modal">
        <Modal.Header>
          <Modal.Title>Download PDF — preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary mb-2">
            Preview shows up to 50 orders with the same filters as the table. The downloaded PDF uses your selected report type and may include up to 500 rows.
          </p>
          <div className="ork-pdf-preview-wrap border rounded-3 overflow-auto">
            {pdfPreviewLoading ? (
              <div className="p-5 text-center text-secondary">Loading preview…</div>
            ) : pdfPreviewRows.length === 0 ? (
              <div className="p-5 text-center text-secondary">No rows to preview.</div>
            ) : (
              <OrderRowsTable rows={pdfPreviewRows} showViewLink={false} />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={() => setPdfModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!!downloading} onClick={confirmPdfDownload}>
            {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
          </button>
        </Modal.Footer>
      </Modal>

      <DrawerRsuite
        title="Filter Order report"
        modalname="orderreportfilter"
        open={filterOpen}
        onClose={cancelFilters}
        placement="right"
        size="xs"
        className="ork-order-report-filter-drawer"
        bodyClassName="ork-order-report-filter-body"
        body={
          <form className="d-flex flex-column h-100 p-3" onSubmit={(e) => e.preventDefault()}>
            <div
              className="border rounded-3 bg-white mb-3"
              style={{
                padding: '12px 12px 8px',
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="row gap-10">
                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Date range</label>
                    <select
                      className="form-select w-100"
                      value={draft.datePreset}
                      onChange={(e) => setDraftPreset(e.target.value)}
                    >
                      {DATE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {draft.datePreset === 'custom' ? (
                  <>
                    <div className="col-12">
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">Start date</label>
                        <input
                          type="date"
                          className="form-control w-100"
                          value={draft.dateFrom}
                          onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">End date</label>
                        <input
                          type="date"
                          className="form-control w-100"
                          value={draft.dateTo}
                          onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-12">
                    <p className="small text-secondary mb-0 text-break">
                      <span className="text-dark fw-medium">From</span> {draft.dateFrom || 'N/A'}{' '}
                      <span className="text-dark fw-medium ms-2">To</span> {draft.dateTo || 'N/A'}
                    </p>
                  </div>
                )}

                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Order status</label>
                    <select
                      className="form-select w-100"
                      value={draft.orderStatus}
                      onChange={(e) => setDraft((d) => ({ ...d, orderStatus: e.target.value }))}
                    >
                      {ORDER_STATUS_OPTIONS.map((o) => (
                        <option key={o.value || 'all'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Payment status</label>
                    <select
                      className="form-select w-100"
                      value={draft.paymentStatus}
                      onChange={(e) => setDraft((d) => ({ ...d, paymentStatus: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Payment mode</label>
                    <select
                      className="form-select w-100"
                      value={draft.paymentMethod}
                      onChange={(e) => setDraft((d) => ({ ...d, paymentMethod: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="cod">COD</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Channel</label>
                    <select
                      className="form-select w-100"
                      value={draft.channel}
                      onChange={(e) => setDraft((d) => ({ ...d, channel: e.target.value }))}
                    >
                      <option value="">All</option>
                      <option value="registered">Registered</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-column row-gap-1">
                    <label className="label-form-control">Search</label>
                    <input
                      type="search"
                      className="form-control w-100"
                      placeholder="Order no., phone, email…"
                      value={draft.search}
                      onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end flex-shrink-0">
              <button type="button" className="btn btn-primary" onClick={applyFilters}>
                Apply
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelFilters}>
                Close
              </button>
            </div>
          </form>
        }
      />
    </div>
  );
};

export default OrderReportMasterPage;
