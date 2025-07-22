export interface PromptRequest {
  input: string
  apiKey?: string
}

export interface PromptResponse {
  enhanced: string
  original: string
}

export interface ApiConfig {
  endpoint: string
  model: string
  apiKey: string
}