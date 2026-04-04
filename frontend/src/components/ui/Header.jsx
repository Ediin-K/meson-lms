import { useState } from 'react'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'My courses', href: '#' },
  { label: 'Assignments', href: '#' },
  { label: 'Library', href: '#' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 -mx-4 border-b border-slate-200/80 bg-gradient-to-b from-white/98 via-sky-50/40 to-slate-100/55 shadow-[0_1px_0_0_rgba(15,23,42,0.06)] backdrop-blur-md">
      <div
        className="h-1 w-full bg-gradient-to-r from-slate-900 via-sky-500 to-indigo-900"
        aria-hidden
      />
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6 md:gap-8">
          <a
            href="#"
            className="shrink-0 select-none bg-gradient-to-r from-slate-900 via-sky-700 to-sky-600 bg-clip-text text-3xl font-black tracking-tight text-transparent no-underline sm:text-4xl"
            style={{
              fontFamily:
                'ui-rounded, "Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
            }}
          >
            meson
          </a>

          <nav
            className="hidden min-w-0 items-center gap-0.5 overflow-x-auto md:flex lg:gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-900/[0.07] hover:text-slate-900 lg:px-3"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Djathtas: vetëm Log in, Log out, ikonë profili */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden rounded-full border-2 border-slate-300/90 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-500/50 hover:bg-sky-50/90 hover:text-sky-900 sm:inline-flex sm:px-4"
          >
            Log in
          </button>
          <button
            type="button"
            className="hidden rounded-full px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/[0.06] hover:text-slate-900 md:inline-flex md:px-3"
          >
            Log out
          </button>

          {/* Profil: vetëm ikona + dropdown me “urë” hover (pa boshllëk që mbyll menunë) */}
          <div className="meson-profile-wrap relative hidden md:block">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-gradient-to-br from-sky-500 to-indigo-700 text-sm font-bold text-white shadow-md shadow-slate-900/15 transition hover:border-sky-300 hover:shadow-lg"
              aria-haspopup="menu"
              aria-label="Profile menu"
            >
              S
            </button>

            {/* pt-3 = zonë e padukshme midis butonit dhe menysë që mban hover-in aktiv */}
            <div className="meson-profile-bridge absolute right-0 top-full z-50 w-56 pt-4">
              <div
                className="meson-profile-menu rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-xl shadow-slate-900/12"
                role="menu"
              >
                <button
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50/90"
                  role="menuitem"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50/90"
                  role="menuitem"
                >
                  Account settings
                </button>
                <button
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50/90"
                  role="menuitem"
                >
                  Grades
                </button>
                <button
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50/90"
                  role="menuitem"
                >
                  Messages
                </button>
                <button
                    type="button"
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-sky-50/90"
                    role="menuitem"
                >
                  Help
                </button>
                <div className="my-1 h-px bg-slate-200" />
                <button
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                  role="menuitem"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex rounded-xl p-2 text-slate-700 hover:bg-slate-900/[0.06] md:hidden"
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

      <style>{`
        @media (min-width: 768px) {
          .meson-profile-bridge {
            pointer-events: none;
          }
          .meson-profile-wrap:hover .meson-profile-bridge,
          .meson-profile-bridge:hover {
            pointer-events: auto;
          }
          .meson-profile-menu {
            pointer-events: auto;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-4px);
            transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
          }
          .meson-profile-wrap:hover .meson-profile-menu,
          .meson-profile-bridge:hover .meson-profile-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
        }
      `}</style>

      {mobileOpen && (
        <div className="border-t border-slate-200/80 bg-gradient-to-b from-white/98 to-slate-50/90 px-4 py-4 md:hidden sm:px-6">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-900/[0.06]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-sky-50/70 px-3 py-2 ring-1 ring-slate-200/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-sm font-bold text-white shadow-sm">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Student</p>
                <p className="text-xs text-slate-500">Profile</p>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-900/[0.06]"
            >
              Profile
            </button>
            <button
              type="button"
              className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 hover:border-sky-500/40"
            >
              Log in
            </button>
            <button
              type="button"
              className="w-full rounded-xl py-3 text-sm font-semibold text-slate-600 hover:bg-slate-900/[0.05]"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
