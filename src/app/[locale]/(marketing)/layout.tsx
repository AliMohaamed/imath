export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Marketing specific header might go here */}
      <main className="flex-grow">{children}</main>
      {/* Marketing específico footer might go here */}
    </div>
  );
}
