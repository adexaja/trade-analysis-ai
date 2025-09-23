import { google } from '@ai-sdk/google';
import { generateObject } from "ai"
import { z } from "zod"

const tradeAnalysisSchema = z.object({
  trade_analysis: z.object({
    asset: z.string(),
    date_time: z.string(),
    market_conditions: z.object({
      trend: z.enum(["uptrend", "downtrend", "sideways"]),
      support_levels: z.array(z.number()),
      resistance_levels: z.array(z.number()),
      breakout_points: z.array(z.number()),
      breakdown_points: z.array(z.number()),
      divergences: z.string(),
      volume_analysis: z.string(),
    }),
    technical_indicators: z.object({
      moving_averages: z.object({
        MA20: z.number(),
        MA50: z.number(),
        MA200: z.number(),
      }),
      RSI: z.number(),
      MACD: z.object({
        value: z.number(),
        signal: z.number(),
      }),
      bollinger_bands: z.object({
        upper: z.number(),
        middle: z.number(),
        lower: z.number(),
      }),
    }),
    trade_plan: z.object({
      direction: z.enum(["long", "short"]),
      entry_zone: z.object({
        min: z.number(),
        max: z.number(),
      }),
      stop_loss: z.number(),
      take_profit_targets: z.array(z.number()),
      position_size_lot: z.number(),
      lot_size_basis: z.string(),
      estimated_capital_used: z.number(),
      risk_reward_ratio: z.number(),
      risk_percent: z.number(),
    }),
    simple_conclusion: z.object({
      summary: z.string(),
      entry: z.string(),
      stop_loss: z.number(),
      take_profit: z.array(z.number()),
      decision: z.enum(["Buy", "Sell", "Wait"]),
      suggested_lot: z.number(),
      buy_price_per_share: z.number(),
      total_buy_cost: z.number(),
      sell_targets: z.array(z.number()),
      currency: z.string(),
      confidence: z.number(),
      broker_note: z.string(),
    }),
  }),
})

export async function POST(req: Request) {
  try {
    const { asset, investment } = await req.json()

    if (!asset || !investment) {
      return Response.json({ error: "Asset and investment amount are required" }, { status: 400 })
    }

    const prompt = `
    Act as an experienced day trader and trading coach. Your objective is to analyze the price and volume patterns of "${asset}" for a potential trade with an investment amount of IDR $${investment} to identify potential buying or selling opportunities. 
    Utilize advanced charting tools and technical indicators to scrutinize both short-term and long-term patterns, taking into account historical data and recent market movements. 
    Assess the correlation between price and volume to gauge the strength or weakness of a particular price trend. 
    Provide a comprehensive analysis report that details potential breakout or breakdown points, support and resistance levels, and any anomalies or divergences noticed. 
    Your analysis should be backed by logical reasoning and should include potential risk and reward scenarios. Always adhere to best practices in technical analysis and maintain the highest standards of accuracy and objectivity.
    For the asset and investment amount, analyze its price and volume patterns to identify trading opportunities. Use technical indicators (MA, RSI, MACD, Bollinger Bands, Fibonacci, volume analysis, etc.) and determine the overall trend, support/resistance, breakout/breakdown points, and divergences.

    Always output a single JSON object in this format:

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

    const { object } = await generateObject({
      // model: openai("gpt-4o"),
      model: google('gemini-2.5-flash'),
      schema: tradeAnalysisSchema,
      prompt,
      maxOutputTokens: 2000,
    })

    console.log(object);

    return Response.json(object)
  } catch (error) {
    console.error("Error analyzing trade:", error)
    return Response.json({ error: "Failed to analyze trade" }, { status: 500 })
  }
}
