import { Container, Typography, Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import Footer from '../components/ui/Footer'

export default function AdminPlaceholder({ title }) {
    const navigate = useNavigate()
    const { t } = useAppPreferences()
    
    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="md" className="flex-grow py-20 text-center">
                <Box className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                    <Typography variant="h4" className="!font-black !text-slate-900 dark:!text-white mb-4">
                        {title}
                    </Typography>
                    <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400 mb-8">
                        {t('home.admin.services.comingSoon', 'Ky modul është në fazën e zhvillimit dhe do të jetë i disponueshëm së shpejti.')}
                    </Typography>
                    <Button 
                        startIcon={<ArrowBackRounded />}
                        variant="contained"
                        onClick={() => navigate('/admin')}
                        className="!rounded-xl !bg-sky-600 !normal-case !font-bold"
                    >
                        {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                    </Button>
                </Box>
            </Container>
            <Footer />
        </section>
    )
}
