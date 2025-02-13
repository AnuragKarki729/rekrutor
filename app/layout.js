import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import Loading from "./loading";
import CommonLayout from "@/components/common-layout/index";
import { ClerkProvider } from "@clerk/nextjs";

// Define local fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata
export const metadata = {
  title: "reKrutor",
  description: "reKrutor",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider

      frontendAPI = {process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
      signOutForceRedirectUrl="/sign-in" // Redirect here after signing out
      signInUrl="/sign-in" // Path for the sign-in page
      signUpUrl="/sign-up" // Path for the sign-up page
      signInForceRedirectUrl="/onboard" // Force users to go to /onboard after sign-in
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Add a suspense fallback for loading */}
          <Suspense fallback={<Loading />}>
            {/* Use a common layout wrapper for children */}
            <CommonLayout>{children}</CommonLayout>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
