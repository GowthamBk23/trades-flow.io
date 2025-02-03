export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add navigation/sidebar here */}
      <main>{children}</main>
    </div>
  );
} 