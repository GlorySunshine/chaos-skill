/**
 * 本地模型适配器
 * 支持本地部署的模型（如 Llama、Alpaca、Mistral 等）
 * 使用本地服务器或 API 接口进行模型调用
 */

const axios = require('axios');
const BaseModel = require('./base-model');

class LocalModel extends BaseModel {
  constructor(config) {
    super(config);
    
    this.client = axios.create({
      baseURL: config.baseURL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // 聊天补全
  async chatCompletion(messages, options = {}) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.modelName,
        messages: messages,
        temperature: options.temperature || this.config.temperature || 0.7,
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        top_p: options.topP || this.config.topP || 1.0
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 生成文本
  async generateText(prompt, options = {}) {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ];
    
    return this.chatCompletion(messages, options);
  }

  // 嵌入向量
  async embeddings(text, options = {}) {
    try {
      const response = await this.client.post('/embeddings', {
        model: options.model || 'text-embedding',
        input: text
      });

      return {
        success: true,
        embedding: response.data.data[0].embedding,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          totalTokens: response.data.usage.total_tokens
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 工具调用
  async toolCall(tools, inputs, options = {}) {
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant with tool capabilities.' },
        { role: 'user', content: 'Please use the following tools to help with your task.' }
      ];

      const response = await this.client.post('/chat/completions', {
        model: this.modelName,
        messages: messages,
        tools: tools,
        tool_choice: options.toolChoice || 'auto',
        temperature: options.temperature || 0.1
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        toolCalls: response.data.choices[0].message.tool_calls
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 格式化提示（本地模型风格）
  formatPrompt(prompt, context = {}) {
    let formattedPrompt = prompt;
    
    if (context.system) {
      formattedPrompt = `[INST] <<SYS>>${context.system}<</SYS>>${formattedPrompt}[/INST]`;
    }
    
    if (context.examples) {
      formattedPrompt += '\n\nExamples:\n';
      context.examples.forEach(example => {
        formattedPrompt += `Q: ${example.question}\nA: ${example.answer}\n`;
      });
    
    return formattedPrompt;
  }

  // 解析响应
  parseResponse(response) {
    return response;
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return {
        error: true,
        message: '本地服务器连接失败',
        details: error.message
      };
    }
  }

  // 获取支持的本地模型列表
  static getSupportedModels() {
    return [
      { name: 'llama-2-7b', description: 'Llama 2 7B 参数模型' },
      { name: 'llama-2-13b', description: 'Llama 2 13B 参数模型' },
      { name: 'alpaca-7b', description: 'Alpaca 7B 参数模型' },
      { name: 'mistral-7b', description: 'Mistral 7B 参数模型' },
      { name: 'falcon-7b', description: 'Falcon 7B 参数模型' }
    ];
  }

  // 验证配置
  validateConfig() {
    super.validateConfig();
    
    if (!this.config.baseURL) {
      throw new Error('本地模型服务器地址未配置');
    }
  }
}

module.exports = LocalModel;
