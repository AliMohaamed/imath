export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-8">
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">iMath Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
             <span className="text-slate-600 font-bold">A</span>
          </div>
        </div>
      </header>
      <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
        {children}
      </main>
    </div>
  );
}
