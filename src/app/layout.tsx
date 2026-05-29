// @ts-ignore
import "./globals.css";
import NavBar from "@/components/NavBar";
import MyProvider from "@/components/MyProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <MyProvider>
          <div className="min-h-screen bg-[#0F172A] text-slate-100">
            <NavBar />
            {children}
          </div>
        </MyProvider>
      </body>
    </html>
  );
}