import { useEffect, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

function deriveStatus(state: NetInfoState): NetworkStatus {
  const isConnected = state.isConnected ?? false;
  const isInternetReachable = state.isInternetReachable;

  const isOffline =
    !isConnected ||
    (isInternetReachable != null && !isInternetReachable);

  return { isConnected, isInternetReachable, isOffline };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    isOffline: false,
  });

  useEffect(() => {
    let mounted = true;

    const applyState = (state: NetInfoState) => {
      if (mounted) {
        setStatus(deriveStatus(state));
      }
    };

    const unsubscribe = NetInfo.addEventListener(applyState);

    void NetInfo.fetch().then(applyState);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return status;
}
