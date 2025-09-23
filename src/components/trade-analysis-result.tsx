"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Target, Shield, DollarSign, Activity, AlertTriangle } from "lucide-react"

interface TradeAnalysisProps {
  analysis: {
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
}

export function TradeAnalysisResult({ analysis }: TradeAnalysisProps) {
  const { trade_analysis } = analysis

  if (!trade_analysis) {
    return  <div className="space-y-6"><Card className="border-2"><div>Failed to load analysis</div></Card></div>
  }

  const { simple_conclusion, market_conditions, technical_indicators, trade_plan } = trade_analysis
  const formatUang = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "Buy":
        return <TrendingUp className="h-6 w-6 text-success" />
      case "Sell":
        return <TrendingDown className="h-6 w-6 text-destructive" />
      default:
        return <Minus className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "Buy":
        return "bg-success text-success-foreground"
      case "Sell":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "uptrend":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "downtrend":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "text-destructive"
    if (rsi < 30) return "text-success"
    return "text-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Main Decision Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3">
              {getDecisionIcon(simple_conclusion.decision)}
              {trade_analysis.asset} Analysis
            </CardTitle>
            <Badge className={`text-lg px-4 py-2 ${getDecisionColor(simple_conclusion.decision)}`}>
             {simple_conclusion.decision}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence & Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Confidence Level</span>
              <span className="font-bold">{(simple_conclusion.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={simple_conclusion.confidence * 100} className="h-2" />
            <p className="text-muted-foreground text-pretty">{simple_conclusion.summary}</p>
          </div>

          <Separator />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">Entry Price</span>
              </div>
              <p className="text-2xl font-bold">{formatIDR(simple_conclusion.buy_price_per_share)}</p>
              <p className="text-sm text-muted-foreground">Per Share</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                <span className="font-medium">Stop Loss</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{formatIDR(simple_conclusion.stop_loss)}</p>
              <p className="text-sm text-muted-foreground">Risk Management</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="font-medium">Take Profit</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {simple_conclusion.take_profit[0] ? formatIDR(simple_conclusion.take_profit[0]) : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Primary Target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Trend</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(market_conditions.trend)}
                <span className="font-medium capitalize">{market_conditions.trend}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Support Levels</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {market_conditions.support_levels.map((level, index) => (
                    <Badge key={index} variant="outline" className="text-success border-success">
                      {formatIDR(level)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">Resistance Levels</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {market_conditions.resistance_levels.map((level, index) => (
                    <Badge key={index} variant="outline" className="text-destructive border-destructive">
                      {formatIDR(level)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Volume Analysis</span>
              <p className="text-sm">{market_conditions.volume_analysis}</p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Technical Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Moving Averages */}
            <div className="space-y-2">
              <span className="font-medium">Moving Averages</span>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">MA20</div>
                  <div>{formatIDR(technical_indicators.moving_averages.MA20)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">MA50</div>
                  <div>{formatIDR(technical_indicators.moving_averages.MA50)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">MA200</div>
                  <div>{formatIDR(technical_indicators.moving_averages.MA200)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* RSI */}
            <div className="flex items-center justify-between">
              <span className="font-medium">RSI</span>
              <div className="text-right">
                <div className={`text-lg font-bold ${getRSIColor(technical_indicators.RSI)}`}>
                  {formatNumber(technical_indicators.RSI, 1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {technical_indicators.RSI > 70
                    ? "Overbought"
                    : technical_indicators.RSI < 30
                      ? "Oversold"
                      : "Neutral"}
                </div>
              </div>
            </div>

            <Separator />

            {/* MACD */}
            <div className="space-y-2">
              <span className="font-medium">MACD</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">Value</div>
                  <div>{formatNumber(technical_indicators.MACD.value, 3)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">Signal</div>
                  <div>{formatNumber(technical_indicators.MACD.signal, 3)}</div>
                </div>
              </div>
            </div>
             <Separator />

            {/* Bollinger Bands */}
            <div className="space-y-2">
              <span className="font-medium">Bollinger Bands</span>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">Upper</div>
                  <div>{formatNumber(technical_indicators.bollinger_bands.upper, 3)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">Middle</div>
                  <div>{formatNumber(technical_indicators.bollinger_bands.middle, 3)}</div>
                </div>
                    <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">Lower</div>
                  <div>{formatNumber(technical_indicators.bollinger_bands.lower, 3)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trade Plan & Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Position Size</span>
              <p className="text-xl font-bold">{formatNumber(trade_plan.position_size_lot, 0)} lots</p>
              <p className="text-xs text-muted-foreground">{trade_plan.lot_size_basis}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Capital Used</span>
              <p className="text-xl font-bold">{formatUang(trade_plan.estimated_capital_used)}</p>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Risk/Reward</span>
              <p className="text-xl font-bold">1:{formatNumber(trade_plan.risk_reward_ratio, 1)}</p>
              <p className="text-xs text-muted-foreground">Ratio</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Risk %</span>
              <p className="text-xl font-bold">{formatNumber(trade_plan.risk_percent, 1)}%</p>
              <p className="text-xs text-muted-foreground">Of Capital</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Broker Note */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium">Broker Note</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{simple_conclusion.broker_note}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
