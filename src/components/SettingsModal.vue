<template>
    <div class="modal-overlay" v-if="show" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>⚙️ 设置</h3>
                <button @click="closeModal" class="close-btn">✕</button>
            </div>

            <div class="modal-body">
                <div class="setting-group">
                    <label>API 配置</label>
                    <div class="input-group">
                        <label for="api-endpoint">API 端点</label>
                        <input id="api-endpoint" v-model="localSettings.endpoint" type="text" placeholder="https://open.bigmodel.cn/api/paas/v4/chat/completions" />
                    </div>
                    <div class="input-group">
                        <label for="api-model">模型</label>
                        <input id="api-model" v-model="localSettings.model" type="text" placeholder="GLM-4.1V-Thinking-Flash" />
                    </div>
                    <div class="input-group">
                        <label for="api-key-setting">API Key</label>
                        <input id="api-key-setting" v-model="localSettings.apiKey" type="password" placeholder="输入你的智谱AI API Key" />
                    </div>
                </div>

                <div class="setting-group">
                    <label>界面设置</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="localSettings.autoSave" />
                            自动保存历史记录
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="localSettings.showPreview" />
                            默认显示预览模式
                        </label>
                    </div>
                </div>

                <div class="setting-group">
                    <label>高级选项</label>
                    <div class="input-group">
                        <label for="max-history">最大历史记录数</label>
                        <input id="max-history" v-model.number="localSettings.maxHistory" type="number" min="5" max="100" />
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="resetSettings" class="reset-btn">重置默认</button>
                <div class="button-group">
                    <button @click="closeModal" class="cancel-btn">取消</button>
                    <button @click="saveSettings" class="save-btn">保存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Settings {
    endpoint: string
    model: string
    apiKey: string
    autoSave: boolean
    showPreview: boolean
    maxHistory: number
}

const props = defineProps<{
    show: boolean
    settings: Settings
}>()

const emit = defineEmits<{
    close: []
    save: [settings: Settings]
}>()

const localSettings = ref<Settings>({ ...props.settings })

watch(
    () => props.settings,
    newSettings => {
        localSettings.value = { ...newSettings }
    },
    { deep: true }
)

const closeModal = () => {
    emit('close')
}

const saveSettings = () => {
    emit('save', { ...localSettings.value })
    closeModal()
}

const resetSettings = () => {
    localSettings.value = {
        endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'GLM-4.1V-Thinking-Flash',
        apiKey: 'a835b9f6866d48ec956d341418df8a50.NuhlKYn58EkCb5iP',
        autoSave: true,
        showPreview: false,
        maxHistory: 20
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
    max-width: 520px;
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
    padding: 2rem;
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

.setting-group {
    margin-bottom: 2.5rem;
}

.setting-group:last-child {
    margin-bottom: 0;
}

.setting-group > label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.input-group {
    margin-bottom: 1rem;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
}

.input-group input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: #fff;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #374151;
}

.checkbox-label input[type='checkbox'] {
    width: auto;
    margin: 0;
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

.reset-btn {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.reset-btn:hover {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-1px);
}

.cancel-btn {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.cancel-btn:hover {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-1px);
}

.save-btn {
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

.save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
