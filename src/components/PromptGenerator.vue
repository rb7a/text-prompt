<template>
    <div class="prompt-generator">
        <div class="container">
            <!-- 顶部导航 -->
            <nav class="top-nav">
                <div class="nav-controls">
                    <button @click="showHistory = true" class="nav-btn" v-if="history.length > 0">📚 历史</button>
                    <button @click="showSettings = true" class="nav-btn">⚙️ 设置</button>
                </div>
            </nav>

            <!-- 主标题区域 -->
            <header class="hero-section">
                <h1 class="hero-title">AI Prompt Generator</h1>
                <p class="hero-subtitle">将简单的想法转换为专业的AI提示词，为你的创意提供无限可能</p>
            </header>

            <!-- 主卡片 -->
            <div class="main-card">
                <!-- 输入区域 -->
                <div class="input-section">
                    <div class="input-container">
                        <textarea v-model="inputPrompt" placeholder="输入你的想法，让AI帮你优化成专业提示词..." :disabled="loading" class="prompt-input" rows="6"></textarea>
                        <div class="input-footer">
                            <div class="input-hint">支持中文、英文等多种语言输入</div>
                            <button @click="clearAll" class="clear-btn" :disabled="loading || !inputPrompt.trim()">清空</button>
                        </div>
                    </div>

                    <button @click="generatePrompt" :disabled="!inputPrompt.trim() || loading" class="generate-button">
                        <span v-if="loading" class="loading-spinner"></span>
                        {{ loading ? '生成中...' : '生成提示词' }}
                    </button>
                </div>

                <!-- 输出区域 -->
                <div class="output-section" v-if="result || error">
                    <div class="section-header">
                        <h3 class="section-title">{{ error ? '❌ 生成失败' : '✨ 增强后的提示词' }}</h3>
                        <div class="section-controls" v-if="result">
                            <button @click="toggleView" class="control-btn">
                                {{ showMarkdown ? '预览' : '源码' }}
                            </button>
                            <button @click="copyToClipboard" class="control-btn primary">
                                {{ copied ? '✅ 已复制' : '📋 复制' }}
                            </button>
                            <button @click="savePrompt" class="control-btn">💾 下载</button>
                        </div>
                    </div>

                    <div class="output-content" v-if="result">
                        <div v-if="showMarkdown" class="markdown-view">
                            <pre><code>{{ result.enhanced }}</code></pre>
                        </div>
                        <div v-else class="rendered-view" v-html="renderedMarkdown"></div>
                    </div>

                    <div class="error-content" v-if="error">
                        <div class="error-icon">⚠️</div>
                        <p class="error-message">{{ error }}</p>
                        <button @click="error = ''" class="retry-button">重新尝试</button>
                    </div>
                </div>
            </div>

            <!-- 特性介绍 -->
            <div class="features-section" v-if="!result && !error">
                <h3 class="features-title">为什么选择 AI Prompt Generator</h3>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h4 class="feature-title">快速识别</h4>
                        <p class="feature-desc">智能分析输入内容，秒级生成结构化专业提示词，大幅提升AI响应质量</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">💎</div>
                        <h4 class="feature-title">免费无限制</h4>
                        <p class="feature-desc">完全免费使用，无次数限制，无需注册，开箱即用的提示词优化体验</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h4 class="feature-title">创意无限</h4>
                        <p class="feature-desc">支持写作、编程、分析、设计等多场景，激发无限创意可能性</p>
                    </div>
                </div>
            </div>

            <!-- 底部信息 -->
            <footer class="footer">
                <div class="footer-content">
                    <p class="copyright">© 2025 AI Prompt Generator | <a href="https://github.com/liu-ziting/" target="_blank" rel="noopener noreferrer">liuziting</a></p>
                    <div class="author-info">
                        <div class="links">
                            <a href="https://xhs.lz-t.top/" target="_blank" rel="noopener noreferrer" class="footer-link"> 小红书解析 </a>
                            <span class="link-separator">|</span>
                            <a href="https://prompt.lz-t.top/" target="_blank" rel="noopener noreferrer" class="footer-link"> 图片转提示词 </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 设置模态框 -->
        <SettingsModal :show="showSettings" :settings="settings" @close="showSettings = false" @save="updateSettings" />

        <!-- 历史记录模态框 -->
        <HistoryModal :show="showHistory" :history="history" @close="showHistory = false" @select="loadFromHistory" @delete="deleteHistoryItem" @clear-all="clearHistory" />

        <!-- Toast 提示容器 -->
        <ToastContainer />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AIService } from '../services/aiService'
import SettingsModal from './SettingsModal.vue'
import HistoryModal from './HistoryModal.vue'
import ToastContainer from './ToastContainer.vue'
import { useToast } from '../composables/useToast'
import type { PromptResponse } from '../types'

interface HistoryItem extends PromptResponse {
    timestamp: number
}

interface Settings {
    endpoint: string
    model: string
    apiKey: string
    autoSave: boolean
    showPreview: boolean
    maxHistory: number
}

const inputPrompt = ref('')
const apiKey = ref('')
const result = ref<PromptResponse | null>(null)
const loading = ref(false)
const showMarkdown = ref(false)
const showHistory = ref(false)
const copied = ref(false)
const error = ref('')
const history = ref<HistoryItem[]>([])
const showSettings = ref(false)
const settings = ref<Settings>({
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'GLM-4.1V-Thinking-Flash',
    apiKey: 'a835b9f6866d48ec956d341418df8a50.NuhlKYn58EkCb5iP',
    autoSave: true,
    showPreview: false,
    maxHistory: 20
})

let aiService = new AIService()
const { success, error: showError, warning, info } = useToast()

// 从localStorage加载历史记录和设置
onMounted(() => {
    const savedHistory = localStorage.getItem('prompt-history')
    if (savedHistory) {
        history.value = JSON.parse(savedHistory)
    }

    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
        apiKey.value = settings.value.apiKey

        // 使用保存的设置重新创建 AIService 实例
        aiService = new AIService({
            endpoint: settings.value.endpoint,
            model: settings.value.model,
            apiKey: settings.value.apiKey
        })
    }

    // 根据设置初始化视图
    showMarkdown.value = !settings.value.showPreview
})

// 简单的markdown渲染
const renderedMarkdown = computed(() => {
    if (!result.value) return ''

    return result.value.enhanced
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
        .replace(/<p><li>/g, '<ul><li>')
        .replace(/<\/li><\/p>/g, '</li></ul>')
})

const generatePrompt = async () => {
    if (!inputPrompt.value.trim()) return

    loading.value = true
    error.value = ''

    try {
        result.value = await aiService.enhancePrompt({
            input: inputPrompt.value,
            apiKey: settings.value.apiKey || undefined
        })

        // 保存到历史记录
        if (result.value) {
            const historyItem: HistoryItem = {
                ...result.value,
                timestamp: Date.now()
            }
            history.value.unshift(historyItem)
            // 只保留设置中指定数量的记录
            if (history.value.length > settings.value.maxHistory) {
                history.value = history.value.slice(0, settings.value.maxHistory)
            }
            saveToLocalStorage()

            // 显示成功提示
            success('生成成功', '提示词已成功生成并保存到历史记录')
        }
    } catch (err: any) {
        console.error('生成失败:', err)

        // 根据错误类型显示不同的提示
        let errorTitle = '生成失败'
        let errorMessage = '请检查网络连接或API配置'

        if (err.message?.includes('404')) {
            errorTitle = 'API接口未找到'
            errorMessage = '请检查API端点配置是否正确，或联系管理员'
        } else if (err.message?.includes('401') || err.message?.includes('403')) {
            errorTitle = 'API密钥无效'
            errorMessage = '请检查API Key是否正确，或是否有足够的权限'
        } else if (err.message?.includes('429')) {
            errorTitle = '请求过于频繁'
            errorMessage = '请稍后再试，或检查API配额是否充足'
        } else if (err.message?.includes('500')) {
            errorTitle = '服务器内部错误'
            errorMessage = 'AI服务暂时不可用，请稍后重试'
        } else if (err.message?.includes('timeout') || err.message?.includes('network')) {
            errorTitle = '网络连接超时'
            errorMessage = '请检查网络连接，或稍后重试'
        } else if (err.message?.includes('Invalid response format')) {
            errorTitle = 'API响应格式错误'
            errorMessage = '服务返回了意外的数据格式，请检查API配置'
        }

        // 显示错误提示（不自动关闭，让用户手动关闭）
        showError(errorTitle, errorMessage, 0)

        // 同时在界面上显示简化的错误信息
        error.value = errorTitle
    } finally {
        loading.value = false
    }
}

const toggleView = () => {
    showMarkdown.value = !showMarkdown.value
}

const copyToClipboard = async () => {
    if (!result.value) return

    try {
        await navigator.clipboard.writeText(result.value.enhanced)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)

        // 显示复制成功提示
        success('复制成功', '提示词已复制到剪贴板')
    } catch (error) {
        console.error('复制失败:', error)
        showError('复制失败', '无法访问剪贴板，请手动复制内容')
    }
}

const savePrompt = () => {
    if (!result.value) return

    try {
        const blob = new Blob([result.value.enhanced], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prompt-${Date.now()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // 显示下载成功提示
        success('下载成功', '提示词文件已保存到本地')
    } catch (error) {
        console.error('下载失败:', error)
        showError('下载失败', '无法保存文件，请检查浏览器权限')
    }
}

const clearAll = () => {
    inputPrompt.value = ''
    result.value = null
    error.value = ''
}

const clearHistory = () => {
    history.value = []
    localStorage.removeItem('prompt-history')

    // 显示清空成功提示
    info('历史记录已清空', '所有历史记录已被删除')
}

const deleteHistoryItem = (index: number) => {
    history.value.splice(index, 1)
    saveToLocalStorage()
}

const loadFromHistory = (item: HistoryItem) => {
    inputPrompt.value = item.original
    result.value = { enhanced: item.enhanced, original: item.original }
    error.value = ''
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const saveToLocalStorage = () => {
    if (settings.value.autoSave) {
        localStorage.setItem('prompt-history', JSON.stringify(history.value))
    }
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
}

const updateSettings = (newSettings: Settings) => {
    settings.value = { ...newSettings }
    apiKey.value = newSettings.apiKey

    // 重新创建 AIService 实例以使用新的配置
    aiService = new AIService({
        endpoint: newSettings.endpoint,
        model: newSettings.model,
        apiKey: newSettings.apiKey
    })

    saveToLocalStorage()

    // 显示设置保存成功提示
    success('设置已保存', 'API配置已更新并生效')
}
</script>

<style scoped>
/* 全局样式 */
.prompt-generator {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    position: relative;
    overflow-x: hidden;
}

.prompt-generator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
    pointer-events: none;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

/* 顶部导航 */
.top-nav {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 2rem;
}

.nav-controls {
    display: flex;
    gap: 0.75rem;
}

.nav-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
}

.nav-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 主标题区域 */
.hero-section {
    text-align: center;
    margin-bottom: 3rem;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 主卡片 */
.main-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 3rem;
    animation: fadeInUp 0.8s ease-out 0.4s both;
    position: relative;
}

.main-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24px;
    pointer-events: none;
}

/* 输入区域 */
.input-section {
    margin-bottom: 2rem;
}

.input-container {
    position: relative;
}

.input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding: 0 0.25rem;
}

.input-hint {
    font-size: 0.875rem;
    color: #6b7280;
}

.clear-btn {
    background: transparent;
    color: #6b7280;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.clear-btn:hover:not(:disabled) {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.clear-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.prompt-input {
    width: 100%;
    min-height: 150px;
    padding: 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    transition: all 0.3s ease;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.prompt-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
    background: #fefefe;
}

.prompt-input::placeholder {
    color: #9ca3af;
}

.generate-button {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1.25rem 2rem;
    border-radius: 16px;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    margin-top: 10px;
}

.generate-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.generate-button:hover:not(:disabled)::before {
    left: 100%;
}

.generate-button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.generate-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* 输出区域 */
.output-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e7eb;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
}

.section-controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.control-btn {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.control-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}

.control-btn.primary:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.control-btn.danger {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
}

.control-btn.danger:hover {
    background: #dc2626;
}

.output-content {
    background: #f9fafb;
    border-radius: 12px;
    padding: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.output-content::-webkit-scrollbar {
    display: none;
}

.markdown-view pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #374151;
}

.rendered-view {
    line-height: 1.7;
    color: #374151;
}

.rendered-view h1,
.rendered-view h2,
.rendered-view h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #1f2937;
}

.rendered-view h1 {
    font-size: 1.5rem;
}
.rendered-view h2 {
    font-size: 1.3rem;
}
.rendered-view h3 {
    font-size: 1.1rem;
}

.rendered-view ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.rendered-view li {
    margin-bottom: 0.5rem;
}

.rendered-view code {
    background: #e5e7eb;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.875rem;
}

.rendered-view strong {
    font-weight: 600;
    color: #1f2937;
}

/* 错误内容 */
.error-content {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error-message {
    color: #dc2626;
    font-size: 1rem;
    margin-bottom: 1.5rem;
}

.retry-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.retry-button:hover {
    background: #b91c1c;
    transform: translateY(-1px);
}

/* 特性介绍 */
.features-section {
    margin-top: 4rem;
    text-align: center;
}

.features-title {
    font-size: 1.875rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 3rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.feature-card:hover::before {
    opacity: 1;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
}

.feature-desc {
    color: #6b7280;
    line-height: 1.6;
}

/* 底部 */
.footer {
    text-align: center;
    margin-top: 4rem;
    padding: 2rem 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
}

.footer-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.copyright {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
}

a {
    color: #ffffff;
    text-decoration: none;
}
.author-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
}

.author {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.8;
}

.author-name {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.links-label {
    font-size: 0.8rem;
    opacity: 0.8;
}

.footer-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.footer-link:hover {
    color: white;
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    text-decoration: none;
}

.link-separator {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    margin: 0 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .prompt-generator {
        padding: 0.5rem;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .main-card {
        padding: 1.5rem;
    }

    .nav-controls {
        flex-wrap: wrap;
        justify-content: center;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .section-controls {
        width: 100%;
        justify-content: flex-start;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 1024px) and (min-width: 769px) {
    .features-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }

    .feature-card {
        padding: 2rem;
    }
}
</style>
