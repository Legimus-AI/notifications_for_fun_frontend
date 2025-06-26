import { ref } from "vue";
import type { ToastOptions, Toast } from "@/types/toast";

const toasts = ref<Toast[]>([]);
let toastCounter = 0;

export function useToast() {
  const showToast = (message: string, options: ToastOptions = {}) => {
    const toast: Toast = {
      id: `toast-${++toastCounter}`,
      message,
      title: options.title,
      variant: options.variant || "primary",
      autoHideDelay: options.autoHideDelay || 5000,
      solid: options.solid !== false,
      visible: true,
    };

    toasts.value.push(toast);

    // Auto-hide toast
    setTimeout(() => {
      hideToast(toast.id);
    }, toast.autoHideDelay);

    return toast.id;
  };

  const hideToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index].visible = false;
      // Remove from array after animation
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex((t) => t.id === id);
        if (currentIndex !== -1) {
          toasts.value.splice(currentIndex, 1);
        }
      }, 300);
    }
  };

  const success = (message: string, title?: string) => {
    return showToast(message, { variant: "success", title });
  };

  const error = (message: string, title?: string) => {
    return showToast(message, { variant: "danger", title });
  };

  const warning = (message: string, title?: string) => {
    return showToast(message, { variant: "warning", title });
  };

  const info = (message: string, title?: string) => {
    return showToast(message, { variant: "info", title });
  };

  const clearAll = () => {
    toasts.value = [];
  };

  return {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
