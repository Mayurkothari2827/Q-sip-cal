export type SipInputs = {
  monthlySip: number;
  quarterlyStepUp: number; // percent per quarter
  annualReturn: number; // percent per annum
  years: number;
};

export type YearRow = {
  year: number;
  invested: number;
  value: number;
  returns: number;
};

export type SipResult = {
  invested: number;
  returns: number;
  total: number;
  rows: YearRow[];
};

export function calculateStepUpSip({
  monthlySip,
  quarterlyStepUp,
  annualReturn,
  years,
}: SipInputs): SipResult {
  const monthlyRate = annualReturn / 100 / 12;
  const stepUp = 1 + quarterlyStepUp / 100;
  const totalMonths = Math.max(0, Math.round(years * 12));

  let value = 0;
  let invested = 0;
  let contribution = monthlySip;
  const rows: YearRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    if (month > 1 && (month - 1) % 3 === 0) contribution *= stepUp;
    invested += contribution;
    value = (value + contribution) * (1 + monthlyRate);

    if (month % 12 === 0 || month === totalMonths) {
      rows.push({
        year: Math.ceil(month / 12),
        invested,
        value,
        returns: value - invested,
      });
    }
  }

  return { invested, returns: value - invested, total: value, rows };
}

export function formatCurrency(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}
