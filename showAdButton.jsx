import { useCallback } from 'react'
import { useAdsgram } from "../hooks/useAdsgram"

export function ShowAdButton() {
  const onReward = useCallback(() => {
    alert('Reward');
  }, []);

  const onError = useCallback((result) => {
    alert(JSON.stringify(result, null, 4));
  }, []);

  const showAd = useAdsgram({
    blockId: "14637", // ✅ replace with your Adsgram blockId
    onReward,
    onError
  });

  return (
    <button onClick={showAd}>Show Ad</button>
  )
}
