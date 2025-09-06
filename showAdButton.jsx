import { useCallback, ReactElement } from 'react'
import { useAdsgram } from "./hooks/useAdsgram.ts";


export function ShowAdButton() {
  const onReward = useCallback(() => {
    alert('Reward');
  }, []);
  const onError = useCallback((result) => {
    alert(JSON.stringify(result, null, 4));
  }, []);

  /**
   * insert your-block-id
   */
  const showAd = useAdsgram({ blockId: "your-block-id", onReward, onError });

  return (
    <button onClick={showAd}>Show Ad</button>
  )
}
