import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import VerifiedRounded from '@mui/icons-material/VerifiedRounded'
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import { useAppPreferences } from '../context/appPreferencesContext'

export default function CertificateVerify() {
    const { kodiUnik } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [cert, setCert]     = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        axiosInstance.get(`/certificates/kod/${kodiUnik}`)
            .then(res => setCert(res.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [kodiUnik])

    if (loading) {
        return (
            <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <CircularProgress className="!text-emerald-500" />
            </Box>
        )
    }

    if (notFound) {
        return (
            <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                <div className="w-full max-w-sm rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-8 text-center shadow-xl">
                    <ErrorOutlineRounded className="!text-5xl text-red-400 !mb-3" />
                    <Typography variant="h6" className="!font-black !text-slate-900 dark:!text-white !mb-2">
                        {t('certificateVerify.notFoundTitle')}
                    </Typography>
                    <Typography variant="body2" className="!text-slate-500 !mb-5">
                        <span className="font-mono">{kodiUnik}</span> {t('certificateVerify.notFoundDesc')}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/')} className="!normal-case !rounded-xl">
                        {t('certificateVerify.backBtn')}
                    </Button>
                </div>
            </Box>
        )
    }

    return (
        <Box className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
            <Container maxWidth="sm">
                {}
                <div className="overflow-hidden rounded-3xl shadow-2xl shadow-emerald-200/40 dark:shadow-none">

                    {}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-center">
                        <WorkspacePremiumRounded className="!text-7xl text-white/90 !mb-4" />
                        <Typography variant="overline" className="!font-bold !tracking-widest !text-white/70 !block">
                            {t('certificateVerify.completionLabel')}
                        </Typography>
                        <Typography variant="h4" className="!font-black !text-white !mt-1 !leading-tight">
                            {cert.subjectTitulli}
                        </Typography>
                    </div>

                    {}
                    <div className="bg-white dark:bg-slate-900 px-8 py-7">
                        {}
                        <div className="mb-6 text-center">
                            <Typography variant="caption" className="!font-bold !uppercase !tracking-widest !text-slate-400 dark:!text-slate-500 !block !mb-1">
                                {t('certificateVerify.issuedFor')}
                            </Typography>
                            <Typography variant="h5" className="!font-black !text-slate-900 dark:!text-white">
                                {cert.userEmri}
                            </Typography>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
                                <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500 !block !mb-0.5">
                                    {t('certificateVerify.issuedDate')}
                                </Typography>
                                <Typography variant="body2" className="!font-bold !text-slate-700 dark:!text-slate-200">
                                    {new Date(cert.dataLeshimit).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Typography>
                            </div>
                            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center">
                                <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-emerald-600 dark:!text-emerald-400 !block !mb-0.5">
                                    {t('certificateVerify.status')}
                                </Typography>
                                <div className="flex items-center justify-center gap-1">
                                    <VerifiedRounded className="!text-base text-emerald-500" />
                                    <Typography variant="body2" className="!font-bold !text-emerald-700 dark:!text-emerald-300">
                                        {t('certificateVerify.validStatus')}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 mb-6">
                            <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500 !block !mb-1">
                                {t('certificateVerify.uniqueCode')}
                            </Typography>
                            <Typography variant="body2" className="!font-mono !text-slate-600 dark:!text-slate-300 !break-all">
                                {cert.kodiUnik}
                            </Typography>
                        </div>

                        {}
                        <div className="rounded-xl bg-emerald-500 px-4 py-3 flex items-center gap-3 mb-6">
                            <VerifiedRounded className="!text-2xl text-white shrink-0" />
                            <div>
                                <Typography variant="body2" className="!font-black !text-white">
                                    {t('certificateVerify.verifiedTitle')}
                                </Typography>
                                <Typography variant="caption" className="!text-white/80">
                                    {t('certificateVerify.verifiedDesc')}
                                </Typography>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ArrowBackRounded />}
                            onClick={() => navigate('/')}
                            className="!rounded-xl !normal-case !border-slate-300 !text-slate-600 dark:!text-slate-300"
                        >
                            {t('certificateVerify.backHome')}
                        </Button>
                    </div>
                </div>
            </Container>
        </Box>
    )
}
