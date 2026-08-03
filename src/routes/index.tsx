import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calculateStepUpSip, formatCurrency } from "@/lib/sip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Step-Up SIP Calculator — Grow Your SIP Every Quarter" },
      {
        name: "description",
        content:
          "Calculate the future value of a monthly SIP that steps up every quarter. See invested amount, estimated returns and a year-by-year growth breakdown.",
      },
      { property: "og:title", content: "Step-Up SIP Calculator" },
      {
        property: "og:description",
        content:
          "Model a quarterly step-up SIP: invested amount, estimated returns, total corpus and yearly breakdown.",
      },
    ],
  }),
  component: Index,
});

type FieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
  hint: string;
};

function Field({ label, value, onChange, min, max, step, suffix, hint }: FieldProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:items-baseline sm:gap-4">
        <div className="min-w-0">
          <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground sm:text-sm">
            {label}
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 sm:px-3">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 bg-transparent text-right font-display text-base font-semibold text-brand outline-none [appearance:textfield] sm:w-24 sm:text-lg [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-muted-foreground sm:text-sm">{suffix}</span>
        </div>
      </div>

      <input
        type="range"
        className="range-brand"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Index() {
  const [monthlySip, setMonthlySip] = useState(10000);
  const [quarterlyStepUp, setQuarterlyStepUp] = useState(3);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(15);

  const result = useMemo(
    () => calculateStepUpSip({ monthlySip, quarterlyStepUp, annualReturn, years }),
    [monthlySip, quarterlyStepUp, annualReturn, years],
  );

  const investedShare = result.total > 0 ? (result.invested / result.total) * 100 : 0;
  const maxValue = result.rows.at(-1)?.value || 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-14">
      <header className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-[0.65rem] font-semibold tracking-widest uppercase text-brand sm:text-xs">
          Wealth Planner
        </span>
        <h1 className="mt-4 text-[1.75rem] leading-tight font-bold sm:mt-5 sm:text-5xl">
          Step-Up SIP Calculator
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-lg">
          A small increase every quarter compounds into a very different outcome. Set your
          monthly SIP, the quarterly step-up and your expected return to see where you land.
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="panel p-5 sm:p-8">
          <h2 className="text-base font-semibold sm:text-lg">Input details</h2>
          <div className="mt-6 space-y-7 sm:mt-8 sm:space-y-9">

            <Field
              label="Monthly SIP amount"
              hint="Your starting monthly investment"
              value={monthlySip}
              onChange={setMonthlySip}
              min={500}
              max={500000}
              step={500}
              suffix="₹"
            />
            <Field
              label="Quarterly step-up"
              hint="SIP increases by this much every 3 months"
              value={quarterlyStepUp}
              onChange={setQuarterlyStepUp}
              min={0}
              max={25}
              step={0.5}
              suffix="%"
            />
            <Field
              label="Expected return rate"
              hint="Per annum, compounded monthly"
              value={annualReturn}
              onChange={setAnnualReturn}
              min={1}
              max={30}
              step={0.5}
              suffix="p.a."
            />
            <Field
              label="Time period"
              hint="Investment horizon"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix="yrs"
            />
          </div>
        </section>

        <section className="panel p-5 sm:p-8">
          <h2 className="text-base font-semibold sm:text-lg">Output details</h2>

          <div className="mt-6 rounded-2xl border border-border bg-ink/40 p-5 sm:mt-8 sm:p-6">
            <p className="text-[0.65rem] font-semibold tracking-widest uppercase text-muted-foreground sm:text-xs">
              Total amount
            </p>
            <p className="mt-2 font-display text-[1.9rem] leading-tight font-bold break-words text-brand sm:text-5xl">
              {formatCurrency(result.total)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
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

          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
            <div className="rounded-2xl border border-border p-4 sm:p-5">
              <p className="text-[0.65rem] font-semibold tracking-widest uppercase text-muted-foreground sm:text-xs">
                Invested
              </p>
              <p className="mt-2 font-display text-lg font-semibold break-words sm:text-2xl">
                {formatCurrency(result.invested)}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4 sm:p-5">
              <p className="text-[0.65rem] font-semibold tracking-widest uppercase text-muted-foreground sm:text-xs">
                Returns
              </p>
              <p className="mt-2 font-display text-lg font-semibold break-words text-gold sm:text-2xl">
                {formatCurrency(result.returns)}
              </p>
            </div>
          </div>


          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Invested {investedShare.toFixed(0)}%</span>
              <span>Returns {(100 - investedShare).toFixed(0)}%</span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-muted">
              <div className="bg-brand" style={{ width: `${investedShare}%` }} />
              <div className="flex-1 bg-gold" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Growth multiple:{" "}
              <span className="font-semibold text-foreground">
                {(result.invested > 0 ? result.total / result.invested : 0).toFixed(2)}x
              </span>{" "}
              on money invested.
            </p>
          </div>
        </section>
      </div>

      <section className="panel mt-5 p-5 sm:mt-6 sm:p-8">
        <h2 className="text-base font-semibold sm:text-lg">Year-by-year growth</h2>

        {/* Mobile: stacked cards */}
        <ul className="mt-5 space-y-3 sm:hidden">
          {result.rows.map((row) => (
            <li key={row.year} className="rounded-xl border border-border p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Year {row.year}
                </span>
                <span className="shrink-0 font-display text-lg font-semibold">
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
                <span className="text-gold">+{formatCurrency(row.returns)}</span>
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
                <tr key={row.year} className="border-t border-border/70">
                  <td className="py-3 font-semibold">{row.year}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatCurrency(row.invested)}
                  </td>
                  <td className="py-3 text-gold">{formatCurrency(row.returns)}</td>
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


      <footer className="mt-10 text-xs leading-relaxed text-muted-foreground">
        Returns are compounded monthly and the SIP amount steps up at the start of every
        quarter. Figures are indicative estimates, not investment advice.
      </footer>
    </main>
  );
}
