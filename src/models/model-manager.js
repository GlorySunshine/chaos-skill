/**
 * 模型管理器类
 * 统一管理和配置各种大模型适配器
 */

const BaseModel = require('./base-model');
const OpenAIModel = require('./openai-model');
const AnthropicModel = require('./anthropic-model');
const LocalModel = require('./local-model');

class ModelManager {
  constructor(config) {
    this.config = config;
    this.availableModels = new Map();
    this.currentModel = null;
    
    // 初始化支持的模型提供商
    this.initializeModelProviders();
    
    // 加载配置的模型
    this.loadConfiguredModels();
    
    // 设置默认模型
    if (this.config.defaultProvider && this.config.defaultModel) {
      this.setCurrentModel(this.config.defaultProvider, this.config.defaultModel);
    }
  }

  // 初始化支持的模型提供商
  initializeModelProviders() {
    this.providers = {
      openai: OpenAIModel,
      anthropic: AnthropicModel,
      local: LocalModel
    };
  }

  // 加载配置的模型
  loadConfiguredModels() {
    // 从配置中加载模型
    if (this.config.providers) {
      Object.entries(this.config.providers).forEach(([provider, configs]) => {
        if (Array.isArray(configs)) {
          configs.forEach(config => {
            const modelKey = `${provider}-${config.model}`;
            try {
              const model = this.createModel(provider, config);
              this.availableModels.set(modelKey, model);
              console.log(`模型 ${modelKey} 加载成功`);
            } catch (error) {
              console.error(`模型 ${modelKey} 加载失败:`, error);
            }
          });
        } else if (typeof configs === 'object') {
          const modelKey = `${provider}-${configs.model}`;
          try {
            const model = this.createModel(provider, configs);
            this.availableModels.set(modelKey, model);
            console.log(`模型 ${modelKey} 加载成功`);
          } catch (error) {
            console.error(`模型 ${modelKey} 加载失败:`, error);
          }
        }
      });
    }
  }

  // 创建模型实例
  createModel(provider, config) {
    if (!this.providers[provider]) {
      throw new Error(`不支持的模型提供商: ${provider}`);
    }
    
    const ModelClass = this.providers[provider];
    return new ModelClass({
      provider,
      model: config.model,
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      ...config
    });
  }

  // 设置当前使用的模型
  setCurrentModel(provider, modelName, options = {}) {
    const modelKey = `${provider}-${modelName}`;
    
    if (this.availableModels.has(modelKey)) {
      this.currentModel = this.availableModels.get(modelKey);
      console.log(`已切换到模型: ${modelKey}`);
      return true;
    }
    
    // 如果模型未加载，尝试动态创建
    const config = this.findModelConfig(provider, modelName);
    if (config) {
      try {
        const model = this.createModel(provider, config);
        this.availableModels.set(modelKey, model);
        this.currentModel = model;
        console.log(`已加载并切换到模型: ${modelKey}`);
        return true;
      } catch (error) {
        console.error(`模型 ${modelKey} 加载失败:`, error);
        return false;
      }
    }
    
    console.error(`模型 ${modelKey} 未配置`);
    return false;
  }

  // 查找模型配置
  findModelConfig(provider, modelName) {
    if (this.config.providers && this.config.providers[provider]) {
      if (Array.isArray(this.config.providers[provider])) {
        return this.config.providers[provider].find(config => config.model === modelName);
      } else if (this.config.providers[provider].model === modelName) {
        return this.config.providers[provider];
      }
    }
    
    return null;
  }

  // 获取当前模型
  getCurrentModel() {
    if (!this.currentModel) {
      throw new Error('未配置默认模型');
    }
    return this.currentModel;
  }

  // 获取所有可用模型
  getAvailableModels() {
    return Array.from(this.availableModels.values());
  }

  // 获取模型信息
  getModelInfo(provider, modelName) {
    const modelKey = `${provider}-${modelName}`;
    return this.availableModels.get(modelKey);
  }

  // 直接调用当前模型的方法
  async generateText(prompt, options = {}) {
    return this.getCurrentModel().generateText(prompt, options);
  }

  async chatCompletion(messages, options = {}) {
    return this.getCurrentModel().chatCompletion(messages, options);
  }

  async embeddings(text, options = {}) {
    return this.getCurrentModel().embeddings(text, options);
  }

  async toolCall(tools, inputs, options = {}) {
    return this.getCurrentModel().toolCall(tools, inputs, options);
  }

  // 模型切换策略
  async switchModelWithStrategy(strategy = 'performance') {
    const availableModels = this.getAvailableModels();
    
    switch (strategy) {
      case 'cost':
        // 选择最便宜的模型
        return this.selectModelByCost(availableModels);
      case 'performance':
        // 选择性能最好的模型
        return this.selectModelByPerformance(availableModels);
      case 'speed':
        // 选择最快的模型
        return this.selectModelBySpeed(availableModels);
      default:
        console.warn(`未知策略: ${strategy}，使用默认策略`);
        return this.selectModelByPerformance(availableModels);
    }
  }

  // 按成本选择模型
  selectModelByCost(models) {
    const costOrder = [
      'local',    // 免费
      'anthropic', // 价格适中
      'openai'    // 最贵
    ];
    
    for (let provider of costOrder) {
      const model = models.find(m => m.provider === provider);
      if (model) {
        this.currentModel = model;
        console.log(`已切换到最便宜的模型: ${model.provider}-${model.modelName}`);
        return true;
      }
    }
    
    return false;
  }

  // 按性能选择模型
  selectModelByPerformance(models) {
    const performanceOrder = [
      'openai',    // 性能最好
      'anthropic',  // 性能次之
      'local'      // 性能最差
    ];
    
    for (let provider of performanceOrder) {
      const model = models.find(m => m.provider === provider);
      if (model) {
        this.currentModel = model;
        console.log(`已切换到性能最好的模型: ${model.provider}-${model.modelName}`);
        return true;
      }
    }
    
    return false;
  }

  // 按速度选择模型
  selectModelBySpeed(models) {
    const speedOrder = [
      'local',     // 最快（本地网络）
      'anthropic',  // 速度适中
      'openai'     // 可能较慢（网络延迟）
    ];
    
    for (let provider of speedOrder) {
      const model = models.find(m => m.provider === provider);
      if (model) {
        this.currentModel = model;
        console.log(`已切换到最快的模型: ${model.provider}-${model.modelName}`);
        return true;
      }
    }
    
    return false;
  }

  // 获取所有支持的模型列表
  static getSupportedModels() {
    const allModels = [];
    allModels.push(...OpenAIModel.getSupportedModels().map(m => ({
      provider: 'openai',
      ...m
    })));
    allModels.push(...AnthropicModel.getSupportedModels().map(m => ({
      provider: 'anthropic',
      ...m
    })));
    allModels.push(...LocalModel.getSupportedModels().map(m => ({
      provider: 'local',
      ...m
    })));
    return allModels;
  }

  // 获取系统状态
  getSystemStatus() {
    return {
      currentModel: this.currentModel 
        ? this.currentModel.getConfig() 
        : null,
      availableModels: Array.from(this.availableModels.entries()).map(([key, model]) => ({
        key,
        ...model.getConfig()
      })),
      totalModels: this.availableModels.size,
      hasDefaultModel: !!this.currentModel
    };
  }
}

module.exports = ModelManager;
