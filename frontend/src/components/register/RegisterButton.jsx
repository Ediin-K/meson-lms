/**
 * Primary CTA — gradient indigo, rounded, hover lift.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'button' | 'submit'} [props.type]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 */
export default function RegisterButton({ children, type = 'submit', disabled, onClick }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'w-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-500 px-6 py-3.5',
        'text-base font-semibold text-white shadow-lg shadow-indigo-500/30',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-indigo-500/35',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        'active:scale-[0.99]',
        disabled ? 'cursor-not-allowed opacity-50 hover:scale-100' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
