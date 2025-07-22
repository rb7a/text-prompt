import type { PromptRequest, PromptResponse, ApiConfig } from '../types'

// 默认配置 - 使用智谱AI服务
const DEFAULT_CONFIG: ApiConfig = {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'GLM-4.1V-Thinking-Flash',
    apiKey: 'a835b9f6866d48ec956d341418df8a50.NuhlKYn58EkCb5iP'
}

export class AIService {
    private config: ApiConfig

    constructor(config?: Partial<ApiConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    async enhancePrompt(request: PromptRequest): Promise<PromptResponse> {
        try {
            // 调用AI服务
            const enhancedPrompt = await this.callAI(request.input, request.apiKey)

            return {
                enhanced: enhancedPrompt,
                original: request.input
            }
        } catch (error: any) {
            console.error('AI服务调用失败:', error)

            // 检查是否是网络错误或API错误，如果是则重新抛出
            if (
                error.message?.includes('HTTP error') ||
                error.message?.includes('fetch') ||
                error.message?.includes('404') ||
                error.message?.includes('401') ||
                error.message?.includes('403') ||
                error.message?.includes('429') ||
                error.message?.includes('500') ||
                error.message?.includes('Invalid response format') ||
                error.name === 'TypeError' ||
                error.name === 'NetworkError'
            ) {
                // 重新抛出网络和API错误，让上层处理
                throw error
            }

            // 只有在其他类型的错误时才使用fallback
            return this.getFallbackResponse(request.input)
        }
    }

    private async callAI(input: string, apiKey?: string): Promise<string> {
        const systemPrompt = `### 🔍 提示词优化专家系统
**任务说明**  
我将把你的简单提示词优化为专业级AI指令，包含：场景设定、角色定义、任务细节、输出格式和约束条件。

**规则说明**  
当用户输入原始提示词时，直接返回以下结构化内容（无需任何前言/后缀说明）：

**优化规则**  
1. 补充缺失的上下文和限制条件  
2. 添加具体参数和量化指标  
3. 明确AI角色和专业领域  
4. 结构化关键要素（5W1H原则）  
5. 设置防幻觉指令  

**输入格式**  
直接输入你的原始提示词（如：写一篇关于气候变化的文章）

**输出模板**  

**场景设定**  
{补充背景信息和使用场景}  

**AI角色**  
{指定AI需要扮演的专业角色}  

**核心任务**  
{分解具体任务步骤和技术要求}  

**输出要求**  
- 格式：{指定格式如Markdown/JSON/表格}  
- 风格：{描述语言风格}  
- 长度：{精确字数或段落要求}  
- 关键要素：{必须包含的专业要点}  

**约束条件**  
⚠️ {排除事项、敏感词过滤、数据来源限制等}
        `

        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey || this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: input }
                ],
                temperature: 0.7
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content
        } else {
            throw new Error('Invalid response format')
        }
    }

    private getFallbackResponse(input: string): PromptResponse {
        // 分析输入内容类型，提供更智能的fallback
        const inputLower = input.toLowerCase()
        let enhanced = ''

        if (inputLower.includes('写') || inputLower.includes('文章') || inputLower.includes('内容')) {
            enhanced = this.getWritingPrompt(input)
        } else if (inputLower.includes('代码') || inputLower.includes('编程') || inputLower.includes('开发')) {
            enhanced = this.getCodingPrompt(input)
        } else if (inputLower.includes('分析') || inputLower.includes('研究') || inputLower.includes('调查')) {
            enhanced = this.getAnalysisPrompt(input)
        } else if (inputLower.includes('创意') || inputLower.includes('设计') || inputLower.includes('想法')) {
            enhanced = this.getCreativePrompt(input)
        } else {
            enhanced = this.getGeneralPrompt(input)
        }

        return {
            enhanced,
            original: input
        }
    }

    private getWritingPrompt(input: string): string {
        return `# 写作任务增强提示词

## 核心任务
${input}

## 写作要求
1. **结构清晰**: 使用合适的标题层级和段落结构
2. **内容充实**: 提供具体的事实、数据和例子支撑观点
3. **语言流畅**: 使用准确、生动的语言表达
4. **逻辑严密**: 确保论证过程清晰，前后呼应

## 输出格式
- 标题：简洁有力，概括主题
- 引言：吸引读者注意，概述主要内容
- 正文：分段论述，每段一个要点
- 结论：总结要点，呼应主题

## 质量标准
- 字数适中，内容饱满
- 观点明确，论证有力
- 语言规范，表达准确
- 结构完整，逻辑清晰

请按照以上要求完成写作任务。`
    }

    private getCodingPrompt(input: string): string {
        return `# 编程任务增强提示词

## 开发需求
${input}

## 技术要求
1. **代码质量**: 遵循最佳实践和编码规范
2. **功能完整**: 实现所有必要的功能模块
3. **错误处理**: 包含适当的异常处理机制
4. **性能优化**: 考虑代码执行效率和资源使用

## 实现规范
- 使用清晰的变量和函数命名
- 添加必要的注释说明
- 遵循DRY原则，避免代码重复
- 考虑代码的可维护性和扩展性

## 输出要求
- 提供完整的代码实现
- 包含使用示例和测试用例
- 说明关键技术点和实现思路
- 列出可能的改进方向

## 质量检查
- 语法正确，无明显错误
- 逻辑清晰，功能完整
- 性能合理，资源高效
- 文档完善，易于理解

请按照以上标准完成编程任务。`
    }

    private getAnalysisPrompt(input: string): string {
        return `# 分析任务增强提示词

## 分析目标
${input}

## 分析框架
1. **问题定义**: 明确分析的核心问题和范围
2. **数据收集**: 识别相关数据源和信息来源
3. **方法选择**: 选择合适的分析方法和工具
4. **结果解读**: 客观解释分析结果和含义

## 分析维度
- **定量分析**: 使用数据和统计方法
- **定性分析**: 考虑背景因素和主观判断
- **对比分析**: 横向和纵向比较
- **趋势分析**: 识别发展趋势和变化规律

## 输出结构
- 执行摘要：核心发现和建议
- 背景介绍：问题背景和分析目的
- 方法说明：分析方法和数据来源
- 结果展示：详细分析结果
- 结论建议：基于分析的结论和建议

## 质量要求
- 逻辑严密，论证充分
- 数据准确，来源可靠
- 结论客观，建议实用
- 表达清晰，易于理解

请按照以上框架进行深入分析。`
    }

    private getCreativePrompt(input: string): string {
        return `# 创意任务增强提示词

## 创意需求
${input}

## 创意原则
1. **原创性**: 提供独特新颖的想法和方案
2. **实用性**: 确保创意具有可行性和实用价值
3. **创新性**: 突破常规思维，探索新的可能性
4. **针对性**: 紧密结合具体需求和目标受众

## 思维方法
- **发散思维**: 从多个角度探索可能性
- **联想思维**: 建立不同概念间的联系
- **逆向思维**: 从相反角度思考问题
- **系统思维**: 考虑整体和各部分的关系

## 输出要求
- 提供多个创意方案供选择
- 详细描述每个方案的特点
- 分析方案的优势和挑战
- 给出实施建议和注意事项

## 评估标准
- 创新程度：是否具有新颖性
- 可行性：是否容易实现
- 影响力：是否能产生预期效果
- 持续性：是否具有长期价值

请发挥创意，提供多样化的解决方案。`
    }

    private getGeneralPrompt(input: string): string {
        return `# 通用任务增强提示词

## 任务描述
${input}

## 执行标准
1. **准确性**: 确保信息准确，避免错误和误导
2. **完整性**: 全面覆盖相关要点，不遗漏重要内容
3. **清晰性**: 表达清楚明了，易于理解和执行
4. **实用性**: 提供具有实际价值的内容和建议

## 工作流程
- **需求分析**: 深入理解任务要求和期望
- **资料收集**: 搜集相关信息和参考资料
- **内容组织**: 合理安排内容结构和逻辑
- **质量检查**: 确保输出质量符合标准

## 输出格式
- 使用清晰的标题和段落结构
- 采用适当的格式化和排版
- 包含必要的说明和注释
- 提供相关的参考和延伸阅读

## 质量保证
- 内容准确，逻辑清晰
- 结构完整，重点突出
- 语言规范，表达准确
- 格式统一，便于阅读

请按照以上要求高质量完成任务。`
    }
}
