/**
 * OpenAI 模型适配器
 * 实现 OpenAI API 的接口适配器
 */

const OpenAI = require('openai');
const BaseModel = require('./base-model');

class OpenAIModel extends BaseModel {
  constructor(config) {
    super(config);
    
    // 初始化 OpenAI 客户端
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1'
    });
  }

  // 聊天补全
  async chatCompletion(messages, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: messages,
        temperature: options.temperature || this.config.temperature || 0.7,
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        top_p: options.topP || this.config.topP || 1.0,
        frequency_penalty: options.frequencyPenalty || this.config.frequencyPenalty || 0.0,
        presence_penalty: options.presencePenalty || this.config.presencePenalty || 0.0
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
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
      const response = await this.client.embeddings.create({
        model: options.model || 'text-embedding-3-small',
        input: text
      });

      return {
        success: true,
        embedding: response.data[0].embedding,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens
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

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: messages,
        tools: tools,
        tool_choice: options.toolChoice || 'auto',
        temperature: options.temperature || 0.1
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        toolCalls: response.choices[0].message.tool_calls
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 格式化提示（OpenAI 风格）
  formatPrompt(prompt, context = {}) {
    let formattedPrompt = prompt;
    
    if (context.system) {
      formattedPrompt = `System: ${context.system}\n\n${formattedPrompt}`;
    }
    
    if (context.examples) {
      formattedPrompt += '\n\nExamples:\n';
      context.examples.forEach(example => {
        formattedPrompt += `Q: ${example.question}\nA: ${example.answer}\n`;
      });
    }
    
    return formattedPrompt;
  }

  // 解析响应
  parseResponse(response) {
    return response;
  }

  // 获取支持的 OpenAI 模型列表
  static getSupportedModels() {
    return [
      { name: 'gpt-4-turbo', description: 'OpenAI GPT-4 Turbo 模型' },
      { name: 'gpt-4', description: 'OpenAI GPT-4 模型' },
      { name: 'gpt-3.5-turbo', description: 'OpenAI GPT-3.5 Turbo 模型' },
      { name: 'text-embedding-3-small', description: 'OpenAI 文本嵌入模型' },
      { name: 'text-embedding-3-large', description: 'OpenAI 文本嵌入模型' }
    ];
  }

  // 验证配置
  validateConfig() {
    super.validateConfig();
    
    if (!this.apiKey) {
      throw new Error('OpenAI API 密钥未配置');
    }
  }
}

module.exports = OpenAIModel;
