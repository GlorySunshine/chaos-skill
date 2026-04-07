/**
 * 混沌思维蒸馏系统 - 配置文件
 * 
 * 包含系统的所有配置信息，支持环境变量覆盖
 */

module.exports = {
  // 系统基本信息
  version: '1.0.0',
  name: '混沌思维蒸馏系统',
  description: '超越单一视角的多维度思维分析平台',
  
  // API 配置
  api: {
    port: process.env.PORT || 3000,
    timeout: 60000, // 60秒
    cors: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 最大请求数
    }
  },
  
  // OpenAI 配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 4096
  },
  
  // 思维模型配置
  models: {
    // 默认激活的模型数量
    defaultCount: 5,
    
    // 模型碰撞强度：low/medium/high
    collisionIntensity: 'high',
    
    // 质量验证配置
    quality: {
      consistencyThreshold: 0.7, // 一致性阈值
      uncertaintyThreshold: 0.15, // 不确定性容忍度
      validationQuestions: 3 // 验证问题数量
    }
  },
  
  // 思维蒸馏配置
  distillation: {
    // 信息采集配置
    research: {
      timeout: 30000, // 30秒超时
      maxSources: 10, // 最大信息源数量
      retryCount: 3 // 重试次数
    },
    
    // 验证机制配置
    verification: {
      crossValidation: true,
      uncertaintyCalculation: true,
      qualityAssessment: true
    }
  },
  
  // 数据库配置
  database: {
    type: 'sqlite', // sqlite/postgresql/mongodb
    path: './data/chaos-skill.db',
    logging: false
  },
  
  // 文件存储配置
  storage: {
    modelsPath: './models',
    cachePath: './cache',
    logsPath: './logs'
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info', // error/warn/info/debug
    file: './logs/chaos-skill.log',
    maxSize: '100MB',
    maxFiles: '14d'
  },
  
  // 安全配置
  security: {
    apiKey: process.env.API_KEY || '',
    cors: {
      origin: ['http://localhost:3000', 'https://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    rateLimit: true
  },
  
  // 性能配置
  performance: {
    cache: {
      enabled: true,
      ttl: 3600 // 1小时
    },
    concurrency: {
      max: 10,
      timeout: 120000 // 2分钟
    }
  },
  
  // 开发配置
  development: {
    debug: process.env.NODE_ENV === 'development',
    hotReload: process.env.HOT_RELOAD === 'true',
    autoUpdate: true
  },
  
  // 思维模型库配置
  modelLibrary: {
    // 人物思维模型（18个）
    personas: [
      'elon-musk', 'steve-jobs', 'zhangyiming', 'paul-graham',
      'charlie-munger', 'warren-buffett', 'nassim-taleb',
      'richard-feynman', 'einstein', 'stephen-hawking',
      'renzhengfei', 'jack-ma', 'pony-ma',
      'nietzsche', 'socrates', 'laozi'
    ],
    
    // 主题思维模型（5个）
    themes: [
      'complexity-science', 'innovation-thinking', 'decision-science',
      'psychology', 'futurism'
    ]
  },
  
  // 质量保证配置
  qualityAssurance: {
    // 三重验证机制
    tripleValidation: true,
    // 质量分数计算
    qualityScoring: {
      consistency: 0.4,
      depth: 0.3,
      creativity: 0.2,
      practicality: 0.1
    },
    // 不确定性评估
    uncertaintyAssessment: true,
    // 持续学习配置
    continuousLearning: {
      enabled: true,
      learningRate: 0.1
    }
  }
};
