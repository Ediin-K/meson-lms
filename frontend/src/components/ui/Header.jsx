import { useState } from 'react'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'My courses', href: '#' },
  { label: 'Catalog', href: '#' },
  { label: 'Assignments', href: '#' },
  { label: 'Calendar', href: '#' },
  { label: 'Grades', href: '#' },
  { label: 'Messages', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Help', href: '#' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-gradient-to-b from-sky-50/95 to-white/95 shadow-[0_1px_0_0_rgba(14,165,233,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-5">
        {/* Brand — vetëm tekst */}
        <a
          href="#"
          className="shrink-0 select-none text-3xl font-black tracking-tight text-sky-700 no-underline sm:text-4xl"
          style={{
            fontFamily:
              'ui-rounded, "Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
          }}
        >
          meson
        </a>

        {/* Nav desktop */}
        <nav
          className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex lg:gap-1"
          aria-label="Main navigation"
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-slate-600 no-underline transition-colors hover:bg-sky-100/90 hover:text-sky-800 lg:px-3"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Veprime djathtas */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden rounded-full border-2 border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 sm:inline-flex sm:px-4"
          >
            Log in
          </button>
          <button
            type="button"
            className="hidden rounded-full px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-sky-100/70 hover:text-sky-800 md:inline-flex md:px-3"
          >
            Log out
          </button>

          {/* Profil + menu (hover desktop) — vetëm dizajn */}
          <div className="meson-profile-wrap relative hidden md:block">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-sky-100 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-sky-200 hover:shadow sm:pr-3"
              aria-haspopup="menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 text-sm font-bold text-white shadow-inner">
                S
              </span>
              <span className="hidden max-w-[5.5rem] truncate text-left text-sm font-medium text-slate-700 lg:inline">
                Student
              </span>
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className="meson-profile-menu pointer-events-none invisible absolute right-0 top-full z-50 mt-1.5 w-56 origin-top-right scale-95 rounded-2xl border border-sky-100 bg-white p-2 opacity-0 shadow-xl shadow-sky-200/40 transition duration-150"
              role="menu"
            >
              <button
                type="button"
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50"
                role="menuitem"
              >
                Profile
              </button>
              <button
                type="button"
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50"
                role="menuitem"
              >
                Account settings
              </button>
              <div className="my-1 h-px bg-sky-100" />
              <button
                type="button"
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                role="menuitem"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="inline-flex rounded-xl p-2 text-slate-600 hover:bg-sky-100 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* CSS: menu profili në hover (pa logjikë shtesë) */}
      <style>{`
        @media (min-width: 768px) {
          .meson-profile-wrap:hover .meson-profile-menu,
          .meson-profile-menu:hover {
            pointer-events: auto;
            visibility: visible;
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Panel mobil */}
      {mobileOpen && (
        <div className="border-t border-sky-100 bg-white/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-sky-50"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-sky-100 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-sky-50/80 px-3 py-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 text-sm font-bold text-white">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Student</p>
                <p className="text-xs text-slate-500">Profile preview</p>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-sky-50"
            >
              Profile
            </button>
            <button
              type="button"
              className="w-full rounded-xl border-2 border-sky-200 bg-white py-3 text-sm font-semibold text-sky-700"
            >
              Log in
            </button>
            <button
              type="button"
              className="w-full rounded-xl py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
