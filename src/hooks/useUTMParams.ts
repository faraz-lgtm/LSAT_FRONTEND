import { useEffect, useState } from 'react';
import { getCurrentUTMParams, type UTMParams } from '@/utils/utmTracker';

export function useUTMParams(): UTMParams {
  const [utmParams, setUtmParams] = useState<UTMParams>({});

  useEffect(() => {
    // Get UTM params on mount and when URL changes
    const params = getCurrentUTMParams();
    setUtmParams(params);
  }, []);

  return utmParams;
}
