import "./globals.css";



export const metadata = {
  title: "IMD Curriculum Manager",
  description: "Manage IMD courses, ECTS and reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen text-gray-800">
        {children}
      </body>
    </html>
  );
}
