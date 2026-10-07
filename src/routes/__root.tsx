import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Quarterly Step-Up SIP Calculator — Grow Your SIP Every Quarter | Free Online Tool" },
      {
        name: "description",
        content: "Free quarterly step-up SIP calculator. Calculate how increasing your SIP by a fixed percentage every quarter compounds your wealth. Interactive year-by-year growth charts, invested vs returns donut chart, and growth multiples. Plan smarter investments today.",
      },
      {
        name: "keywords",
        content: "step up SIP calculator, quarterly step up SIP calculator, quarterly SIP calculator, SIP step up calculator online, mutual fund SIP calculator, SIP growth calculator, quarterly step up SIP, investment calculator India, SIP returns calculator, systematic investment plan calculator, SIP increase calculator, step up SIP benefits, quarterly SIP step up meaning, SIP calculator with annual step up, best SIP calculator India",
      },
      { name: "author", content: "Kothari Brothers" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "rating", content: "general" },
      { name: "theme-color", content: "#0a1628" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Step-Up SIP Calculator" },
      { name: "application-name", content: "Quarterly Step-Up SIP Calculator" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:site_name", content: "Quarterly Step-Up SIP Calculator" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Quarterly Step-Up SIP Calculator — Grow Your SIP Every Quarter | Free Tool" },
      { name: "twitter:title", content: "Quarterly Step-Up SIP Calculator — Grow Your SIP Every Quarter | Free Tool" },
      { property: "og:description", content: "Free quarterly step-up SIP calculator with interactive charts. See how increasing your SIP every quarter compounds your wealth with year-by-year growth breakdown and growth multiples." },
      { name: "twitter:description", content: "Free quarterly step-up SIP calculator with interactive charts. See how increasing your SIP every quarter compounds your wealth with year-by-year growth breakdown and growth multiples." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Quarterly Step-Up SIP Calculator",
              alternateName: ["Step Up SIP Calculator", "Quarterly SIP Calculator"],
              description: "Free quarterly step-up SIP calculator with interactive year-by-year growth charts, invested vs returns donut chart, and growth multiples. Calculate how increasing your SIP every quarter can compound your wealth faster.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Any",
              inLanguage: "en-IN",
              offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
              creator: { "@type": "Organization", name: "Kothari Brothers" },
              featureList: [
                "Quarterly step-up SIP calculation",
                "Year-by-year growth breakdown",
                "Interactive donut chart (invested vs returns)",
                "Growth multiple indicator",
                "Final SIP amount projection",
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is a Step-Up SIP?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A Step-Up SIP (Systematic Investment Plan) increases your monthly investment by a fixed percentage at regular intervals. In a quarterly step-up SIP, the increase happens every 3 months. This helps align your investments with salary hikes and income growth, resulting in significantly higher wealth accumulation compared to a regular SIP.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is the quarterly step-up applied?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Every 3 months, your monthly SIP amount is multiplied by (1 + step-up %). For example, a ₹10,000 SIP with 5% quarterly step-up becomes ₹10,500 after the first quarter, ₹11,025 after the second, and so on. This compounding on contributions significantly boosts long-term wealth.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the return rate guaranteed?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. The expected return rate is an assumption for illustration purposes. Actual mutual fund returns vary based on market conditions. Past performance is not indicative of future results. This calculator provides indicative estimates to help you plan your investments.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the growth multiple?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The growth multiple shows how many times your total corpus value exceeds your total invested amount. A 2x multiple means your money has doubled. A higher growth multiple indicates stronger compounding returns over the investment period.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the difference between step-up SIP and regular SIP?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "In a regular SIP, you invest a fixed amount every month throughout the investment period. In a step-up SIP, your monthly investment increases by a set percentage at regular intervals (quarterly or annually). Step-up SIPs help you invest more as your income grows, leading to a significantly larger corpus compared to regular SIPs over the same period.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much more can I earn with a quarterly step-up SIP vs a regular SIP?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The difference depends on the step-up percentage and investment duration. For example, with a ₹10,000 monthly SIP, 12% annual returns, and 5% quarterly step-up over 20 years, your corpus could be 3-4x larger than a regular SIP with the same starting amount. Use our calculator to see the exact numbers for your scenario.",
                  },
                },
              ],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Quarterly Step-Up SIP Calculator",
                },
              ],
            },
            {
              "@type": "HowTo",
              name: "How to Use the Quarterly Step-Up SIP Calculator",
              description: "Follow these simple steps to calculate how much your quarterly step-up SIP will grow over time.",
              step: [
                {
                  "@type": "HowToStep",
                  position: 1,
                  name: "Enter Monthly Investment",
                  text: "Enter your starting monthly SIP amount in rupees. This is the amount you plan to invest every month initially.",
                },
                {
                  "@type": "HowToStep",
                  position: 2,
                  name: "Set Quarterly Step-Up Percentage",
                  text: "Choose the percentage by which your SIP will increase every quarter. A typical range is 2-10%.",
                },
                {
                  "@type": "HowToStep",
                  position: 3,
                  name: "Set Expected Annual Return Rate",
                  text: "Enter the expected annual return rate from your mutual fund investments. Equity funds have historically returned 12-15% per annum.",
                },
                {
                  "@type": "HowToStep",
                  position: 4,
                  name: "Choose Investment Duration",
                  text: "Select the number of years you plan to continue the SIP. Longer durations benefit more from compounding.",
                },
                {
                  "@type": "HowToStep",
                  position: 5,
                  name: "View Results",
                  text: "Instantly see your total invested amount, estimated returns, total corpus value, growth multiple, and year-by-year breakdown.",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
