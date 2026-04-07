/**
 * Anthropic 模型适配器
 * 实现 Anthropic API 的接口适配器，支持 Claude 系列模型
 */

const axios = require('axios');
const BaseModel = require('./base-model');

class AnthropicModel extends BaseModel {
  constructor(config) {
    super(config);
    
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
  }

  // 聊天补全
  async chatCompletion(messages, options = {}) {
    try {
      const formattedMessages = this.formatMessages(messages);
      
      const response = await this.client.post('/messages', {
        model: this.modelName,
        messages: formattedMessages,
        temperature: options.temperature || this.config.temperature || 0.7,
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        top_p: options.topP || this.config.topP || 1.0,
        top_k: options.topK || this.config.topK || 40
      });

      return {
        success: true,
        content: response.data.content[0].text,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 格式化消息（Anthropic 风格）
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role, // Anthropic 不直接支持 system 角色
      content: msg.content
    }));
  }

  // 生成文本
  async generateText(prompt, options = {}) {
    const messages = [
      { role: 'user', content: prompt }
    ];
    
    return this.chatCompletion(messages, options);
  }

  // 嵌入向量
  async embeddings(text, options = {}) {
    try {
      const response = await this.client.post('/embeddings', {
        model: options.model || 'text-embedding-v1',
        input: text
      });

      return {
        success: true,
        embedding: response.data.embedding,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          totalTokens: response.data.usage.input_tokens
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
        { role: 'user', content: 'Please use the following tools to help with your task.' }
      ];

      const response = await this.client.post('/messages', {
        model: this.modelName,
        messages: messages,
        tools: tools,
        tool_choice: options.toolChoice || 'auto',
        temperature: options.temperature || 0.1
      });

      return {
        success: true,
        content: response.data.content[0].text,
        toolCalls: response.data.tool_calls
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 格式化提示（Anthropic 风格）
  formatPrompt(prompt, context = {}) {
    let formattedPrompt = prompt;
    
    if (context.system) {
      formattedPrompt = `System: ${context.system}\n\n${formattedPrompt}`;
    }
    
    if (context.examples) {
      formattedPrompt += '\n\nExamples:\n';
      context.examples.forEach(example => {
        formattedPrompt += `Human: ${example.question}\nAssistant: ${example.answer}\n`;
      });
    }
    
    return formattedPrompt;
  }

  // 解析响应
  parseResponse(response) {
    return response;
  }

  // 获取支持的 Anthropic 模型列表
  static getSupportedModels() {
    return [
      { name: 'claude-3-opus-20240229', description: 'Anthropic Claude 3 Opus 模型' },
      { name: 'claude-3-sonnet-20240229', description: 'Anthropic Claude 3 Sonnet 模型' },
      { name: 'claude-3-haiku-20240307', description: 'Anthropic Claude 3 Haiku 模型' },
      { name: 'claude-2.1', description: 'Anthropic Claude 2.1 模型' },
      { name: 'claude-2', description: 'Anthropic Claude 2 模型' }
    ];
  }

  // 验证配置
  validateConfig() {
    super.validateConfig();
    
    if (!this.apiKey) {
      throw new Error('Anthropic API 密钥未配置');
    }
  }
}

module.exports = AnthropicModel;
