import { toast } from 'sonner';

type ToastId = string | number;

export const showToast = (message: string, id?: ToastId) => message && toast(message, id === undefined ? undefined : { id });
export const showSuccess = (message: string, id?: ToastId) => message && toast.success(message, id === undefined ? undefined : { id });
export const showError = (message: string, id?: ToastId) => message && toast.error(message, { id: id ?? message });
export const showWarning = (message: string, id?: ToastId) => message && toast.warning(message, id === undefined ? undefined : { id });
export const showInfo = (message: string, id?: ToastId) => message && toast.info(message, id === undefined ? undefined : { id });
export const showLoading = (message: string) => toast.loading(message, { duration: Infinity });
export const showPromise = <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string },) => toast.promise(promise, messages);
export const dismissToast = (id?: ToastId) => toast.dismiss(id);
