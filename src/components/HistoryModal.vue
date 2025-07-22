<template>
    <div class="modal-overlay" v-if="show" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>📚 历史记录</h3>
                <button @click="closeModal" class="close-btn">✕</button>
            </div>

            <div class="modal-body">
                <div v-if="history.length === 0" class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p class="empty-text">暂无历史记录</p>
                    <p class="empty-hint">开始生成提示词后，历史记录将显示在这里</p>
                </div>

                <div v-else class="history-list">
                    <div v-for="(item, index) in history" :key="index" class="history-item" @click="selectHistory(item)">
                        <div class="history-content">
                            <div class="history-text">{{ item.original }}</div>
                            <div class="history-meta">
                                <span class="history-date">{{ formatDate(item.timestamp) }}</span>
                                <button @click.stop="deleteHistory(index)" class="delete-btn" title="删除此记录">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="clearAllHistory" class="clear-all-btn" :disabled="history.length === 0">清空所有记录</button>
                <div class="button-group">
                    <button @click="closeModal" class="cancel-btn">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface HistoryItem {
    original: string
    enhanced: string
    timestamp: number
}

const props = defineProps<{
    show: boolean
    history: HistoryItem[]
}>()

const emit = defineEmits<{
    close: []
    select: [item: HistoryItem]
    delete: [index: number]
    clearAll: []
}>()

const closeModal = () => {
    emit('close')
}

const selectHistory = (item: HistoryItem) => {
    emit('select', item)
    closeModal()
}

const deleteHistory = (index: number) => {
    emit('delete', index)
}

const clearAllHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
        emit('clearAll')
    }
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    } else if (diffDays === 1) {
        return (
            '昨天 ' +
            date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            })
        )
    } else if (diffDays < 7) {
        return `${diffDays}天前`
    } else {
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: #fafafa;
    flex-shrink: 0;
}

.modal-header h3 {
    margin: 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #374151;
    transform: scale(1.1);
}

.modal-body {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.modal-body::-webkit-scrollbar {
    display: none;
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.empty-hint {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.5;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.history-list::-webkit-scrollbar {
    display: none;
}

.history-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.history-item:hover {
    background: #f3f4f6;
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.history-content {
    width: 100%;
}

.history-text {
    font-size: 0.95rem;
    color: #374151;
    line-height: 1.5;
    margin-bottom: 0.75rem;
    word-break: break-word;
}

.history-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.history-date {
    font-size: 0.8rem;
    color: #6b7280;
}

.delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    opacity: 0.6;
    font-size: 0.875rem;
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    opacity: 1;
    transform: scale(1.1);
}

.modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
    flex-shrink: 0;
}

.button-group {
    display: flex;
    gap: 0.75rem;
}

.clear-all-btn {
    background: #f8f9fa;
    color: #dc3545;
    border: 1px solid #dc3545;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.clear-all-btn:hover:not(:disabled) {
    background: #dc3545;
    color: white;
    transform: translateY(-1px);
}

.clear-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #6c757d;
    border-color: #dee2e6;
}

.cancel-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.cancel-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
