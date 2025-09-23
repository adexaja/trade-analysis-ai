"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Activity, DollarSign, Target, BarChart3, Brain } from "lucide-react"
import { TradeAnalysisResult } from "@/components/trade-analysis-result"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"

interface TradeAnalysis {
  trade_analysis: {
    asset: string
    date_time: string
    market_conditions: {
      trend: "uptrend" | "downtrend" | "sideways"
      support_levels: number[]
      resistance_levels: number[]
      breakout_points: number[]
      breakdown_points: number[]
      divergences: string
      volume_analysis: string
    }
    technical_indicators: {
      moving_averages: {
        MA20: number
        MA50: number
        MA200: number
      }
      RSI: number
      MACD: { value: number; signal: number }
      bollinger_bands: { upper: number; middle: number; lower: number }
    }
    trade_plan: {
      direction: "long" | "short"
      entry_zone: { min: number; max: number }
      stop_loss: number
      take_profit_targets: number[]
      position_size_lot: number
      lot_size_basis: string
      estimated_capital_used: number
      risk_reward_ratio: number
      risk_percent: number
    }
    simple_conclusion: {
      summary: string
      entry: string
      stop_loss: number
      take_profit: number[]
      decision: "Buy" | "Sell" | "Wait"
      suggested_lot: number
      buy_price_per_share: number
      total_buy_cost: number
      sell_targets: number[]
      currency: string
      confidence: number
      broker_note: string
    }
  }
}

export function TradingAnalysisSystem() {
  const [asset, setAsset] = useState("")
  const [investment, setInvestment] = useState("")
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!asset || !investment) return

    setLoading(true)

    try {
      const response = await fetch("/api/analyze-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset,
          investment: Number.parseFloat(investment),
        }),
      })

      if (!response.ok) {
        console.log(response)
        throw new Error("Failed to analyze trade")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing trade:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-balance">AI Trading Analysis & Coach</h1>
        </div>
        <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
          Get intelligent trade analysis powered by AI. Input your asset and investment amount to receive comprehensive
          trading recommendations with clear buy/sell signals.
        </p>
        <div className="flex justify-center">
          <Link href="/demo" className="text-sm text-primary hover:underline flex items-center gap-1">
            View Demo Analysis →
          </Link>
        </div>
      </div>

      {/* Input Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trade Analysis Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Asset Symbol</Label>
              <Input
                id="asset"
                placeholder="e.g., AAPL, TSLA, BTC/USD"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment">Investment Amount (IDR)</Label>
              <Input
                id="investment"
                type="number"
                placeholder="e.g., 1000"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={!asset || !investment || loading} className="w-full" size="lg">
            {loading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Analyzing Trade...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Analyze Trade
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && <TradeAnalysisResult analysis={analysis} />}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold">Smart Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered buy/sell signals with clear visual indicators and confidence scores.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Risk Management</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive risk analysis with stop-loss and take-profit targets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-semibold">Position Sizing</h3>
            <p className="text-sm text-muted-foreground">
              Optimal position sizing based on your investment amount and risk tolerance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
