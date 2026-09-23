/**
 * `Package.features` is stored on the backend as a single free-text field.
 * The admin form writes one feature per line (see PackageCrud.jsx), but a
 * couple of public-facing components were still splitting on commas, so a
 * multi-line features list rendered as one long, comma-free sentence.
 *
 * This helper is tolerant of both separators so older data keeps working.
 */
export const parseFeatures = (features) => {
  if (!features) return [];
  const raw = Array.isArray(features) ? features.join('\n') : String(features);
  const separator = raw.includes('\n') ? '\n' : ',';
  return raw
    .split(separator)
    .map((f) => f.trim())
    .filter(Boolean);
};
