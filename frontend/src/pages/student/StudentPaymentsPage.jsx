import { Alert, Typography } from '@mui/material'

export default function StudentPaymentsPage() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Typography variant="h4" component="h1" className="!font-bold !text-slate-900 dark:!text-white">
        Pagesat
      </Typography>
      <Alert severity="info" className="!mt-4">
        Moduli i pagesave eshte rezervuar per integrimin financiar te Meson LMS. Kjo faqe ruan strukturen e portalit pa prekur funksionet ekzistuese.
      </Alert>
    </div>
  )
}
