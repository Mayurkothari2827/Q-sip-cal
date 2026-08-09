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
      { title: "Quaterly Step Up Calculator — Grow Your SIP Every Quarter | Free Online Tool" },
      {
        name: "description",
        content: "Free quarterly step-up SIP calculator. See how increasing your SIP every quarter compounds your wealth with year-by-year growth charts, invested vs returns breakdown, and growth multiples.",
      },
      {
        name: "keywords",
        content: "step up SIP calculator, quarterly SIP, SIP step up, mutual fund calculator, SIP growth calculator, quarterly step up SIP, investment calculator India, SIP returns calculator",
      },
      { name: "author", content: "Kothari Brothers" },
      { name: "theme-color", content: "#0a1628" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Step-Up SIP" },
      { name: "application-name", content: "Quaterly Step Up calculator" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Quaterly Step Up calculator" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Quaterly Step Up Calculator — Grow Your SIP Every Quarter" },
      { name: "twitter:title", content: "Quaterly Step Up Calculator — Grow Your SIP Every Quarter" },
      { property: "og:description", content: "Free quarterly step-up SIP calculator. See how increasing your SIP every quarter compounds your wealth with year-by-year growth charts and growth multiples." },
      { name: "twitter:description", content: "Free quarterly step-up SIP calculator. See how increasing your SIP every quarter compounds your wealth with year-by-year growth charts and growth multiples." },
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
              name: "Quaterly Step Up calculator",
              description: "Free quarterly step-up SIP calculator with year-by-year growth charts, invested vs returns donut chart, and growth multiples.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
              creator: { "@type": "Organization", name: "Kothari Brothers" },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is a Step-Up SIP?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A Step-Up SIP increases your monthly investment by a fixed percentage at regular intervals (quarterly in this calculator). It helps align your investments with salary hikes.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is the quarterly step-up applied?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Every 3 months, your monthly SIP amount is multiplied by (1 + step-up %). For example, a ₹10,000 SIP with 5% quarterly step-up becomes ₹10,500 after the first quarter, ₹11,025 after the second, and so on.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the return rate guaranteed?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. The expected return rate is an assumption for illustration purposes. Actual mutual fund returns vary based on market conditions.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the growth multiple?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The growth multiple shows how many times your total value exceeds your total invested amount. A 2x multiple means your money has doubled.",
                  },
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
