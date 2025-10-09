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
      <body
        className={`bg-gray-900 text-white min-h-screen`}
        suppressHydrationWarning
      >
        <MyProvider>
          <NavBar />
          {children}
        </MyProvider>
      </body>
    </html>
  );
}
