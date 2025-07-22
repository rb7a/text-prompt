// Vue 全局类型定义
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// 扩展全局属性
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        // 在这里可以添加全局属性的类型定义
    }
}

export {}
