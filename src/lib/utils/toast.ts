import { toast } from 'sonner';

type ToastId = string | number;

function sanitizeMessage(message: string): string {
  if (!message) return message;
  return message.replace(/\s*Error Code\s*\([^)]+\)\s*$/i, '').replace(/\[INTERNAL_ERROR\]/i, '').replace(/INTERNAL_ERROR/i, '').trim();
}

export const showToast = (message: string, id?: ToastId) => {
  const m = sanitizeMessage(message);
  return m && toast(m, id === undefined ? undefined : { id });
};
export const showSuccess = (message: string, id?: ToastId) => {
  const m = sanitizeMessage(message);
  return m && toast.success(m, id === undefined ? undefined : { id });
};
export const showError = (message: string, id?: ToastId) => {
  const m = sanitizeMessage(message);
  return m && toast.error(m, { id: id ?? m });
};
export const showWarning = (message: string, id?: ToastId) => {
  const m = sanitizeMessage(message);
  return m && toast.warning(m, id === undefined ? undefined : { id });
};
export const showInfo = (message: string, id?: ToastId) => {
  const m = sanitizeMessage(message);
  return m && toast.info(m, id === undefined ? undefined : { id });
};
export const showLoading = (message: string) => toast.loading(message, { duration: Infinity });
export const showPromise = <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string },) => {
  const sanitize = (msg: string) => {
    if (!msg) return msg;
    return msg.replace(/\s*Error Code\s*\([^)]+\)\s*$/i, '').replace(/\[INTERNAL_ERROR\]/i, '').replace(/INTERNAL_ERROR/i, '').trim();
  };
  return toast.promise(promise, {
    loading: messages.loading,
    success: sanitize(messages.success),
    error: sanitize(messages.error),
  });
};
export const dismissToast = (id?: ToastId) => toast.dismiss(id);
