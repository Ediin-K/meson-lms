import axiosInstance from './axiosInstance';

const BASE = (axiosInstance.defaults.baseURL || 'http://localhost:8080/api').replace(/\/$/, '');

/** Direct URL to serve the file inline (view in browser). Public endpoint — no auth needed. */
export function getViewUrl(resourceId) {
  return `${BASE}/resources/${resourceId}/view`;
}

/** Direct URL to force-download the file. Public endpoint — no auth needed. */
export function getDownloadUrl(resourceId) {
  return `${BASE}/resources/${resourceId}/download`;
}

/**
 * Open a file in a new browser tab (PDF, image, video, etc.).
 * Uses a direct link — no blob, no pop-up blocker issues.
 */
export function openResourcePreview(resource) {
  const id = resource?.id;
  if (!id) return;
  window.open(getViewUrl(id), '_blank', 'noopener,noreferrer');
}

/**
 * Trigger a browser download for any resource.
 * Creates a hidden <a> with the download URL and clicks it.
 */
export function downloadResource(resource) {
  const id = resource?.id;
  if (!id) return;
  const a = document.createElement('a');
  a.href = getDownloadUrl(id);
  a.download = resource.emriOrigjinal || 'material';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Full absolute URL — kept for backward compatibility with CourseDetail. */
export function getExternalResourceUrl(resource, mode = 'view') {
  const id = resource?.id;
  if (!id) return '';
  return mode === 'view' ? getViewUrl(id) : getDownloadUrl(id);
}
