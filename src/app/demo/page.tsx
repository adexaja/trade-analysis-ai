import { TradeAnalysisResult } from "@/components/trade-analysis-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"

const demoAnalysis = {
  trade_analysis: {
    asset: "BTC/USDT",
    date_time: "2025-09-22 21:30:00",
    market_conditions: {
      trend: "sideways" as const,
      support_levels: [60800, 58500],
      resistance_levels: [63500, 65200],
      breakout_points: [63600],
      breakdown_points: [60500],
      divergences: "RSI shows mild bearish divergence while MACD histogram is flattening, indicating loss of momentum.",
      volume_analysis:
        "Volume decreasing during recent upward moves, showing weak buying pressure; sideways accumulation likely before next trend.",
    },
    technical_indicators: {
      moving_averages: {
        MA20: 62100,
        MA50: 61550,
        MA200: 59000,
      },
      RSI: 52.4,
      MACD: { value: 48, signal: 50 },
      bollinger_bands: { upper: 63550, middle: 62100, lower: 60650 },
    },
    trade_plan: {
      direction: "long" as const,
      entry_zone: { min: 61000, max: 61800 },
      stop_loss: 60200,
      take_profit_targets: [63200, 64800],
      position_size_lot: 0,
      lot_size_basis: "fractional BTC (satoshi) purchase",
      estimated_capital_used: 1000000,
      risk_reward_ratio: 1.8,
      risk_percent: 2.0,
    },
    simple_conclusion: {
      summary:
        "BTC is consolidating sideways near 62K with narrowing Bollinger Bands. Best strategy is buy on weakness around 61K–61.8K with tight stop loss below 60.2K.",
      entry: "61000–61800",
      stop_loss: 60200,
      take_profit: [63200, 64800],
      decision: "Buy" as const,
      suggested_lot: 1,
      buy_price_per_share: 61500,
      total_buy_cost: 1000000,
      sell_targets: [63200, 64800],
      currency: "IDR",
      confidence: 0.72,
      broker_note: "Use fractional BTC purchase since capital is small; prioritize tight stop-loss management.",
    },
  },
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Link>
          <Badge variant="secondary" className="text-sm">
            Demo Mode
          </Badge>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance">Demo Analysis Result</h1>
          </div>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            This is a sample analysis showing how the AI trading system presents comprehensive trade recommendations
            with clear visual indicators and actionable insights.
          </p>
        </div>

        {/* Demo Analysis Card */}
        <Card className="max-w-4xl mx-auto border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5" />
              Sample Analysis: BTC/USDT with $1,000,000 IDR Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Generated on: {demoAnalysis.trade_analysis.date_time}</p>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <TradeAnalysisResult analysis={demoAnalysis} />

        {/* Demo Information */}
        <Card className="max-w-4xl mx-auto bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">About This Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This demo showcases the complete analysis output format including:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>
                • <strong>Clear Buy/Sell Decision</strong> with confidence level and visual indicators
              </li>
              <li>
                • <strong>Technical Analysis</strong> including RSI, MACD, Moving Averages, and Bollinger Bands
              </li>
              <li>
                • <strong>Market Conditions</strong> with support/resistance levels and trend analysis
              </li>
              <li>
                • <strong>Risk Management</strong> with stop-loss, take-profit targets, and position sizing
              </li>
              <li>
                • <strong>Actionable Insights</strong> highlighted for quick decision-making
              </li>
            </ul>
            <p className="text-sm text-muted-foreground pt-2">
              The actual system will generate real-time analysis based on your input asset and investment amount.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
