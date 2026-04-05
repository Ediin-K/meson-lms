import { useCallback, useEffect, useRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

const SCROLL_THRESHOLD_PX = 80

/**
 * Scrollable legal document modal with optional “must scroll” before acknowledge.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ title: string, subtitle: string, sections: { id: string, heading: string, paragraphs: string[] }[] }} props.document
 * @param {() => void} props.onAcknowledge — user confirms they have read the document
 * @param {boolean} [props.requireScrollToAcknowledge]
 */
export default function LegalDocumentModal({
  open,
  onClose,
  document: doc,
  onAcknowledge,
  requireScrollToAcknowledge = false,
}) {
  const scrollRef = useRef(null)
  const [canAcknowledge, setCanAcknowledge] = useState(!requireScrollToAcknowledge)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (!requireScrollToAcknowledge) {
      setCanAcknowledge(true)
      return
    }
    const { scrollTop, scrollHeight, clientHeight } = el
    const nearBottom = scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD_PX
    setCanAcknowledge(nearBottom)
  }, [requireScrollToAcknowledge])

  useEffect(() => {
    if (!open) return
    setCanAcknowledge(!requireScrollToAcknowledge)
    const t = window.requestAnimationFrame(() => {
      updateScrollState()
    })
    return () => window.cancelAnimationFrame(t)
  }, [open, requireScrollToAcknowledge, updateScrollState, doc?.title])

  const handleAcknowledge = () => {
    onAcknowledge()
    onClose()
  }

  if (!doc) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="legal-modal-title"
      slotProps={{
        paper: {
          className:
            'rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900 sm:rounded-2xl',
        },
      }}
    >
      <DialogTitle
        id="legal-modal-title"
        className="relative flex items-start justify-between gap-3 border-b border-slate-200/80 pr-12 dark:border-slate-600/80"
      >
        <span>
          <Typography component="span" variant="h6" className="block font-bold text-slate-900 dark:text-slate-50">
            {doc.title}
          </Typography>
          <Typography variant="caption" className="mt-1 block text-slate-500 dark:text-slate-400">
            {doc.subtitle}
          </Typography>
        </span>
        <IconButton
          type="button"
          aria-label="Close"
          onClick={onClose}
          size="small"
          className="absolute right-2 top-2 text-slate-600 dark:text-slate-300"
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        ref={scrollRef}
        onScroll={updateScrollState}
        className="max-h-[min(70vh,520px)] px-4 py-4 sm:px-6"
        tabIndex={0}
      >
        <div className="space-y-8 pb-2">
          {doc.sections.map((section) => (
            <section key={section.id} aria-labelledby={`legal-section-${section.id}`}>
              <Typography
                id={`legal-section-${section.id}`}
                variant="subtitle1"
                component="h2"
                className="mb-2 font-semibold text-slate-900 dark:text-slate-100"
              >
                {section.heading}
              </Typography>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <Typography
                    key={`${section.id}-${i}`}
                    variant="body2"
                    component="p"
                    className="whitespace-pre-line text-slate-600 leading-relaxed dark:text-slate-300"
                  >
                    {p}
                  </Typography>
                ))}
              </div>
            </section>
          ))}
        </div>

        {requireScrollToAcknowledge && !canAcknowledge ? (
          <Typography variant="caption" className="mt-4 block text-amber-700 dark:text-amber-400">
            Scroll to the end of this document to enable the confirmation button.
          </Typography>
        ) : null}
      </DialogContent>

      <DialogActions className="flex flex-col gap-2 border-t border-slate-200/80 px-4 py-3 dark:border-slate-600/80 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" onClick={onClose} color="inherit" className="order-2 sm:order-1">
          Close
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={requireScrollToAcknowledge && !canAcknowledge}
          onClick={handleAcknowledge}
          className="order-1 w-full bg-indigo-600 font-semibold normal-case hover:bg-indigo-500 sm:order-2 sm:w-auto"
        >
          I have read and understood
        </Button>
      </DialogActions>
    </Dialog>
  )
}
