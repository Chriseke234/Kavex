const axios = require('axios');

// In-memory rate limiting (Note: Reset on function cold starts, but good for basic protection)
const rateLimitMap = new Map();

exports.handler = async (event) => {
  // 1. CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const clientIP = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';

  try {
    const { messages, systemPrompt } = JSON.parse(event.body);

    // 2. Validation
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers, body: 'messages array required' };
    }

    // Rate limit check (20 messages/IP/hour)
    const now = Date.now();
    const limit = rateLimitMap.get(clientIP) || { count: 0, firstReq: now };
    
    if (now - limit.firstReq > 3600000) {
      limit.count = 0;
      limit.firstReq = now;
    }

    if (limit.count >= 20) {
      return { statusCode: 429, headers, body: 'Rate limit exceeded. Try again in an hour.' };
    }
    
    limit.count++;
    rateLimitMap.set(clientIP, limit);

    // 3. Call Anthropic
    const response = await axios({
      method: 'post',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      data: {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: systemPrompt || "You are Kavex AI, a helpful B2B trade assistant for Africa's leading marketplace.",
        messages: messages.map(m => ({ role: m.role, content: m.content.slice(0, 500) })),
        stream: true
      },
      responseType: 'stream'
    });

    // 4. Stream response back
    return new Promise((resolve, reject) => {
      let fullResponse = "";
      response.data.on('data', chunk => {
        // Simple SSE forward
        fullResponse += chunk.toString();
      });

      response.data.on('end', () => {
        resolve({
          statusCode: 200,
          headers,
          body: fullResponse
        });
      });

      response.data.on('error', err => reject(err));
    });

  } catch (err) {
    console.error("Claude Proxy Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
