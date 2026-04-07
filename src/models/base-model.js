/**
 * 大模型集成基础抽象类
 * 定义统一的模型接口，支持多种大模型提供商
 */

class BaseModel {
  constructor(config) {
    this.config = config;
    this.provider = config.provider;
    this.modelName = config.model;
    this.apiKey = config.apiKey;
  }

  // 生成文本
  async generateText(prompt, options = {}) {
    throw new Error('子类必须实现此方法');
  }

  // 聊天补全
  async chatCompletion(messages, options = {}) {
    throw new Error('子类必须实现此方法');
  }

  // 嵌入向量
  async embeddings(text, options = {}) {
    throw new Error('子类必须实现此方法');
  }

  // 工具调用
  async toolCall(tools, inputs, options = {}) {
    throw new Error('子类必须实现此方法');
  }

  // 获取模型配置
  getConfig() {
    return {
      provider: this.provider,
      model: this.modelName,
      apiKey: this.apiKey ? '********' : '未配置'
    };
  }

  // 验证配置
  validateConfig() {
    if (!this.provider) {
      throw new Error('模型提供商未配置');
    }
    if (!this.modelName) {
      throw new Error('模型名称未配置');
    }
  }

  // 格式化提示
  formatPrompt(prompt, context = {}) {
    return prompt;
  }

  // 解析响应
  parseResponse(response) {
    return response;
  }

  // 错误处理
  handleError(error) {
    console.error(`[${this.provider}] 模型调用错误:`, error);
    return {
      error: true,
      message: error.message || '模型调用失败',
      details: error.stack || ''
    };
  }

  // 获取支持的模型列表
  static getSupportedModels() {
    return [];
  }

  // 创建模型实例（工厂方法）
  static createModel(config) {
    const providers = {
      openai: 'OpenAIModel',
      anthropic: 'AnthropicModel',
      google: 'GoogleModel',
      azure: 'AzureModel',
      local: 'LocalModel'
    };

    const providerName = providers[config.provider] || config.provider;
    
    try {
      const ModelClass = require(`./${providerName.toLowerCase()}`);
      return new ModelClass(config);
    } catch (error) {
      console.error(`无法加载模型类 ${providerName}:`, error);
      throw new Error(`不支持的模型提供商: ${config.provider}`);
    }
  }
}

module.exports = BaseModel;
