import { deepseek } from '@ai-sdk/deepseek';
import { generateObject, NoObjectGeneratedError } from "ai"
import { z } from "zod"
import yahooFinance from 'yahoo-finance2'

function addMonths(date: Date, months: number) {
  date.setMonth(date.getMonth() + months);
  return date;
}

const tradeAnalysisSchema = z.object({
  trade_analysis: z.object({
    asset: z.string(),
    date_time: z.string(),
    market_conditions: z.object({
      trend: z.enum(["uptrend", "downtrend", "sideways"]),
      support_levels: z.array(z.number()).default([]),
      resistance_levels: z.array(z.number()).default([]),
      breakout_points: z.array(z.number()).default([]),
      breakdown_points: z.array(z.number()).default([]),
      divergences: z.string().default(""),
      volume_analysis: z.string().default(""),
    }),
    technical_indicators: z.object({
      moving_averages: z.object({
        MA20: z.number().default(0),
        MA50: z.number().default(0),
        MA200: z.number().default(0),
      }),
      RSI: z.number().default(50),
      MACD: z.object({
        value: z.number().default(0),
        signal: z.number().default(0),
      }),
      bollinger_bands: z.object({
        upper: z.number().default(0),
        middle: z.number().default(0),
        lower: z.number().default(0),
      }),
    }),
    trade_plan: z.object({
      direction: z.enum(["long", "short"]),
      entry_zone: z.object({
        min: z.number(),
        max: z.number(),
      }),
      stop_loss: z.number(),
      take_profit_targets: z.array(z.number()).default([]),
      position_size_lot: z.number().default(0),
      lot_size_basis: z.string().default(""),
      estimated_capital_used: z.number().default(0),
      risk_reward_ratio: z.number().default(0),
      risk_percent: z.number().default(0),
    }),
    simple_conclusion: z.object({
      summary: z.string(),
      entry: z.string(),
      stop_loss: z.number(),
      take_profit: z.array(z.number()).default([]),
      decision: z.enum(["Buy", "Sell", "Wait"]),
      suggested_lot: z.number().default(0),
      buy_price_per_share: z.number().default(0),
      total_buy_cost: z.number().default(0),
      sell_targets: z.array(z.number()).default([]),
      currency: z.string().default("USD"),
      confidence: z.number().default(0),
      broker_note: z.string().default(""),
    }),
  }),
})

export async function POST(req: Request) {
  try {
    const { asset, investment } = await req.json()

    if (!asset || !investment) {
      return Response.json({ error: "Asset and investment amount are required" }, { status: 400 })
    }

     // 1. Ambil harga real-time + candle
    const quote = await yahooFinance.quote(asset)
    const history = await yahooFinance.chart(asset, {
      period1: addMonths(new Date(), -3),   // start date
      period2: new Date(),     // end date (today)
      interval: "1d",          // daily candles
      includePrePost: false,
      return: "object"
    });

    // Ambil closing price terakhir
    const lastClose = history.indicators.quote.at(-1)?.close ?? 0
    const lastVolume = history.indicators.quote.at(-1)?.volume ?? 0


    const prompt = `
    Act as an experienced day trader and trading coach. Your objective is to analyze the price and volume patterns of "${asset}" for a potential trade with an investment amount of IDR ${investment} to identify potential buying or selling opportunities. 
    Utilize advanced charting tools and technical indicators to scrutinize both short-term and long-term patterns, taking into account historical data and recent market movements. 
    Assess the correlation between price and volume to gauge the strength or weakness of a particular price trend. 
    Provide a comprehensive analysis report that details potential breakout or breakdown points, support and resistance levels, and any anomalies or divergences noticed. 
    Your analysis should be backed by logical reasoning and should include potential risk and reward scenarios. Always adhere to best practices in technical analysis and maintain the highest standards of accuracy and objectivity.
    For the asset and investment amount, analyze its price and volume patterns to identify trading opportunities. Use technical indicators (MA, RSI, MACD, Bollinger Bands, Fibonacci, volume analysis, etc.) and determine the overall trend, support/resistance, breakout/breakdown points, and divergences.

    Current price: ${lastClose}
    Current volume: ${lastVolume}
    Recent OHLC (3 months daily): ${JSON.stringify(history.indicators.quote.slice(-30))}

    IMPORTANT: You must respond with ONLY a valid JSON object, no additional text before or after. The response must strictly follow this exact format:

    {
      "trade_analysis": {
        "asset": "string",
        "date_time": "YYYY-MM-DD HH:MM:SS",
        "market_conditions": {
          "trend": "uptrend | downtrend | sideways",
          "support_levels": [ "float" ],
          "resistance_levels": [ "float" ],
          "breakout_points": [ "float" ],
          "breakdown_points": [ "float" ],
          "divergences": "string",
          "volume_analysis": "string"
        },
        "technical_indicators": {
          "moving_averages": {
            "MA20": "float",
            "MA50": "float",
            "MA200": "float"
          },
          "RSI": "float",
          "MACD": { "value": "float", "signal": "float" },
          "bollinger_bands": { "upper": "float", "middle": "float", "lower": "float" }
        },
        "trade_plan": {
          "direction": "long | short",
          "entry_zone": { "min": "float", "max": "float" },
          "stop_loss": "float",
          "take_profit_targets": [ "float" ],
          "position_size_lot": "int",
          "lot_size_basis": "string",
          "estimated_capital_used": "float",
          "risk_reward_ratio": "float",
          "risk_percent": "float"
        },
        "simple_conclusion": {
          "summary": "string",
          "entry": "float range",
          "stop_loss": "float",
          "take_profit": [ "float" ],
          "decision": "Buy | Sell | Wait",
          "suggested_lot": "int",
          "buy_price_per_share": "float",
          "total_buy_cost": "float",
          "sell_targets": [ "float" ],
          "currency": "string",
          "confidence": "float",
          "broker_note": "string"
        }
      }
    }
    `

    try{
      const { object } = await generateObject({
        // model: openai("gpt-4o"),
        model: deepseek('deepseek-chat'),
        schema: tradeAnalysisSchema,
        prompt,
      });
      return Response.json(object)

    }catch(error){
      if (NoObjectGeneratedError.isInstance(error)) {
        console.log('NoObjectGeneratedError');
        console.log('Cause:', error.cause);
        console.log('Text:', error.text);
        console.log('Response:', error.response);
        console.log('Usage:', error.usage);
        console.log('Finish Reason:', error.finishReason);

        // Try to parse the text as JSON manually
        if (error.text) {
          try {
            const parsedJson = JSON.parse(error.text);
            return Response.json(parsedJson);
          } catch (parseError) {
            console.log('Failed to parse response as JSON:', parseError);

            // Return the raw text response with error indication
            return Response.json({
              error: "Failed to generate structured response",
              raw_text: error.text,
              suggestion: "The AI provided a response but it doesn't match the expected format"
            }, { status: 200 });
          }
        }

        return Response.json({
          error: "No valid response generated",
          details: "The AI model didn't return any usable content"
        }, { status: 500 });
      }

      // Handle other types of errors
      console.error('Other generateObject error:', error);
      return Response.json({
        error: "Failed to generate analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error analyzing trade:", error)
    return Response.json({ error: "Failed to analyze trade" }, { status: 500 })
  }
}
