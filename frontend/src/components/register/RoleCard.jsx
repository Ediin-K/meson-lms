import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CoPresentOutlinedIcon from '@mui/icons-material/CoPresentOutlined'
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'

const ICONS = {
  student: SchoolOutlinedIcon,
  instructor: CoPresentOutlinedIcon,
  parent: FamilyRestroomOutlinedIcon,
}

/**
 * @param {object} props
 * @param {'student' | 'instructor' | 'parent'} props.roleId
 * @param {string} props.title
 * @param {string} props.subtitle
 * @param {string[]} props.highlights
 * @param {boolean} props.selected
 * @param {() => void} props.onSelect
 */
export default function RoleCard({ roleId, title, subtitle, highlights, selected, onSelect }) {
  const Icon = ICONS[roleId] || SchoolOutlinedIcon
  const summary = [subtitle, ...(highlights || [])].filter(Boolean).join('. ')

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${summary}`}
      onClick={onSelect}
      className={[
        'group relative flex h-full min-h-0 w-full min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition-all duration-200 ease-out sm:p-3.5',
        'hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        selected
          ? 'border-indigo-600 bg-indigo-50/90 shadow-sm ring-1 ring-indigo-600/15 dark:border-indigo-400 dark:bg-indigo-950/45 dark:ring-indigo-400/15'
          : 'border-slate-200/90 bg-white hover:border-indigo-300 dark:border-slate-600 dark:bg-slate-800/80 dark:hover:border-indigo-500',
      ].join(' ')}
    >
      <div className="flex flex-col items-center gap-2 text-center sm:gap-2.5">
        <span
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10',
            selected
              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
          ].join(' ')}
        >
          <Icon sx={{ fontSize: 20 }} aria-hidden />
        </span>
        <div className="min-w-0 px-0.5">
          <span className="block text-xs font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-[13px]">
            {title}
          </span>
          {subtitle ? (
            <span className="mt-1 block text-[11px] leading-snug text-slate-600 line-clamp-2 dark:text-slate-400 sm:text-xs">
              {subtitle}
            </span>
          ) : null}
        </div>
        <span
          className={[
            'absolute right-2 top-2 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:right-2.5 sm:top-2.5 sm:h-5 sm:w-5',
            selected
              ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400'
              : 'border-slate-300 bg-transparent dark:border-slate-500',
          ].join(' ')}
          aria-hidden
        >
          {selected ? (
            <CheckRoundedIcon sx={{ fontSize: 14 }} className="text-white dark:text-slate-950" aria-hidden />
          ) : null}
        </span>
      </div>

      {highlights?.length ? (
        <ul className="mt-2.5 space-y-1 border-t border-slate-200/70 pt-2.5 dark:border-slate-600/70">
          {highlights.map((line) => (
            <li
              key={line}
              className="flex items-start justify-center gap-1.5 text-center text-[10px] leading-snug text-slate-600 dark:text-slate-400 sm:text-[11px]"
            >
              <CheckRoundedIcon
                className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
              <span className="min-w-0 break-words">{line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </button>
  )
}
