import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from '@/components/ui/Toaster'
import { Providers } from '@/components/Providers'
import { headers } from 'next/headers'
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "reTeach - AI Diagnostic Question Generator",
  description: "Generate diagnostic multiple-choice questions from course syllabi. Extract topics, weight learning objectives, create Google Forms, and analyze student results.",
  keywords: "diagnostic assessment, MCQ generator, EdTech, formative assessment, syllabus analysis, Google Forms, educational technology",
  authors: [{ name: "reTeach" }],
  creator: "reTeach",
  publisher: "reTeach",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://reteach.works'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/image.png", sizes: "512x512", type: "image/png" },
      { url: "/image.png", sizes: "256x256", type: "image/png" },
      { url: "/image.png", sizes: "128x128", type: "image/png" },
      { url: "/image.png", sizes: "64x64", type: "image/png" },
      { url: "/image.png", sizes: "32x32", type: "image/png" },
      { url: "/image.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/image.png",
    apple: "/image.png",
  },
  openGraph: {
    title: "reTeach - AI Diagnostic Question Generator",
    description: "Generate diagnostic MCQs from syllabi, create Google Forms, and analyze student performance.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://reteach.works",
    siteName: "reTeach",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "reTeach - EdTech Diagnostic Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "reTeach - Diagnostic Assessment Generator",
    description: "AI-powered MCQ generation from course syllabi.",
    images: ["/logo.png"],
    creator: "@reteach",
    site: "@reteach",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get nonce from headers (set by middleware)
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "reTeach",
              "description": "AI-powered diagnostic question generator that creates MCQs from course syllabi, publishes to Google Forms, and analyzes student performance",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://reteach.works",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free tier available"
              },
              "creator": {
                "@type": "Organization",
                "name": "reTeach",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "https://reteach.works"
              },
              "featureList": [
                "Syllabus topic extraction",
                "Learning objective weighting",
                "AI-generated MCQ questions",
                "Google Form creation",
                "Student results analysis"
              ]
            })
          }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              nonce={nonce}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </Providers>
      </body>
    </html>
  );
}
