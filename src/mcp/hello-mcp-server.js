import * as readline from "readline";
import { stdin as input, stdout as output } from "process";

// MCP服务器通过标准输入/输出进行通信
const rl = readline.createInterface({ input, output });

rl.on("line", (line) => {
  let req;
  try {
    req = JSON.parse(line);
  } catch (err) {
    console.error(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      }),
    );
    return;
  }

  switch (req.method) {
    case "initialize":
      handleInitialize(req);
      break;
    case "tools/list":
      handleToolsList(req);
      break;
    case "tools/call":
      handleToolCall(req);
      break;
    case "notifications/initialized":
      // 客户端发送的初始化完成通知，无需响应
      break;
    default:
      sendError(req.id, -32601, "Method not found");
  }
});

// handleInitialize负责向Claude Code"自我介绍"
function handleInitialize(req) {
  const initializeResult = {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: "hello-server",
      version: "1.0.0",
    },
  };
  sendResult(req.id, initializeResult);
}

// handleToolsList返回可用工具列表
function handleToolsList(req) {
  const toolsListResult = {
    tools: [
      {
        name: "greet",
        description: "A simple tool that returns a greeting.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the person to greet.",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
  sendResult(req.id, toolsListResult);
}

// handleToolCall负责处理工具的实际调用
function handleToolCall(req) {
  const params = req.params || {};
  const toolName = params.name;

  if (toolName !== "greet") {
    sendError(req.id, -32601, "Tool not found");
    return;
  }

  const toolArguments = params.arguments || {};
  const name = toolArguments.name;

  const greeting = `Hello, ${name}! Welcome to the world of MCP in Go.`;

  const toolResult = {
    content: [
      {
        type: "text",
        text: greeting,
      },
    ],
  };
  sendResult(req.id, toolResult);
}

// sendResult和sendError是辅助函数，用于向stdout发送格式化的JSON-RPC响应
function sendResult(id, result) {
  sendJSON({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  sendJSON({ jsonrpc: "2.0", id, error: { code, message } });
}

function sendJSON(v) {
  // MCP协议要求每个JSON对象后都有一个换行符
  console.log(JSON.stringify(v));
}
