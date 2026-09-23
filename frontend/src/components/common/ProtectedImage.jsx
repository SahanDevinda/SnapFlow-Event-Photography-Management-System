import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api';

const buildPhotoUrl = (photoId, accessCode) =>
  accessCode
    ? `/galleries/public/${encodeURIComponent(accessCode)}/photos/${photoId}/stream`
    : `/galleries/photos/${photoId}/stream`;

/**
 * Renders an image served by a secured backend endpoint.
 *
 * A browser <img src="..."> cannot attach the Bearer token, so the bytes are
 * fetched as a blob and rendered from an object URL. Pass either `photoId`
 * (gallery photos) or a raw `url` (e.g. a payment receipt).
 */
export const ProtectedImage = ({
  photoId,
  url,
  accessCode,
  alt = '',
  className = '',
  ...props
}) => {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  const target = url || (photoId ? buildPhotoUrl(photoId, accessCode) : null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    if (!target) {
      setFailed(true);
      return undefined;
    }

    setSrc(null);
    setFailed(false);

    api
      .get(target, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [target]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-navy-100 text-navy-400 ${className}`}>
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-navy-50 text-navy-300 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} {...props} />;
};

/**
 * Opens a secured file (receipt, export) in a new tab. A plain <a href> would
 * hit the endpoint without the Authorization header and get a 401.
 */
export const ProtectedFileLink = ({ url, children, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const open = async () => {
    try {
      setLoading(true);
      const res = await api.get(url, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(res.data);
      window.open(objectUrl, '_blank', 'noopener');
      // Give the new tab time to load before releasing the blob.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      /* the caller's UI already shows an inline fallback */
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={loading} className={className}>
      {loading ? 'Opening…' : children}
    </button>
  );
};

export const photoStreamUrl = (photoId, accessCode) =>
  `${API_BASE_URL}${buildPhotoUrl(photoId, accessCode)}`;

export default ProtectedImage;
