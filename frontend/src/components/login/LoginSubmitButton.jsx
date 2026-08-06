import CircularProgress from '@mui/material/CircularProgress'

export default function LoginSubmitButton({ loading, disabled, children }) {
  const isDisabled = loading || disabled
  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={[
        'flex w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600',
        'px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:from-blue-500 hover:via-blue-600 hover:to-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        'active:scale-[0.99]',
        loading ? 'cursor-wait opacity-90' : '',
        disabled && !loading ? 'cursor-not-allowed opacity-50 hover:scale-100 hover:shadow-lg' : '',
      ].join(' ')}
    >
      {loading ? (
        <>
          <CircularProgress size={22} thickness={4} sx={{ color: 'inherit' }} aria-hidden />
          <span>Signing in…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
