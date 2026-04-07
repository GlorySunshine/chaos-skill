const fs = require('fs');
const path = require('path');
const ModelManager = require('./models/model-manager');
const config = require('../config');

class ChaosSkill {
  constructor(customConfig = {}) {
    // 合并配置
    this.config = { ...config, ...customConfig };
    
    // 初始化模型管理器
    this.modelManager = new ModelManager(this.config.models);
    
    // 初始化思维模型库
    this.models = new Map();
    
    // 加载内置思维模型
    this.loadBuiltInModels();
    
    // 初始化数据库连接
    this.initDatabase();
    
    // 初始化缓存
    this.initCache();
    
    console.log(`混沌思维蒸馏系统初始化成功`);
    console.log(`已加载 ${this.models.size} 个思维模型`);
    
    // 打印模型系统状态
    const systemStatus = this.modelManager.getSystemStatus();
    console.log(`模型系统状态:`, systemStatus);
  }
  
  // 加载内置思维模型
  loadBuiltInModels() {
    const modelsPath = this.config.storage.modelsPath;
    
    if (fs.existsSync(modelsPath)) {
      const modelFiles = fs.readdirSync(modelsPath);
      
      modelFiles.forEach(file => {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          try {
            const content = fs.readFileSync(path.join(modelsPath, file), 'utf8');
            const model = this.parseModelFile(content);
            this.models.set(model.name, model);
          } catch (error) {
            console.error(`加载模型文件 ${file} 失败:`, error);
          }
        }
      });
    }
  }
  
  // 解析模型文件
  parseModelFile(content) {
    // 简单的模型文件解析逻辑
    // 实际项目中需要更复杂的解析
    if (content.startsWith('{')) {
      // JSON 格式
      return JSON.parse(content);
    } else {
      // Markdown 格式
      return this.parseMarkdownModel(content);
    }
  }
  
  // 解析 Markdown 格式的模型
  parseMarkdownModel(content) {
    // 提取 YAML 前导元数据
    const yamlMatch = content.match(/---\s*([\s\S]*?)\s*---/);
    let frontMatter = {};
    
    if (yamlMatch) {
      // 简单的 YAML 解析（实际项目中需要使用 yaml 库）
      const yamlContent = yamlMatch[1];
      const lines = yamlContent.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split(':').map(s => s.trim());
          frontMatter[key] = value;
        }
      });
    }
    
    return {
      name: frontMatter.name || 'Unnamed Model',
      description: frontMatter.description || '无描述',
      content: content,
      metadata: frontMatter
    };
  }
  
  // 初始化数据库
  initDatabase() {
    // 这里可以实现数据库初始化逻辑
    // 实际项目中应该使用 Sequelize 或其他 ORM
    const dbPath = this.config.database.path;
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    console.log('数据库初始化完成');
  }
  
  // 初始化缓存
  initCache() {
    const cachePath = this.config.storage.cachePath;
    
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }
    
    this.cache = new Map();
    console.log('缓存系统初始化完成');
  }
  
  // 获取所有模型
  getModels() {
    return Array.from(this.models.values());
  }
  
  // 获取模型数量
  getModelCount() {
    return this.models.size;
  }
  
  // 添加思维模型
  addModel(modelData) {
    if (!modelData.name) {
      throw new Error('模型名称不能为空');
    }
    
    this.models.set(modelData.name, modelData);
    
    // 保存到文件
    this.saveModel(modelData);
    
    return modelData;
  }
  
  // 保存模型到文件
  saveModel(modelData) {
    const modelsPath = this.config.storage.modelsPath;
    
    if (!fs.existsSync(modelsPath)) {
      fs.mkdirSync(modelsPath, { recursive: true });
    }
    
    const fileName = `${modelData.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filePath = path.join(modelsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
    console.log(`模型 ${modelData.name} 已保存到 ${filePath}`);
  }
  
  // 思维蒸馏核心方法
  async distill(question, context = '', options = {}) {
    console.log(`开始思维蒸馏: ${question}`);
    
    // 1. 智能场景识别
    const scenario = await this.recognizeScenario(question, context);
    console.log(`识别场景: ${scenario}`);
    
    // 2. 模型选择
    const selectedModels = await this.selectModels(question, context, scenario, options);
    console.log(`选中模型: ${selectedModels.map(m => m.name).join(', ')}`);
    
    // 3. 思维碰撞
    const collisionResult = await this.collision(selectedModels, question, context);
    console.log('思维碰撞完成');
    
    // 4. 混沌融合
    const fusedResult = await this.fusion(collisionResult, question, context);
    console.log('混沌融合完成');
    
    // 5. 质量验证
    const verification = await this.verify(fusedResult);
    console.log(`质量分数: ${verification.qualityScore}`);
    
    // 6. 结果格式化
    const formattedResult = this.formatResult(fusedResult, verification, selectedModels, scenario);
    
    return formattedResult;
  }
  
  // 智能场景识别
  async recognizeScenario(question, context) {
    // 简单的场景识别逻辑
    const questionLower = question.toLowerCase();
    const contextLower = context.toLowerCase();
    
    if (questionLower.includes('决策') || questionLower.includes('选择') || questionLower.includes('战略')) {
      return 'decision-making';
    } else if (questionLower.includes('创新') || questionLower.includes('创造') || questionLower.includes('设计')) {
      return 'innovation';
    } else if (questionLower.includes('问题') || questionLower.includes('解决') || questionLower.includes('如何')) {
      return 'problem-solving';
    } else if (questionLower.includes('趋势') || questionLower.includes('分析') || questionLower.includes('预测')) {
      return 'analysis';
    }
    
    return 'general';
  }
  
  // 模型选择
  async selectModels(question, context, scenario, options = {}) {
    const count = options.modelCount || 5;
    const intensity = options.collisionIntensity || 'high';
    
    // 简单的模型选择逻辑
    // 实际项目中应该根据语义相似度和场景匹配度来选择
    const allModels = Array.from(this.models.values());
    const selectedModels = [];
    
    // 按场景权重选择模型
    for (let model of allModels) {
      const score = this.calculateModelScore(model, question, context, scenario);
      
      if (score > 0.6) {
        selectedModels.push({
          model,
          score
        });
      }
    }
    
    // 排序并选择前 count 个
    selectedModels.sort((a, b) => b.score - a.score);
    
    const finalModels = selectedModels.slice(0, count).map(item => item.model);
    
    // 如果没有足够的模型，补充通用模型
    if (finalModels.length < count) {
      const generalModels = allModels.filter(m => m.metadata?.type === 'general');
      finalModels.push(...generalModels.slice(0, count - finalModels.length));
    }
    
    return finalModels;
  }
  
  // 计算模型匹配分数
  calculateModelScore(model, question, context, scenario) {
    // 简单的匹配分数计算
    let score = 0;
    
    // 关键词匹配
    const keywords = model.metadata?.keywords || [];
    const questionLower = question.toLowerCase();
    const contextLower = context.toLowerCase();
    
    keywords.forEach(keyword => {
      if (questionLower.includes(keyword.toLowerCase()) || contextLower.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    });
    
    // 场景匹配
    if (model.metadata?.scenarios?.includes(scenario)) {
      score += 0.3;
    }
    
    // 类型匹配
    if (model.metadata?.type === 'general') {
      score += 0.1;
    }
    
    // 质量分数
    score += (model.metadata?.qualityScore || 0.8) * 0.4;
    
    return Math.min(1.0, score);
  }
  
  // 思维碰撞
  async collision(models, question, context) {
    const results = [];
    
    for (let i = 0; i < models.length; i++) {
      for (let j = i + 1; j < models.length; j++) {
        const model1 = models[i];
        const model2 = models[j];
        
        const collisionResult = await this.collisionTwoModels(
          model1, 
          model2, 
          question, 
          context
        );
        
        results.push(collisionResult);
      }
    }
    
    return results;
  }
  
  // 两个模型的思维碰撞
  async collisionTwoModels(model1, model2, question, context) {
    const prompt = `
请从两个不同的思维视角分析以下问题：

问题：${question}

上下文信息：${context}

思维视角1（${model1.name}）：
${model1.description}
核心思维模型：${model1.metadata?.coreModels?.join(', ') || '未定义'}
决策启发式：${model1.metadata?.decisionHeuristics?.join(', ') || '未定义'}

思维视角2（${model2.name}）：
${model2.description}
核心思维模型：${model2.metadata?.coreModels?.join(', ') || '未定义'}
决策启发式：${model2.metadata?.decisionHeuristics?.join(', ') || '未定义'}

请分析：
1. 两个思维视角对问题的理解有什么不同？
2. 它们的分析方法和结论有哪些冲突或互补的地方？
3. 如果将这两种思维方式结合起来，会产生什么新的洞察？
4. 这种思维碰撞对解决问题有什么帮助？

请以结构化的方式回答，包括：
- 不同点分析
- 冲突/互补分析
- 新洞察
- 实际应用建议
`;
    
    try {
      const response = await this.modelManager.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 2048
      });
      
      return {
        model1: model1.name,
        model2: model2.name,
        analysis: response.content,
        timestamp: new Date().toISOString(),
        usage: response.usage
      };
    } catch (error) {
      console.error(`思维碰撞失败 (${model1.name} vs ${model2.name}):`, error);
      return {
        model1: model1.name,
        model2: model2.name,
        analysis: '思维碰撞过程中发生错误',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // 混沌融合
  async fusion(collisionResults, question, context) {
    const prompt = `
根据以下思维碰撞分析结果，进行混沌融合：

问题：${question}
上下文信息：${context}

思维碰撞结果：
${collisionResults.map(result => `
---
${result.model1} vs ${result.model2}
${result.analysis}
`).join('')}

请完成以下工作：
1. 识别所有思维碰撞中的关键洞察
2. 分析洞察之间的关系和层次
3. 整合形成一个统一的分析框架
4. 识别潜在的矛盾和不确定性
5. 提供综合的解决方案和建议

要求：
- 结构清晰，层次分明
- 突出创新洞察
- 包含不确定性分析
- 提供可操作的建议
`;
    
    try {
      const response = await this.modelManager.generateText(prompt, {
        temperature: 0.6,
        maxTokens: 4096
      });
      
      return response.content;
    } catch (error) {
      console.error('混沌融合失败:', error);
      return '混沌融合过程中发生错误';
    }
  }
  
  // 质量验证
  async verify(result) {
    const prompt = `
请对以下思维分析结果进行质量验证：

分析结果：${result}

验证标准：
1. 维度一致性：是否从多个视角分析问题？
2. 深度分析：是否深入到问题的本质？
3. 创新性：是否有独特的见解？
4. 实用性：建议是否可操作？
5. 不确定性：是否合理评估了不确定性？

请返回以下内容：
- 质量分数 (0-100)
- 各项评分的详细说明
- 需要改进的地方
- 不确定性评估
`;
    
    try {
      const response = await this.modelManager.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1024
      });
      
      // 解析验证结果
      return this.parseVerification(response.content);
    } catch (error) {
      console.error('验证失败:', error);
      return {
        qualityScore: 50,
        detailedScores: {
          consistency: 50,
          depth: 50,
          creativity: 50,
          practicality: 50,
          uncertainty: 50
        },
        improvements: '验证过程中发生错误',
        uncertainty: 0.5
      };
    }
  }
  
  // 解析验证结果
  parseVerification(verificationText) {
    // 简单的验证结果解析
    const qualityScoreMatch = verificationText.match(/质量分数\s*([\d.]+)/);
    const qualityScore = qualityScoreMatch ? parseFloat(qualityScoreMatch[1]) : 60;
    
    return {
      qualityScore,
      detailedScores: {
        consistency: 0.8,
        depth: 0.7,
        creativity: 0.6,
        practicality: 0.75,
        uncertainty: 0.8
      },
      improvements: '需要更多实际应用例子',
      uncertainty: 0.1
    };
  }
  
  // 结果格式化
  formatResult(fusedResult, verification, selectedModels, scenario) {
    return {
      question: fusedResult.question || '',
      analysis: fusedResult,
      verification,
      models: selectedModels.map(m => ({
        name: m.name,
        description: m.description,
        qualityScore: m.metadata?.qualityScore || 0.8
      })),
      scenario,
      timestamp: new Date().toISOString(),
      uncertainty: verification.uncertainty,
      suggestions: this.generateSuggestions(fusedResult)
    };
  }
  
  // 生成实际应用建议
  generateSuggestions(result) {
    // 简单的建议生成逻辑
    return [
      '将思维碰撞的结果应用到实际问题中进行验证',
      '与团队成员分享并讨论不同的思维视角',
      '根据实际效果调整分析方法和模型选择',
      '定期回顾和优化思维碰撞的过程'
    ];
  }
  
  // 打印系统状态
  printSystemStatus() {
    console.log('');
    console.log('系统状态');
    console.log('============');
    console.log(`版本: ${this.config.version}`);
    console.log(`模型数量: ${this.models.size}`);
    
    const modelStatus = this.modelManager.getSystemStatus();
    console.log(`当前大模型: ${modelStatus.currentModel?.provider}-${modelStatus.currentModel?.model}`);
    console.log(`可用大模型数量: ${modelStatus.totalModels}`);
    console.log('');
  }
  
  // 清理资源
  async cleanup() {
    console.log('正在清理资源...');
    // 关闭数据库连接
    // 清理缓存
    this.cache.clear();
    console.log('资源清理完成');
  }
}

module.exports = ChaosSkill;
