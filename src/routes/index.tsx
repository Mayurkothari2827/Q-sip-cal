import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { calculateStepUpSip, formatCurrency } from "@/lib/sip";
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Table2,
  Copy,
  RotateCcw,
  Check,
  ChevronDown,
  Info,
  ShieldCheck,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  Plus,
  Minus,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Quarterly Step-Up SIP Calculator — Free Online Tool | Calculate Step-Up SIP Returns",
      },
      {
        name: "description",
        content:
          "Use our free quarterly step-up SIP calculator to see how increasing your SIP every quarter grows your wealth faster. Interactive charts, year-by-year breakdown, invested vs returns analysis, and growth multiples — plan smarter mutual fund investments.",
      },
      {
        property: "og:title",
        content: "Quarterly Step-Up SIP Calculator — Calculate Step-Up SIP Returns Free",
      },
      {
        property: "og:description",
        content:
          "Use our free quarterly step-up SIP calculator to see how increasing your SIP every quarter grows your wealth faster. Interactive charts, year-by-year breakdown, and growth multiples.",
      },
    ],
  }),
  component: Index,
});

/* ─── Compact Rupee Formatter ─── */
function formatCompactInr(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return formatCurrency(val);
}

/* ─── Preset Scenarios ─── */
const PRESETS = [
  { id: "starter", label: "Starter SIP", monthly: 10000, stepUp: 3, returns: 12, years: 10 },
  { id: "balanced", label: "Wealth Builder", monthly: 25000, stepUp: 3, returns: 12, years: 10 },
  { id: "aggressive", label: "High Growth", monthly: 40000, stepUp: 5, returns: 14, years: 15 },
  { id: "retirement", label: "Retirement 20Y", monthly: 20000, stepUp: 4, returns: 13, years: 20 },
];

/* ─── Apple-Grade Donut Chart with Center Metric ─── */
function DonutChart({
  invested,
  returns,
  size = 230,
}: {
  invested: number;
  returns: number;
  size?: number;
}) {
  const total = invested + returns;
  const radius = (size / 230) * 88;
  const strokeWidth = (size / 230) * 24;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  const investedRatio = invested / total;
  const circumference = 2 * Math.PI * radius;
  const investedArc = circumference * investedRatio;
  const returnsArc = circumference * (1 - investedRatio);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible -rotate-90 filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Invested Segment (Electric Slate Blue) */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${investedArc} ${circumference - investedArc}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.5s cubic-bezier(0.2, 0.8, 0.4, 1)",
          }}
        />

        {/* Returns Segment (Emerald Green) */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="oklch(0.75 0.18 160)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${returnsArc} ${circumference - returnsArc}`}
          strokeDashoffset={-investedArc}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dasharray 0.5s cubic-bezier(0.2, 0.8, 0.4, 1), stroke-dashoffset 0.5s cubic-bezier(0.2, 0.8, 0.4, 1)",
          }}
        />
      </svg>

      {/* Center Metrics (Apple Card Inner) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          Total Corpus
        </span>
        <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums tracking-title">
          {formatCompactInr(total)}
        </span>
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
          <ArrowUpRight className="w-3 h-3" />
          {invested > 0 ? (total / invested).toFixed(2) : 0}x Return
        </span>
      </div>
    </div>
  );
}

/* ─── Apple Interactive Field with Stepper Buttons ─── */
type FieldProps = {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  id: string;
};

function AppleField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  id,
}: FieldProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const decrement = () => {
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const increment = () => {
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-foreground/90 tracking-body">
            {label}
          </label>
          {hint && <p className="text-xs text-muted-foreground/80 mt-0.5">{hint}</p>}
        </div>

        {/* Input & Stepper Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={decrement}
            disabled={value <= min}
            aria-label={`Decrease ${label}`}
            className="apple-press-sm inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="groww-input">
            {prefix && (
              <span className="text-xs font-semibold text-emerald-400 select-none">{prefix}</span>
            )}
            <input
              type="number"
              inputMode="decimal"
              id={id}
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) onChange(val);
              }}
              className="w-20 bg-transparent text-right font-bold text-base text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {suffix && (
              <span className="text-xs font-semibold text-muted-foreground select-none">
                {suffix}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={increment}
            disabled={value >= max}
            aria-label={`Increase ${label}`}
            className="apple-press-sm inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smooth Fluid Slider */}
      <div className="pt-2">
        <input
          type="range"
          id={`${id}-slider`}
          aria-label={`${label} slider`}
          className="range-brand"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, oklch(0.75 0.18 160) 0%, oklch(0.75 0.18 160) ${percentage}%, rgba(255, 255, 255, 0.12) ${percentage}%, rgba(255, 255, 255, 0.12) 100%)`,
          }}
        />
        <div className="flex justify-between text-[11px] font-medium text-muted-foreground/60 tabular-nums">
          <span>
            {prefix}
            {min.toLocaleString("en-IN")}
            {suffix}
          </span>
          <span>
            {prefix}
            {max.toLocaleString("en-IN")}
            {suffix}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Custom Apple-Themed Recharts Tooltip ─── */
interface AppleTooltipPayloadItem {
  dataKey?: string | number;
  value?: number;
}

interface AppleChartTooltipProps {
  active?: boolean;
  payload?: AppleTooltipPayloadItem[];
  label?: string | number;
}

function AppleChartTooltip({ active, payload, label }: AppleChartTooltipProps) {
  if (active && payload && payload.length) {
    const invested = payload.find((p) => p.dataKey === "invested")?.value || 0;
    const value = payload.find((p) => p.dataKey === "value")?.value || 0;
    const returns = value - invested;
    const yearNum = typeof label === "number" ? label : Number(label) || 0;

    return (
      <div className="rounded-xl border border-white/15 bg-slate-900/90 backdrop-blur-xl p-3.5 shadow-2xl text-xs text-foreground min-w-[190px]">
        <div className="font-semibold text-sm text-foreground mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
          <span>Year {label}</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            Month {yearNum * 12}
          </span>
        </div>
        <div className="space-y-1.5 tabular-nums">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Invested:
            </span>
            <span className="font-medium text-foreground">{formatCurrency(invested)}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Est. Gain:
            </span>
            <span className="font-medium text-emerald-400">+{formatCurrency(returns)}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-foreground border-t border-white/10 pt-1.5">
            <span>Total Value:</span>
            <span className="text-sm text-emerald-300">{formatCurrency(value)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ─── Main Index Page Component ─── */
function Index() {
  const [monthlySip, setMonthlySip] = useState(25000);
  const [quarterlyStepUp, setQuarterlyStepUp] = useState(3);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const result = useMemo(
    () => calculateStepUpSip({ monthlySip, quarterlyStepUp, annualReturn, years }),
    [monthlySip, quarterlyStepUp, annualReturn, years],
  );

  const maxValue = result.rows.at(-1)?.value || 1;
  const growthMultiple = result.invested > 0 ? result.total / result.invested : 0;
  const finalMonthSip =
    monthlySip *
    Math.pow(1 + quarterlyStepUp / 100, Math.max(0, Math.ceil((Math.round(years * 12) - 1) / 3)));

  // Annualized approximate step-up
  const annualEquivalentStepUp = (Math.pow(1 + quarterlyStepUp / 100, 4) - 1) * 100;

  const handleCopySummary = async () => {
    const text = `Quarterly Step-Up SIP Summary:
• Initial Monthly SIP: ₹${monthlySip.toLocaleString("en-IN")}
• Quarterly Step-Up: ${quarterlyStepUp}% (~${annualEquivalentStepUp.toFixed(1)}% p.a.)
• Expected Return: ${annualReturn}% p.a.
• Duration: ${years} Years
• Total Invested: ₹${Math.round(result.invested).toLocaleString("en-IN")}
• Est. Wealth Gain: ₹${Math.round(result.returns).toLocaleString("en-IN")}
• Total Corpus: ₹${Math.round(result.total).toLocaleString("en-IN")} (${growthMultiple.toFixed(2)}x growth)
• Final SIP Amount: ₹${Math.round(finalMonthSip).toLocaleString("en-IN")}/mo
Calculated with Step-Up SIP Calculator`;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleReset = () => {
    setMonthlySip(25000);
    setQuarterlyStepUp(3);
    setAnnualReturn(12);
    setYears(10);
    toast.info("Calculator reset to defaults");
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setMonthlySip(preset.monthly);
    setQuarterlyStepUp(preset.stepUp);
    setAnnualReturn(preset.returns);
    setYears(preset.years);
    toast.success(`Applied preset: ${preset.label}`);
  };

  return (
    <div className="min-h-screen">
      {/* ─── Apple Translucent Floating Top Navigation Bar ─── */}
      <header className="sticky top-0 z-50 apple-nav backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <TrendingUp className="h-5 w-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground tracking-title">
                  StepUp SIP
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Quarterly Engine
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground/80">
                Wealth compounding simulator by Kothari Brothers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Reset default values"
              className="apple-press inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              title="Copy calculation summary"
              className="apple-press inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Breadcrumb navigation for SEO */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li>
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
            </li>
            <li aria-hidden="true" className="text-border">
              /
            </li>
            <li aria-current="page" className="text-foreground font-medium">
              Quarterly Step-Up SIP Calculator
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Compounding Algorithm</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-display leading-tight mb-3">
            Quarterly Step-Up SIP Calculator
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Calculate how increasing your monthly investment by a fixed percentage every quarter
            exponentially accelerates wealth creation. Visualize your{" "}
            <strong className="text-foreground font-semibold">invested capital</strong>,{" "}
            <strong className="text-foreground font-semibold">estimated returns</strong>,{" "}
            <strong className="text-foreground font-semibold">total corpus</strong>, and full{" "}
            <strong className="text-foreground font-semibold">year-by-year trajectory</strong>.
          </p>

          {/* Quick Scenario Preset Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">Quick Scenarios:</span>
            {PRESETS.map((preset) => {
              const isActive =
                monthlySip === preset.monthly &&
                quarterlyStepUp === preset.stepUp &&
                annualReturn === preset.returns &&
                years === preset.years;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`apple-press inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Interactive Calculator Glass Card ─── */}
        <section
          className="apple-panel p-5 sm:p-8 mb-8"
          aria-label="SIP Calculator Controls and Results"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            {/* LEFT: Sliders & Steppers */}
            <div className="space-y-4">
              <AppleField
                label="Monthly investment"
                hint="Initial contribution amount starting in month 1"
                id="MONTHLY_INVESTMENT"
                value={monthlySip}
                onChange={setMonthlySip}
                min={500}
                max={500000}
                step={500}
                prefix="₹"
              />

              <AppleField
                label="Quarterly step-up"
                hint={`Increases every 3 months (~${annualEquivalentStepUp.toFixed(1)}% annual rate)`}
                id="QUARTERLY_STEP_UP"
                value={quarterlyStepUp}
                onChange={setQuarterlyStepUp}
                min={0}
                max={25}
                step={0.5}
                suffix="%"
              />

              <AppleField
                label="Expected return rate (p.a)"
                hint="Equity mutual funds historically average 12-15% p.a."
                id="RETURN_RATE"
                value={annualReturn}
                onChange={setAnnualReturn}
                min={1}
                max={30}
                step={0.5}
                suffix="%"
              />

              <AppleField
                label="Time period"
                hint={`${years * 12} total monthly investments across ${years * 4} quarters`}
                id="TIME_PERIOD"
                value={years}
                onChange={setYears}
                min={1}
                max={40}
                step={1}
                suffix="Yr"
              />
            </div>

            {/* RIGHT: Visual Donut & Key Metric Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
              {/* Donut Chart with Center Total */}
              <div
                className="flex flex-col items-center justify-center my-auto py-2"
                role="figure"
                aria-label="Invested amount vs estimated returns donut chart"
              >
                <DonutChart invested={result.invested} returns={result.returns} size={230} />

                {/* Donut Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-muted-foreground">Invested</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {result.total > 0
                        ? `${((result.invested / result.total) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <span className="text-muted-foreground">Est. Returns</span>
                    <span className="font-semibold text-emerald-400 tabular-nums">
                      {result.total > 0
                        ? `${((result.returns / result.total) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Outcome Stat Highlights */}
              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
                    Total Invested
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(result.invested)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Est. Wealth Gain
                  </span>
                  <span className="font-bold text-emerald-400">
                    +{formatCurrency(result.returns)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 border border-white/10">
                  <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Total Corpus Value
                  </span>
                  <span className="text-lg font-extrabold text-emerald-300">
                    {formatCurrency(result.total)}
                  </span>
                </div>

                {/* Final monthly installment note */}
                <div className="pt-2 text-xs text-muted-foreground/80 flex items-center justify-between">
                  <span>Final month SIP contribution:</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatCurrency(finalMonthSip)} / mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Interactive Growth Explorer (Tabs: Chart vs Table) ─── */}
        <section
          className="apple-panel p-5 sm:p-8 mb-8"
          aria-label="Year-by-year SIP growth breakdown"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title">
                Growth Progression & Compounding Curve
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Witness the power of compounding as your quarterly step-up accelerates year after
                year.
              </p>
            </div>

            {/* Apple Segmented View Switcher */}
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("chart")}
                className={`apple-press-sm inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "chart"
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Growth Chart</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("table")}
                className={`apple-press-sm inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "table"
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Yearly Table</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Recharts Interactive Area Chart */}
          {activeTab === "chart" && (
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 sm:p-6">
              <div className="h-72 sm:h-96 w-full">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={result.rows}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.75 0.18 160)" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="oklch(0.75 0.18 160)" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickFormatter={(v) => `Yr ${v}`}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickFormatter={(v) => formatCompactInr(v)}
                      />
                      <Tooltip content={<AppleChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Total Value"
                        stroke="oklch(0.75 0.18 160)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name="Invested Amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorInvested)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading growth chart...
                  </div>
                )}
              </div>

              {/* Chart Caption & Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-white/5 pt-3">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
                    Total Corpus (with compounding)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-blue-500 rounded-full inline-block" />
                    Cumulative Invested
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/70">
                  Hover or tap any year for exact figures
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Detailed Table View */}
          {activeTab === "table" && (
            <div>
              {/* Mobile View: High-density cards */}
              <ul className="space-y-3 sm:hidden">
                {result.rows.map((row) => (
                  <li
                    key={row.year}
                    className="rounded-xl border border-white/10 p-4 bg-white/[0.025]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                        Year {row.year}
                      </span>
                      <span className="font-bold text-base text-foreground tabular-nums">
                        {formatCurrency(row.value)}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: `${(row.value / maxValue) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex justify-between text-xs tabular-nums">
                      <span className="text-muted-foreground">
                        Invested: {formatCurrency(row.invested)}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        Gain: +{formatCurrency(row.returns)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablet & Desktop: Comprehensive table */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-slate-950/30">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground bg-white/[0.02]">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Invested Capital</th>
                      <th className="py-3 px-4">Est. Returns</th>
                      <th className="py-3 px-4">Total Corpus</th>
                      <th className="py-3 px-4 w-1/3">Compounding Scale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.rows.map((row) => {
                      const returnsOverInvested = row.returns >= row.invested;
                      return (
                        <tr key={row.year} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-4 font-bold text-foreground">Year {row.year}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {formatCurrency(row.invested)}
                          </td>
                          <td className="py-3 px-4 font-medium text-emerald-400">
                            +{formatCurrency(row.returns)}
                          </td>
                          <td className="py-3 px-4 font-bold text-foreground">
                            {formatCurrency(row.value)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                                  style={{ width: `${(row.value / maxValue) * 100}%` }}
                                />
                              </div>
                              {returnsOverInvested && (
                                <span className="shrink-0 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                  2x+
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ─── SEO: How to Use ─── */}
        <section className="apple-panel p-5 sm:p-8 mb-8" aria-label="How to use the calculator">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title">
              How to Use This Quarterly Step-Up SIP Calculator
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground mb-6">
            Our <strong>quarterly step-up SIP calculator</strong> is designed to be simple, fast,
            and intuitive. Follow these steps to calculate your wealth potential:
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="apple-card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                1
              </span>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Enter your monthly SIP amount
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start with your current or planned monthly SIP (from ₹500 to ₹5,00,000).
              </p>
            </div>

            <div className="apple-card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                2
              </span>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Set quarterly step-up %
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the increment every 3 months. A 3% to 5% quarterly step-up is ideal for
                professionals.
              </p>
            </div>

            <div className="apple-card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                3
              </span>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Choose expected return rate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Equity funds in India have historically compounded at 12–15% annually over long
                horizons.
              </p>
            </div>

            <div className="apple-card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                4
              </span>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Select investment tenure
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose how many years you plan to stay invested. Longer time horizons demonstrate
                pure exponential growth.
              </p>
            </div>

            <div className="apple-card p-4 sm:col-span-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                5
              </span>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Analyze interactive results
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review your total invested amount, estimated gains, growth multiple, final month SIP
                commitment, and year-by-year curve.
              </p>
            </div>
          </div>
        </section>

        {/* ─── SEO: Why Use Step-Up SIP ─── */}
        <article className="apple-panel p-5 sm:p-8 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title mb-3">
            Why Use a Quarterly Step-Up SIP?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-5">
            A <strong>Quarterly Step-Up SIP</strong> (Systematic Investment Plan) lets you increase
            your monthly investment by a fixed percentage every quarter. Unlike a standard SIP where
            your contribution stays flat for years, a step-up SIP mirrors your growing income. This
            dual compounding — compounding on returns plus compounding on contributions — creates
            exponential wealth over 10 to 20 years.
          </p>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong className="text-foreground">Start small, scale naturally</strong> — Begin
                with a comfortable monthly commitment and let it expand with your salary.
              </span>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong className="text-foreground">Beat inflation decisively</strong> — Increasing
                your investments each quarter preserves and expands your real purchasing power.
              </span>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong className="text-foreground">Quarterly milestone discipline</strong> — Align
                your investment increases with appraisals, promotions, and quarterly financial
                reviews.
              </span>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong className="text-foreground">Exponential 2x–4x corpus boost</strong> — A 5%
                quarterly step-up can yield double to quadruple the final wealth of a fixed SIP.
              </span>
            </div>
          </div>
        </article>

        {/* ─── SEO: Step-Up SIP vs Regular SIP ─── */}
        <article className="apple-panel p-5 sm:p-8 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title mb-3">
            Step-Up SIP vs Regular SIP — What&apos;s the Difference?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-5">
            Understanding the structural difference between a <strong>regular SIP</strong> and a{" "}
            <strong>step-up SIP</strong> is crucial for maximizing long-term mutual fund returns:
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground border-b border-white/10 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Feature</th>
                  <th className="py-3.5 px-4">Regular SIP</th>
                  <th className="py-3.5 px-4 text-emerald-400">Quarterly Step-Up SIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-muted-foreground">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">Monthly Amount</td>
                  <td className="py-3.5 px-4">Fixed throughout</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">
                    Increases every quarter
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    Inflation Protection
                  </td>
                  <td className="py-3.5 px-4">No — fixed rupees lose real value</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">
                    Yes — steps up with income
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    Total Capital Invested
                  </td>
                  <td className="py-3.5 px-4">Lower</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">Significantly higher</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    Corpus After 15–20 Yrs
                  </td>
                  <td className="py-3.5 px-4">Moderate</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    2x to 4x larger final wealth
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">Best For</td>
                  <td className="py-3.5 px-4">Fixed pension or static income</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">
                    Salaried earners & business owners
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed">
            <strong className="text-foreground">Example Scenario:</strong> A ₹10,000 monthly SIP
            with 12% annual returns and <strong>5% quarterly step-up over 15 years</strong> can
            generate a corpus that is <strong>3-4 times larger</strong> than a regular fixed SIP of
            the same starting size.
          </p>
        </article>

        {/* ─── SEO: Mathematical Logic & Formula ─── */}
        <article className="apple-panel p-5 sm:p-8 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title mb-3">
            How Quarterly Step-Up SIP Works — The Mathematical Formula
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            The quarterly step-up SIP engine increases your installment at the beginning of each
            3-month cycle. Here is the exact calculation logic:
          </p>
          <ol className="space-y-2.5 text-sm text-muted-foreground list-decimal list-inside marker:text-emerald-400 marker:font-bold">
            <li className="leading-relaxed">
              You begin with a base monthly SIP amount (e.g., ₹10,000).
            </li>
            <li className="leading-relaxed">
              Every 3 months, the SIP amount is multiplied by{" "}
              <strong className="text-foreground font-semibold">(1 + step-up %)</strong>: Month 1–3
              = ₹10,000; Month 4–6 = ₹10,500; Month 7–9 = ₹11,025...
            </li>
            <li className="leading-relaxed">
              Each monthly contribution earns returns based on the monthly rate ={" "}
              <strong className="text-foreground font-semibold">(Annual Return Rate ÷ 12)</strong>.
            </li>
            <li className="leading-relaxed">
              The portfolio compounds monthly:{" "}
              <strong className="text-foreground font-semibold">
                Value = (Previous Value + Monthly SIP) × (1 + Monthly Rate)
              </strong>
              .
            </li>
            <li className="leading-relaxed">
              Total returns = Total accumulated corpus value − Total invested capital.
            </li>
          </ol>
        </article>

        {/* ─── SEO: Frequently Asked Questions (Apple Accordion) ─── */}
        <section
          className="apple-panel p-5 sm:p-8 mb-8"
          aria-label="Frequently asked questions about step-up SIP calculator"
        >
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-title mb-5">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What is a Step-Up SIP?",
                a: "A Step-Up SIP (Systematic Investment Plan) increases your monthly investment by a fixed percentage at regular intervals. In a quarterly step-up SIP, the increase happens every 3 months. This helps align your investments with salary hikes and income growth, resulting in significantly higher wealth accumulation compared to a regular SIP.",
              },
              {
                q: "How is the quarterly step-up applied?",
                a: "Every 3 months, your monthly SIP amount is multiplied by (1 + step-up %). For example, a ₹10,000 SIP with 5% quarterly step-up becomes ₹10,500 after the first quarter, ₹11,025 after the second, ₹11,576 after the third, and so on. This compounding on contributions is what makes step-up SIPs powerful for long-term wealth building.",
              },
              {
                q: "Is the return rate guaranteed?",
                a: "No. The expected return rate is an assumption for illustration purposes only. Actual mutual fund returns vary based on market conditions, fund selection, and economic factors. Past performance is not a guarantee of future results. Use this calculator for planning purposes and consult a SEBI-registered financial advisor for personalized advice.",
              },
              {
                q: "What is the growth multiple?",
                a: "The growth multiple shows how many times your total corpus value exceeds your total invested amount. A 2x multiple means your money has doubled. Higher investment durations and step-up percentages lead to higher growth multiples due to the power of compounding.",
              },
              {
                q: "What is the difference between step-up SIP and regular SIP?",
                a: "In a regular SIP, you invest a fixed amount every month throughout the investment period. In a step-up SIP, your monthly investment increases by a set percentage at regular intervals (quarterly or annually). Step-up SIPs help you invest more as your income grows, leading to a significantly larger corpus — often 2-4x more than a regular SIP over 15-20 years.",
              },
              {
                q: "How much more can I earn with a quarterly step-up SIP vs a regular SIP?",
                a: "The difference depends on the step-up percentage and investment duration. For example, with a ₹10,000 monthly SIP, 12% annual returns, and 5% quarterly step-up over 20 years, your corpus could be 3-4x larger than a regular SIP with the same starting amount. The longer you invest and the higher your step-up, the bigger the difference. Use the calculator above to see the exact numbers for your specific inputs.",
              },
              {
                q: "What is a good quarterly step-up percentage for SIP?",
                a: "A quarterly step-up of 2-5% is considered practical for most salaried investors. If your income grows by 10-15% annually, a 3% quarterly step-up (roughly 12% annualized) keeps your investment growth in line with your salary hikes without straining your budget. Start conservative and adjust as your income grows.",
              },
              {
                q: "Can I use this calculator for annual step-up SIP too?",
                a: "This calculator is specifically designed for quarterly step-ups, but you can approximate an annual step-up by dividing your desired annual increase across quarters. For example, if you want a 10% annual step-up, you can set approximately 2.5% as the quarterly step-up. The results will be very close to an annual step-up calculation.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="apple-press flex w-full items-center justify-between p-4 text-left font-medium text-sm text-foreground hover:bg-white/[0.03]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="mt-8 pb-10 text-center text-xs text-muted-foreground border-t border-white/10 pt-6">
          <p className="flex items-center justify-center gap-1.5 font-medium text-sm text-foreground/90 mb-2">
            Crafted with precision by{" "}
            <span className="font-semibold text-emerald-400">Kothari brothers</span>
          </p>
          <p className="max-w-2xl mx-auto leading-relaxed text-muted-foreground/80 mb-3">
            Returns are compounded monthly and the SIP amount steps up at the start of every
            quarter. Figures are indicative estimates, not financial or investment advice. Always
            consult a SEBI-registered financial advisor before making investment commitments.
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            Quarterly Step-Up SIP Calculator • Step Up SIP Calculator Online • SIP Growth Calculator
            India • Free Mutual Fund Planning Tool
          </p>
        </footer>
      </main>
    </div>
  );
}
