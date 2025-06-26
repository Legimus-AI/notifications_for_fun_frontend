export interface ToastOptions {
  title?: string;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  autoHideDelay?: number;
  solid?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  title?: string;
  variant: string;
  autoHideDelay: number;
  solid: boolean;
  visible: boolean;
}
