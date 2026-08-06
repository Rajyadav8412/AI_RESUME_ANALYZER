import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Upload, History, GitCompare, UserRound, Settings, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'
const items = [['Dashboard','/',LayoutDashboard],['Upload resume','/upload',Upload],['Analysis history','/history',History],['Compare resumes','/compare',GitCompare],['Profile','/profile',UserRound],['Settings','/settings',Settings]]
export function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const displayName = currentUser.username || "User";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(); 
    return (
  <div className="min-h-screen lg:flex">
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#07121f]/95 p-5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-blue">
          <Sparkles size={20} />
        </div>

        <div>
          <b>ResumeIQ</b>
          <p className="text-xs text-slate-500">AI Resume Analyzer</p>
        </div>

        <button
          className="ml-auto lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>

      <nav className="space-y-1">
        {items.map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-5 left-5 right-5 card p-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-blue/20 text-xs font-bold text-cyan">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-slate-500">Free plan</p>
          </div>
        </div>

        <NavLink
          to="/login"
          className="nav-link py-2 text-xs"
          onClick={() => setOpen(false)}
        >
          <LogOut size={15} />
          Sign out
        </NavLink>
      </div>
    </aside>

    {open && (
      <button
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        aria-label="Close navigation"
      />
    )}

    <main className="min-w-0 flex-1">
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 lg:px-10">
        <button className="lg:hidden" onClick={() => setOpen(true)}>
          <Menu />
        </button>

        <div className="hidden text-sm text-slate-500 sm:block">
          Your career companion, powered by AI.
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs text-cyan sm:block">
            3 analyses left
          </div>

          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue/20 text-xs font-bold text-cyan">
            {initials}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5 lg:p-10">
        {children}
      </div>
    </main>
  </div>
);
}