import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CoPresentOutlinedIcon from '@mui/icons-material/CoPresentOutlined'
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined'

const ICONS = {
  student: SchoolOutlinedIcon,
  instructor: CoPresentOutlinedIcon,
  parent: FamilyRestroomOutlinedIcon,
}

/**
 * @param {object} props
 * @param {'student' | 'instructor' | 'parent'} props.roleId
 * @param {string} props.title
 * @param {string} props.description
 * @param {boolean} props.selected
 * @param {() => void} props.onSelect
 */
export default function RoleCard({ roleId, title, description, selected, onSelect }) {
  const Icon = ICONS[roleId] || SchoolOutlinedIcon

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${description}`}
      onClick={onSelect}
      className={[
        'group relative flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        selected
          ? 'border-indigo-600 bg-indigo-50/90 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] dark:border-indigo-400 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-600 dark:bg-slate-800/80 dark:hover:border-indigo-500',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          selected
            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        ].join(' ')}
      >
        <Icon fontSize="small" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      <span
        className={[
          'absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 transition-colors',
          selected
            ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400'
            : 'border-slate-300 bg-transparent dark:border-slate-500',
        ].join(' ')}
        aria-hidden
      />
    </button>
  )
}
