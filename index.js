#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const ChaosSkill = require('./src/chaos-skill');

// 创建 Express 服务器
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 加载配置
const config = require('./config');

// 初始化混沌思维系统
const chaosSystem = new ChaosSkill(config);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: config.version,
    modelCount: chaosSystem.getModelCount(),
    lastUpdate: new Date().toISOString()
  });
});

// 思维蒸馏路由
app.post('/distill', async (req, res) => {
  try {
    const { question, context = '', config = {} } = req.body;
    
    // 执行思维蒸馏
    const result = await chaosSystem.distill(question, context, config);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Distillation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// 模型管理路由
app.get('/models', async (req, res) => {
  try {
    const models = chaosSystem.getModels();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Model fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加模型路由
app.post('/models', async (req, res) => {
  try {
    const { modelData } = req.body;
    const newModel = await chaosSystem.addModel(modelData);
    
    res.json({
      success: true,
      data: newModel
    });
  } catch (error) {
    console.error('Model addition error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 质量验证路由
app.post('/verify', async (req, res) => {
  try {
    const { analysisResult } = req.body;
    const verification = await chaosSystem.verify(analysisResult);
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('混沌思维蒸馏系统正在启动...');
  console.log('版本:', config.version);
  console.log('服务地址:', `http://localhost:${PORT}`);
  console.log('========================================');
  console.log('');
  
  // 打印系统状态
  chaosSystem.printSystemStatus();
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭混沌思维蒸馏系统...');
  await chaosSystem.cleanup();
  console.log('系统已安全关闭');
  process.exit(0);
});
