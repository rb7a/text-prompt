<template>
    <Teleport to="body">
        <Transition name="toast" appear>
            <div v-if="show" class="toast-container" :class="typeClass">
                <div class="toast-content">
                    <div class="toast-icon">{{ iconMap[type] }}</div>
                    <div class="toast-message">
                        <div class="toast-title">{{ title }}</div>
                        <div v-if="message" class="toast-text">{{ message }}</div>
                    </div>
                    <button @click="close" class="toast-close">✕</button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

interface Props {
    show: boolean
    type?: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    autoClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    duration: 5000,
    autoClose: true
})

const emit = defineEmits<{
    close: []
}>()

const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
}

const typeClass = computed(() => `toast-${props.type}`)

const close = () => {
    emit('close')
}

onMounted(() => {
    if (props.autoClose && props.duration > 0) {
        setTimeout(() => {
            close()
        }, props.duration)
    }
})
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    min-width: 300px;
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
}

.toast-success .toast-content {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.toast-error .toast-content {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.toast-warning .toast-content {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.toast-info .toast-content {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
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

/* 动画效果 */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
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
