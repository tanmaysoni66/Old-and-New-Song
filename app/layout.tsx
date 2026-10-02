import "./globals.css";

export const metadata = {
  title: "Apex Academy - Coaching & Institute Management System",
  description: "Complete Coaching Academy with 8-Module Admin Panel, Admissions, Batches, Study Notes Store with Anti-Piracy Watermarking, Mock Test Series, and Real-Time Firestore Sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="scroll-smooth">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
