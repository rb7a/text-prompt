<template>
    <Teleport to="body">
        <div class="toast-container">
            <TransitionGroup name="toast-list" tag="div">
                <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="`toast-${toast.type}`">
                    <div class="toast-content">
                        <div class="toast-icon">{{ getIcon(toast.type) }}</div>
                        <div class="toast-message">
                            <div class="toast-title">{{ toast.title }}</div>
                            <div v-if="toast.message" class="toast-text">{{ toast.message }}</div>
                        </div>
                        <button @click="removeToast(toast.id)" class="toast-close">✕</button>
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }
    return iconMap[type as keyof typeof iconMap] || 'ℹ️'
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
    min-width: 300px;
}

.toast-item {
    transform-origin: right top;
}

.toast-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    border-left: 4px solid;
    backdrop-filter: blur(10px);
}

.toast-success .toast-content {
    border-left-color: #10b981;
    background: linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(236, 253, 245, 0.95) 100%);
}

.toast-error .toast-content {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 226, 226, 0.95) 100%);
}

.toast-warning .toast-content {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 243, 199, 0.95) 100%);
}

.toast-info .toast-content {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(219, 234, 254, 0.95) 100%);
}

.toast-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.toast-message {
    flex: 1;
    min-width: 0;
}

.toast-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.toast-text {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.4;
    word-wrap: break-word;
}

.toast-close {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    font-size: 0.875rem;
}

.toast-close:hover {
    color: #6b7280;
    background: rgba(0, 0, 0, 0.05);
}

/* 列表动画 */
.toast-list-enter-active,
.toast-list-leave-active {
    transition: all 0.3s ease;
}

.toast-list-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.toast-list-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.toast-list-move {
    transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .toast-container {
        left: 10px;
        right: 10px;
        max-width: none;
        min-width: auto;
    }
}
</style>
