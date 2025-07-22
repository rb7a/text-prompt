import { ref, reactive } from 'vue'

interface ToastItem {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    autoClose?: boolean
}

const toasts = ref<ToastItem[]>([])

let toastId = 0

export function useToast() {
    const showToast = (options: Omit<ToastItem, 'id'>) => {
        const id = `toast-${++toastId}`
        const toast: ToastItem = {
            id,
            duration: 5000,
            autoClose: true,
            ...options
        }

        toasts.value.push(toast)

        if (toast.autoClose && toast.duration && toast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, toast.duration)
        }

        return id
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(toast => toast.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (title: string, message?: string, duration: number = 3000) => {
        return showToast({ type: 'success', title, message, duration })
    }

    const error = (title: string, message?: string, duration: number = 8000) => {
        return showToast({ type: 'error', title, message, duration, autoClose: true })
    }

    const warning = (title: string, message?: string, duration: number = 5000) => {
        return showToast({ type: 'warning', title, message, duration })
    }

    const info = (title: string, message?: string, duration: number = 4000) => {
        return showToast({ type: 'info', title, message, duration })
    }

    const clear = () => {
        toasts.value = []
    }

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
        clear
    }
}
