import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import CategoryRounded from '@mui/icons-material/CategoryRounded'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import Footer from '../components/ui/Footer'

const EMPTY_FORM = { name: '', slug: '', color: '#3b82f6' }

export default function AdminCategories() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call
    const [categories] = useState([])
    const [loading]    = useState(false)
    const [searchTerm, setSearchTerm]   = useState('')
    const [openDialog, setOpenDialog]   = useState(false)
    const [isEdit, setIsEdit]           = useState(false)
    const [selectedCat, setSelectedCat] = useState(null)
    const [submitting, setSubmitting]   = useState(false)
    const [formData, setFormData]       = useState(EMPTY_FORM)

    const filtered = categories.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenAdd = () => {
        setIsEdit(false); setSelectedCat(null)
        setFormData(EMPTY_FORM); setOpenDialog(true)
    }
    const handleOpenEdit = (cat) => {
        setIsEdit(true); setSelectedCat(cat)
        setFormData({ name: cat.name, slug: cat.slug, color: cat.color || '#3b82f6' })
        setOpenDialog(true)
    }
    const field = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }))

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin')} className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400">
                    {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                </Button>

                <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Box className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <CategoryRounded className="text-amber-600 !text-xl" />
                            </div>
                            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                                {t('home.admin.services.categories.title', 'Kategoritë')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                            {t('home.admin.services.categories.desc', 'Organizoni kurset në kategori dhe tema.')}
                        </Typography>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <TextField
                            placeholder="Kërko kategori..."
                            variant="outlined" size="small" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64"
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Button variant="contained" startIcon={<AddRounded />} onClick={handleOpenAdd}
                            className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-amber-600 hover:!bg-amber-700 shadow-lg shadow-amber-500/20">
                            Shto Kategori
                        </Button>
                    </div>
                </Box>

                <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {loading ? (
                        <Box className="flex justify-center py-24"><CircularProgress className="!text-amber-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                                    <TableRow>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Ngjyra</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Emri</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Slug</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Kurse</TableCell>
                                        <TableCell align="right" className="!font-bold !text-slate-700 dark:!text-slate-200">Veprime</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Box className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                                        <CategoryOutlinedIcon className="!text-4xl text-amber-400" />
                                                    </div>
                                                    <Typography className="!font-semibold !text-slate-500">Nuk ka kategori akoma.</Typography>
                                                    <Button variant="outlined" startIcon={<AddRounded />} onClick={handleOpenAdd} className="!rounded-xl !normal-case !border-amber-300 !text-amber-600">
                                                        Shto Kategorinë e Parë
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((cat) => (
                                        <TableRow key={cat.id} hover>
                                            <TableCell>
                                                <div className="h-8 w-8 rounded-lg shadow-sm" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                                            </TableCell>
                                            <TableCell className="!font-semibold !text-slate-800 dark:!text-slate-100">{cat.name}</TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300">{cat.slug}</code>
                                            </TableCell>
                                            <TableCell className="!text-slate-500 !text-sm">{cat.courseCount ?? '—'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenEdit(cat)} className="!text-slate-400 hover:!text-amber-600"><EditRounded fontSize="small" /></IconButton>
                                                <IconButton size="small" className="!text-slate-400 hover:!text-rose-600"><DeleteRounded fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle className="!font-bold">{isEdit ? 'Ndrysho Kategorinë' : 'Shto Kategori të Re'}</DialogTitle>
                    <DialogContent>
                        <Box className="flex flex-col gap-4 mt-2">
                            <TextField label="Emri i Kategorisë" fullWidth value={formData.name} onChange={field('name')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            <TextField label="Slug (URL)" fullWidth value={formData.slug} onChange={field('slug')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            <Box>
                                <Typography variant="caption" className="!text-slate-500 !mb-2 block">Ngjyra</Typography>
                                <input type="color" value={formData.color} onChange={field('color')} className="h-10 w-16 rounded-lg cursor-pointer border border-slate-300" />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions className="!p-4">
                        <Button onClick={() => setOpenDialog(false)} className="!rounded-xl !normal-case !text-slate-600">Anulo</Button>
                        <Button variant="contained" disabled={submitting || !formData.name} className="!rounded-xl !normal-case !font-bold !bg-amber-600 hover:!bg-amber-700">
                            {submitting ? 'Duke ruajtur...' : (isEdit ? 'Ruaj Ndryshimet' : 'Shto Kategorinë')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Footer />
        </section>
    )
}
