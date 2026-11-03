import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type {
  OrderDetailData,
  OrderNoteData,
  OrderTagData,
  DeliveryBoyData,
} from '@/lib/api/contract';
import { toOrderDetail } from '@/types/order';

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetailData>(toOrderDetail());
  const [notes, setNotes] = useState<OrderNoteData[]>([]);
  const [tags, setTags] = useState<OrderTagData[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const load = useCallback(async () => {
    const response = await apiService.getOrderDetails(orderId);
    setError(response.status ? '' : response.message);
    if (response.status) setOrder(response.data);
    setIsLoading(false);
  }, [orderId]);

  const fetchNotes = useCallback(async () => {
    const response = await apiService.getOrderNotes(orderId, {});
    if (response.status) setNotes(response.data.itemList);
  }, [orderId]);

  const fetchTags = useCallback(async () => {
    const response = await apiService.getOrderTags(orderId, {});
    if (response.status) setTags(response.data.itemList);
  }, [orderId]);

  const fetchDeliveryBoys = useCallback(async () => {
    const response = await apiService.getDeliveryBoys({});
    if (response.status) setDeliveryBoys(response.data.itemList);
  }, []);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      const response = await apiService.getOrderDetails(orderId);
      if (!active) return;
      setError(response.status ? '' : response.message);
      if (response.status) setOrder(response.data);
      setIsLoading(false);
      await fetchNotes();
      await fetchTags();
      await fetchDeliveryBoys();
    };
    void loadAll();
    return () => {
      active = false;
    };
  }, [orderId, fetchNotes, fetchTags, fetchDeliveryBoys]);

  const updateStatus = useCallback(
    async (values: { status: string; remark?: string; location?: string }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateOrderStatus(orderId, {
        status: values.status,
        ...(values.remark ? { remark: values.remark } : {}),
        ...(values.location ? { location: values.location } : {}),
      });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load, orderId],
  );

  const addNote = useCallback(
    async (note: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.addOrderNote(orderId, { note });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await fetchNotes();
      return true;
    },
    [orderId, fetchNotes],
  );

  const removeNote = useCallback(
    async (noteId: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.removeOrderNote(orderId, noteId);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await fetchNotes();
      return true;
    },
    [orderId, fetchNotes],
  );

  const addTag = useCallback(
    async (tagName: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.addOrderTags(orderId, { name: tagName });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await fetchTags();
      return true;
    },
    [orderId, fetchTags],
  );

  const removeTag = useCallback(
    async (tagId: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.removeOrderTag(orderId, tagId);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await fetchTags();
      return true;
    },
    [orderId, fetchTags],
  );

  const assignDeliveryBoy = useCallback(
    async (subOrderId: string, deliveryBoyId: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.assignDeliveryBoy(subOrderId, {
        deliveryBoyId,
      });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return {
    order,
    notes,
    tags,
    deliveryBoys,
    isLoading,
    error,
    actionError,
    isActioning,
    updateStatus,
    addNote,
    removeNote,
    addTag,
    removeTag,
    assignDeliveryBoy,
    retry,
  };
}
