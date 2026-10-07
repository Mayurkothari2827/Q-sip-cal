import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calculateStepUpSip, formatCurrency } from "@/lib/sip";

export const Route = createFileRoute("/")(
  {
  head: () => ({
      meta: [
        { title: "Quarterly Step-Up SIP Calculator — Free Online Tool | Calculate Step-Up SIP Returns" },
        {
          name: "description",
          content:
            "Use our free quarterly step-up SIP calculator to see how increasing your SIP every quarter grows your wealth faster. Interactive charts, year-by-year breakdown, invested vs returns analysis, and growth multiples — plan smarter mutual fund investments.",
        },
        { property: "og:title", content: "Quarterly Step-Up SIP Calculator — Calculate Step-Up SIP Returns Free" },
        {
          property: "og:description",
          content:
            "Use our free quarterly step-up SIP calculator to see how increasing your SIP every quarter grows your wealth faster. Interactive charts, year-by-year breakdown, and growth multiples.",
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
      {/* Breadcrumb navigation for SEO */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
          <li aria-hidden="true" className="text-border">/</li>
          <li aria-current="page" className="text-foreground font-medium">Quarterly Step-Up SIP Calculator</li>
        </ol>
      </nav>

      {/* Page title */}
      <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">
        Quarterly Step-Up SIP Calculator
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-8 max-w-3xl leading-relaxed">
        Calculate how your <strong>Systematic Investment Plan (SIP)</strong> grows when you increase your monthly investment by a fixed percentage every quarter. See your <strong>invested amount</strong>, <strong>estimated returns</strong>, <strong>total corpus</strong>, and a detailed <strong>year-by-year growth breakdown</strong>.
      </p>

      {/* ─── Main calculator card ─── */}
      <section className="panel p-4 sm:p-8" aria-label="SIP Calculator">
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
            <div className="mt-6 pt-6 border-t border-border space-y-3" aria-label="Calculation results">
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
          <div className="flex flex-col items-center justify-center" role="figure" aria-label="Invested amount vs estimated returns donut chart">
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
      </section>

      {/* ─── Year-by-year growth ─── */}
      <section className="panel mt-4 sm:mt-6 p-4 sm:p-8" aria-label="Year-by-year SIP growth breakdown">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Year-by-Year Growth Breakdown</h2>
        <p className="mt-1 text-xs text-muted-foreground">Track how your quarterly step-up SIP investment grows each year with compounding returns.</p>

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
      </section>

      {/* ─── SEO: How to Use ─── */}
      <section className="panel mt-4 sm:mt-6 p-4 sm:p-8" aria-label="How to use the calculator">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">How to Use This Quarterly Step-Up SIP Calculator</h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          Our <strong>quarterly step-up SIP calculator</strong> is designed to be simple and intuitive. Follow these steps to calculate your potential returns:
        </p>
        <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside marker:text-brand marker:font-semibold">
          <li className="leading-relaxed">
            <strong className="text-foreground">Enter your monthly SIP amount</strong> — Start with the amount you currently invest or plan to invest monthly. You can set any amount from ₹500 to ₹5,00,000.
          </li>
          <li className="leading-relaxed">
            <strong className="text-foreground">Set the quarterly step-up percentage</strong> — Choose how much you want to increase your SIP every 3 months. A 3-5% quarterly step-up is common for salaried investors.
          </li>
          <li className="leading-relaxed">
            <strong className="text-foreground">Choose your expected annual return rate</strong> — Select the return rate based on the type of mutual fund. Equity funds have historically returned 12-15% p.a., while debt funds return 6-8% p.a.
          </li>
          <li className="leading-relaxed">
            <strong className="text-foreground">Select the investment duration</strong> — Choose how many years you plan to invest. Longer durations (10+ years) show the true power of compounding with step-up SIPs.
          </li>
          <li className="leading-relaxed">
            <strong className="text-foreground">View your results instantly</strong> — The calculator immediately shows your total invested amount, estimated returns, total corpus value, growth multiple, and a detailed year-by-year growth table.
          </li>
        </ol>
      </section>

      {/* ─── SEO: Why Use Step-Up SIP ─── */}
      <article className="panel mt-4 sm:mt-6 p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">Why Use a Quarterly Step-Up SIP?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A <strong>Quarterly Step-Up SIP</strong> (Systematic Investment Plan) lets you increase your monthly investment by a fixed percentage every quarter.
          Unlike a regular SIP where your contribution stays the same, a step-up SIP grows with your income — helping you invest more as you earn more.
          This compounding effect on contributions, combined with market returns, can significantly boost your long-term wealth.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Start small, grow big</strong> — Begin with a comfortable monthly SIP amount and let it grow automatically every quarter</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Auto-increase every quarter</strong> — Your SIP automatically increases each quarter, no manual action needed</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Beat inflation</strong> — Growing your investments with your income ensures your purchasing power doesn&apos;t erode over time</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Align with salary hikes</strong> — Most professionals receive quarterly or annual raises; step-up SIP matches this natural growth</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Accelerate wealth creation</strong> — The compounding effect on increasing contributions creates exponentially higher returns over 10-20 years</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span><strong className="text-foreground">Interactive year-by-year charts</strong> — Visualize your investment growth with our interactive donut chart and year-wise breakdown table</span>
          </div>
        </div>
      </article>

      {/* ─── SEO: Step-Up SIP vs Regular SIP ─── */}
      <article className="panel mt-4 sm:mt-6 p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">Step-Up SIP vs Regular SIP — What&apos;s the Difference?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          Understanding the difference between a <strong>regular SIP</strong> and a <strong>step-up SIP</strong> is crucial for making informed investment decisions. Here&apos;s a comparison:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                <th className="pb-3 pr-4">Feature</th>
                <th className="pb-3 pr-4">Regular SIP</th>
                <th className="pb-3">Step-Up SIP</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t border-border">
                <td className="py-3 pr-4 font-medium text-foreground">Monthly amount</td>
                <td className="py-3 pr-4">Fixed throughout</td>
                <td className="py-3 text-brand">Increases every quarter</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 pr-4 font-medium text-foreground">Inflation protection</td>
                <td className="py-3 pr-4">No — same amount loses value</td>
                <td className="py-3 text-brand">Yes — grows with income</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 pr-4 font-medium text-foreground">Total invested</td>
                <td className="py-3 pr-4">Lower</td>
                <td className="py-3 text-brand">Significantly higher</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 pr-4 font-medium text-foreground">Corpus after 10-20 years</td>
                <td className="py-3 pr-4">Moderate</td>
                <td className="py-3 text-brand">2-4x larger</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 pr-4 font-medium text-foreground">Best for</td>
                <td className="py-3 pr-4">Fixed-income earners</td>
                <td className="py-3 text-brand">Salaried professionals with growth</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Example:</strong> A ₹10,000 monthly SIP with 12% annual returns and <strong>5% quarterly step-up over 15 years</strong> can give you a corpus that is <strong>3-4 times larger</strong> than a regular SIP with the same starting amount. Use the calculator above to see the exact numbers for your scenario.
        </p>
      </article>

      {/* ─── SEO: How it works ─── */}
      <article className="panel mt-4 sm:mt-6 p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">How Quarterly Step-Up SIP Works — The Formula</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The quarterly step-up SIP calculation works by increasing your monthly investment at the start of every quarter. Here&apos;s the formula and logic behind it:
        </p>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground list-decimal list-inside marker:text-brand marker:font-semibold">
          <li className="leading-relaxed">You start with a base monthly SIP amount (e.g., ₹10,000)</li>
          <li className="leading-relaxed">Every 3 months, the SIP is multiplied by <strong className="text-foreground">(1 + step-up%)</strong>. For example, with 5% quarterly step-up: ₹10,000 → ₹10,500 → ₹11,025 → ₹11,576...</li>
          <li className="leading-relaxed">Each month&apos;s contribution earns returns at the monthly rate = <strong className="text-foreground">(Annual Return ÷ 12)</strong></li>
          <li className="leading-relaxed">The total value compounds monthly: <strong className="text-foreground">Value = (Previous Value + Monthly SIP) × (1 + Monthly Rate)</strong></li>
          <li className="leading-relaxed">Total returns = Total corpus value − Total invested amount</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          The <strong>growth multiple</strong> = Total Value ÷ Total Invested. A 2x multiple means your money has doubled. With a quarterly step-up SIP over 15-20 years, growth multiples of <strong>3x-5x</strong> are common.
        </p>
      </article>

      {/* ─── SEO: FAQ (expanded) ─── */}
      <section className="panel mt-4 sm:mt-6 p-4 sm:p-8" aria-label="Frequently asked questions about step-up SIP calculator">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-foreground">What is a Step-Up SIP?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              A Step-Up SIP (Systematic Investment Plan) increases your monthly investment by a fixed percentage at regular intervals. In a quarterly step-up SIP, the increase happens every 3 months. This helps align your investments with salary hikes and income growth, resulting in significantly higher wealth accumulation compared to a regular SIP.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">How is the quarterly step-up applied?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Every 3 months, your monthly SIP amount is multiplied by (1 + step-up %). For example, a ₹10,000 SIP with 5% quarterly step-up becomes ₹10,500 after the first quarter, ₹11,025 after the second, ₹11,576 after the third, and so on. This compounding on contributions is what makes step-up SIPs powerful for long-term wealth building.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">Is the return rate guaranteed?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              No. The expected return rate is an assumption for illustration purposes only. Actual mutual fund returns vary based on market conditions, fund selection, and economic factors. Past performance is not a guarantee of future results. Use this calculator for planning purposes and consult a SEBI-registered financial advisor for personalized advice.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">What is the growth multiple?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              The growth multiple shows how many times your total corpus value exceeds your total invested amount. A 2x multiple means your money has doubled. Higher investment durations and step-up percentages lead to higher growth multiples due to the power of compounding.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">What is the difference between step-up SIP and regular SIP?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              In a regular SIP, you invest a fixed amount every month throughout the investment period. In a step-up SIP, your monthly investment increases by a set percentage at regular intervals (quarterly or annually). Step-up SIPs help you invest more as your income grows, leading to a significantly larger corpus — often 2-4x more than a regular SIP over 15-20 years.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">How much more can I earn with a quarterly step-up SIP vs a regular SIP?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              The difference depends on the step-up percentage and investment duration. For example, with a ₹10,000 monthly SIP, 12% annual returns, and 5% quarterly step-up over 20 years, your corpus could be 3-4x larger than a regular SIP with the same starting amount. The longer you invest and the higher your step-up, the bigger the difference. Use the calculator above to see the exact numbers for your specific inputs.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">What is a good quarterly step-up percentage for SIP?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              A quarterly step-up of 2-5% is considered practical for most salaried investors. If your income grows by 10-15% annually, a 3% quarterly step-up (roughly 12% annualized) keeps your investment growth in line with your salary hikes without straining your budget. Start conservative and adjust as your income grows.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">Can I use this calculator for annual step-up SIP too?</dt>
            <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
              This calculator is specifically designed for quarterly step-ups, but you can approximate an annual step-up by dividing your desired annual increase across quarters. For example, if you want a 10% annual step-up, you can set approximately 2.5% as the quarterly step-up. The results will be very close to an annual step-up calculation.
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
          quarter. Figures are indicative estimates, not investment advice. Always consult a SEBI-registered financial advisor before making investment decisions.
        </p>
        <p className="mt-2 text-muted-foreground/50 text-[10px]">
          Quarterly Step-Up SIP Calculator • Step Up SIP Calculator Online • SIP Growth Calculator India • Free Mutual Fund Calculator
        </p>
      </footer>
    </main>
  );
}

