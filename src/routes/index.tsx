import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calculateStepUpSip, formatCurrency } from "@/lib/sip";

export const Route = createFileRoute("/")(
  {
  head: () => ({
      meta: [
        { title: "Quaterly Step Up calculator" },
        {
          name: "description",
          content:
            "Calculate the future value of a monthly SIP that steps up every quarter. See invested amount, estimated returns and a year-by-year growth breakdown.",
        },
        { property: "og:title", content: "Quaterly Step Up calculator" },
        {
          property: "og:description",
          content:
            "Calculate the future value of a monthly SIP that steps up every quarter. See invested amount, estimated returns and a year-by-year growth breakdown.",
        },
      ],
  }),
  component: Index,
});

/* ─── Donut chart (SVG) ─── */
function DonutChart({ invested, returns, size = 220 }: { invested: number; returns: number; size?: number }) {
  const total = invested + returns;
  const radius = (size / 220) * 90;
  const sw = (size / 220) * 40;
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.28 0.035 255)" strokeWidth={sw} />
      </svg>
    );
  }

  const investedRatio = invested / total;
  const circumference = 2 * Math.PI * radius;
  const investedArc = circumference * investedRatio;
  const returnsArc = circumference * (1 - investedRatio);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Invested segment (emerald) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="oklch(0.75 0.18 160)"
        strokeWidth={sw}
        strokeDasharray={`${investedArc} ${circumference - investedArc}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="butt"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      {/* Returns segment (brown) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="oklch(0.60 0.11 60)"
        strokeWidth={sw}
        strokeDasharray={`${returnsArc} ${circumference - returnsArc}`}
        strokeDashoffset={circumference * 0.25 - investedArc}
        strokeLinecap="butt"
        style={{ transition: "stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

/* ─── Groww-style field: label — input — slider ─── */
type FieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  id: string;
};

function Field({ label, value, onChange, min, max, step, prefix, suffix, id }: FieldProps) {
  return (
    <div className="mb-5 sm:mb-8 last:mb-0">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="groww-input">
          {prefix && (
            <span className="text-sm text-brand font-semibold">{prefix}</span>
          )}
          <input
            type="number"
            inputMode="decimal"
            id={id}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 bg-transparent text-right font-semibold text-base text-brand outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="text-sm text-brand font-medium">{suffix}</span>
          )}
        </div>
      </div>

      {/* Range slider */}
      <input
        type="range"
        className="range-brand"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, oklch(0.75 0.18 160) 0%, oklch(0.75 0.18 160) ${((value - min) / (max - min)) * 100}%, oklch(0.28 0.035 255) ${((value - min) / (max - min)) * 100}%, oklch(0.28 0.035 255) 100%)`,
        }}
      />
    </div>
  );
}

function Index() {
  const [monthlySip, setMonthlySip] = useState(25000);
  const [quarterlyStepUp, setQuarterlyStepUp] = useState(3);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () => calculateStepUpSip({ monthlySip, quarterlyStepUp, annualReturn, years }),
    [monthlySip, quarterlyStepUp, annualReturn, years],
  );

  const maxValue = result.rows.at(-1)?.value || 1;

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-12">
      {/* Page title */}
      <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-8">
        Quaterly Step Up calculator
      </h1>

      {/* ─── Main calculator card ─── */}
      <div className="panel p-4 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT: Sliders */}
          <div>
            <Field
              label="Monthly investment"
              id="MONTHLY_INVESTMENT"
              value={monthlySip}
              onChange={setMonthlySip}
              min={500}
              max={500000}
              step={500}
              prefix="₹"
            />
            <Field
              label="Quarterly step-up"
              id="QUARTERLY_STEP_UP"
              value={quarterlyStepUp}
              onChange={setQuarterlyStepUp}
              min={0}
              max={25}
              step={0.5}
              suffix="%"
            />
            <Field
              label="Expected return rate (p.a)"
              id="RETURN_RATE"
              value={annualReturn}
              onChange={setAnnualReturn}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
            />
            <Field
              label="Time period"
              id="TIME_PERIOD"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix="Yr"
            />

            {/* ─── Results row ─── */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Invested amount</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Est. returns</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.returns)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total value</span>
                <span className="font-bold text-lg text-foreground">{formatCurrency(result.total)}</span>
              </div>
            </div>

            {/* Final SIP info */}
            <p className="mt-4 text-xs text-muted-foreground">
              Your final SIP in month {Math.max(1, Math.round(years * 12))} is{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(
                  monthlySip *
                    Math.pow(
                      1 + quarterlyStepUp / 100,
                      Math.max(0, Math.ceil((Math.round(years * 12) - 1) / 3)),
                    ),
                )}
              </span>
              .
            </p>
          </div>

          {/* RIGHT: Donut chart */}
          <div className="flex flex-col items-center justify-center">
            {/* Legend */}
            <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "oklch(0.75 0.18 160)" }} />
                Invested amount
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "oklch(0.60 0.11 60)" }} />
                Est. returns
              </span>
            </div>

            {/* Donut — smaller on mobile */}
            <div className="sm:hidden">
              <DonutChart invested={result.invested} returns={result.returns} size={180} />
            </div>
            <div className="hidden sm:block">
              <DonutChart invested={result.invested} returns={result.returns} size={220} />
            </div>

            {/* Growth multiple */}
            <p className="mt-3 sm:mt-4 text-sm text-muted-foreground text-center">
              Growth multiple:{" "}
              <span className="font-bold text-foreground">
                {(result.invested > 0 ? result.total / result.invested : 0).toFixed(2)}x
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Year-by-year growth ─── */}
      <div className="panel mt-4 sm:mt-6 p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Year-by-year growth</h2>

        {/* Mobile: stacked cards */}
        <ul className="mt-5 space-y-3 sm:hidden">
          {result.rows.map((row) => (
            <li key={row.year} className="rounded-xl border border-border p-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Year {row.year}
                </span>
                <span className="font-semibold text-lg text-foreground">
                  {formatCurrency(row.value)}
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${(row.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Invested {formatCurrency(row.invested)}
                </span>
                <span className="text-brand font-medium">+{formatCurrency(row.returns)}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Tablet and up: full table */}
        <div className="mt-6 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                <th className="pb-3">Year</th>
                <th className="pb-3">Invested</th>
                <th className="pb-3">Returns</th>
                <th className="pb-3">Value</th>
                <th className="pb-3 w-1/3">Growth</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.year} className="border-t border-border">
                  <td className="py-3 font-semibold">{row.year}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatCurrency(row.invested)}
                  </td>
                  <td className="py-3 text-brand font-medium">{formatCurrency(row.returns)}</td>
                  <td className="py-3 font-semibold">{formatCurrency(row.value)}</td>
                  <td className="py-3">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${(row.value / maxValue) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SEO: How it works ─── */}
      <article className="panel mt-4 sm:mt-6 p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">How Quarterly Step-Up SIP Works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A Quarterly Step-Up SIP (Systematic Investment Plan) lets you increase your monthly investment by a fixed percentage every quarter.
          Unlike a regular SIP where your contribution stays the same, a step-up SIP grows with your income — helping you invest more as you earn more.
          This compounding effect on contributions, combined with market returns, can significantly boost your long-term wealth.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            Start with a comfortable monthly SIP amount
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            Your SIP automatically increases each quarter
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            Beat inflation by growing investments with income
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            See year-by-year growth with interactive charts
          </li>
        </ul>
      </article>

      {/* ─── SEO: FAQ ─── */}
      <section className="panel mt-4 sm:mt-6 p-4 sm:p-8" aria-label="Frequently asked questions">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-foreground">What is a Step-Up SIP?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              A Step-Up SIP increases your monthly investment by a fixed percentage at regular intervals (quarterly in this calculator). It helps align your investments with salary hikes.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">How is the quarterly step-up applied?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Every 3 months, your monthly SIP amount is multiplied by (1 + step-up %). For example, a ₹10,000 SIP with 5% quarterly step-up becomes ₹10,500 after the first quarter, ₹11,025 after the second, and so on.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">Is the return rate guaranteed?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              No. The expected return rate is an assumption for illustration purposes. Actual mutual fund returns vary based on market conditions. Past performance is not a guarantee of future results.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">What is the growth multiple?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              The growth multiple shows how many times your total value exceeds your total invested amount. A 2x multiple means your money has doubled.
            </dd>
          </div>
        </dl>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-6 sm:mt-10 pb-6 text-center text-xs leading-relaxed text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5 font-medium text-sm text-foreground/80">
          Made with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-semibold text-brand">Kothari brothers</span>
        </p>
        <p className="mt-3 text-muted-foreground/70">
          Returns are compounded monthly and the SIP amount steps up at the start of every
          quarter. Figures are indicative estimates, not investment advice.
        </p>
      </footer>
    </main>
  );
}
