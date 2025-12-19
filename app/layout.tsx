import type { Metadata } from "next";
import "./globals.css";
import { ReceiptProvider } from "@/context/ReceiptContext";

export const metadata: Metadata = {
  title: "Receipt Splitter",
  description: "Split restaurant bills fairly and easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReceiptProvider>
          {children}
        </ReceiptProvider>
      </body>
    </html>
  );
}
