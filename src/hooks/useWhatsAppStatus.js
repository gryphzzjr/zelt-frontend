import { useState, useEffect, useCallback } from 'react';
import { evolutionApi } from '../lib/api';

export function useWhatsAppStatus(workspaceId) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState([]);

  const check = useCallback(async () => {
    try {
      setLoading(true);
      const res = await evolutionApi.listInstances(workspaceId);
      const raw = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.instances) ? res.instances
        : [];
      const data = raw.map(item => {
        const inst = item?.instance || item;
        return {
          instanceName: inst.instanceName || inst.name || item?.instanceName || item?.name || 'unknown',
          status: inst.status || inst.connectionStatus?.state || inst.connectionStatus || item?.status || 'close',
        };
      });
      setInstances(data);
      setConnected(data.some(i => i.status === 'open'));
    } catch {
      setConnected(false);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { check(); }, [check]);

  return { connected, loading, instances, refresh: check };
}
