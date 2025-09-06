import { useCallback, useEffect, useRef } from 'react';

export function useAdsgram({ blockId, onReward, onError }) {
  const AdControllerRef = useRef(undefined);

  useEffect(() => {
    AdControllerRef.current = window.Adsgram?.init({ blockId });
  }, [blockId]);

  return useCallback(async () => {
    if (AdControllerRef.current) {
      AdControllerRef.current
        .show()
        .then(() => {
          // user watch ad till the end or close it in interstitial format
          onReward();
        })
        .catch((result) => {
          // user get error during playing ad
          onError?.(result);
        });
    } else {
      onError?.({
        error: true,
        done: false,
        state: 'load',
        description: 'Adsgram script not loaded',
      });
    }
  }, [onError, onReward]);
}
