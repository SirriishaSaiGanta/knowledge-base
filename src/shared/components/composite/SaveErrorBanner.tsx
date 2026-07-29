import { useSyncExternalStore } from 'react';
import { saveErrorStore } from '@data/saveErrorStore';

/** Fixed-position stack of dismissible banners for save failures — mounted once near the app root
 *  so a failed write is impossible to miss, wherever in the app it happened. */
export function SaveErrorBanner() {
  const errors = useSyncExternalStore(saveErrorStore.subscribe, saveErrorStore.getAll);

  if (errors.length === 0) return null;

  return (
    <div className="save-error-stack" role="alert">
      {errors.map((error) => (
        <div key={error.id} className="save-error-banner">
          <span aria-hidden="true">⚠️</span>
          <p>{error.message}</p>
          <button
            type="button"
            className="save-error-dismiss"
            onClick={() => saveErrorStore.dismiss(error.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
