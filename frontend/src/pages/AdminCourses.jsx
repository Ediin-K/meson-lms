import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import BookRounded from '@mui/icons-material/BookRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import Footer from '../components/ui/Footer'

const SEMESTER_COLORS = {
    1: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    2: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    3: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    4: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    5: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    6: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}

const EMPTY_FORM = { title: '', description: '', categoryName: '', semester: 1, credits: 6, instructorName: '' }

export default function AdminCourses() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call — const [courses, setCourses] = useState([])
    const [courses]     = useState([])
    const [loading]     = useState(false)
    const [searchTerm, setSearchTerm]     = useState('')
    const [openDialog, setOpenDialog]     = useState(false)
    const [isEdit, setIsEdit]             = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [submitting, setSubmitting]     = useState(false)
    const [formData, setFormData]         = useState(EMPTY_FORM)

    const filtered = courses.filter(c =>
        (c.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.categoryName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    const handleOpenAdd = () => {
        setIsEdit(false); setSelectedCourse(null)
        setFormData(EMPTY_FORM); setOpenDialog(true)
    }
    const handleOpenEdit = (course) => {
        setIsEdit(true); setSelectedCourse(course)
        setFormData({ title: course.title, description: course.description, categoryName: course.categoryName, semester: course.semester, credits: course.credits, instructorName: course.instructorName })
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
                            <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                                <SchoolRounded className="text-sky-600 !text-xl" />
                            </div>
                            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                                {t('adminCourses.title', 'Menaxhimi i Kurseve')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                            {t('adminCourses.subtitle', 'Krijo, ndrysho dhe menaxho kurset e platformës.')}
                        </Typography>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <TextField
                            placeholder={t('adminCourses.searchPlaceholder', 'Kërko kurse...')}
                            variant="outlined" size="small" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64"
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Button variant="contained" startIcon={<AddRounded />} onClick={handleOpenAdd}
                            className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-sky-600 hover:!bg-sky-700 shadow-lg shadow-sky-500/20">
                            {t('adminCourses.addTitle', 'Shto Kurs')}
                        </Button>
                    </div>
                </Box>

                <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {loading ? (
                        <Box className="flex justify-center py-24"><CircularProgress className="!text-sky-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                                    <TableRow>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminCourses.table.title', 'Titulli')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminCourses.table.category', 'Kategoria')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminCourses.table.semester', 'Semestri')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminCourses.table.instructor', 'Instruktori')}</TableCell>
                                        <TableCell align="right" className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminCourses.table.actions', 'Veprime')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Box className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                                                        <MenuBookRounded className="!text-4xl text-sky-400" />
                                                    </div>
                                                    <Typography className="!font-semibold !text-slate-500">{t('adminCourses.noCourses', 'Nuk ka kurse akoma.')}</Typography>
                                                    <Button variant="outlined" startIcon={<AddRounded />} onClick={handleOpenAdd} className="!rounded-xl !normal-case !border-sky-300 !text-sky-600">
                                                        {t('adminCourses.addTitle', 'Shto Kursin e Parë')}
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((course) => (
                                        <TableRow key={course.id} hover>
                                            <TableCell>
                                                <Box className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/40">
                                                        <BookRounded className="text-sky-600 !text-lg" />
                                                    </div>
                                                    <div>
                                                        <Typography variant="body2" className="!font-semibold !text-slate-900 dark:!text-white">{course.title}</Typography>
                                                        <Typography variant="caption" className="!text-slate-500 line-clamp-1 max-w-[200px] block">{course.description}</Typography>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={course.categoryName || '—'} size="small" className="!font-semibold !bg-slate-100 dark:!bg-slate-800 !text-slate-700 dark:!text-slate-300" />
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SEMESTER_COLORS[course.semester] || SEMESTER_COLORS[1]}`}>Sem. {course.semester}</span>
                                            </TableCell>
                                            <TableCell className="!text-slate-600 dark:!text-slate-400 !text-sm">{course.instructorName || '—'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenEdit(course)} className="!text-slate-400 hover:!text-sky-600"><EditRounded fontSize="small" /></IconButton>
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
                    <DialogTitle className="!font-bold">{isEdit ? t('adminCourses.editTitle', 'Ndrysho Kursin') : t('adminCourses.addTitle', 'Shto Kurs të Ri')}</DialogTitle>
                    <DialogContent>
                        <Box className="flex flex-col gap-4 mt-2">
                            <TextField label={t('adminCourses.form.title', 'Titulli i Kursit')} fullWidth value={formData.title} onChange={field('title')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            <TextField label={t('adminCourses.form.description', 'Përshkrimi')} fullWidth multiline rows={3} value={formData.description} onChange={field('description')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            <TextField label={t('adminCourses.form.categoryId', 'Kategoria')} fullWidth value={formData.categoryName} onChange={field('categoryName')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            <Box className="flex gap-3">
                                <FormControl fullWidth size="small">
                                    <InputLabel>{t('adminCourses.form.semester', 'Semestri')}</InputLabel>
                                    <Select value={formData.semester} label={t('adminCourses.form.semester', 'Semestri')} onChange={field('semester')} sx={{ borderRadius: '12px' }}>
                                        {[1,2,3,4,5,6,7,8].map(s => <MenuItem key={s} value={s}>Semestri {s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>{t('adminCourses.form.credits', 'Kreditet')}</InputLabel>
                                    <Select value={formData.credits} label={t('adminCourses.form.credits', 'Kreditet')} onChange={field('credits')} sx={{ borderRadius: '12px' }}>
                                        {[3,4,5,6,7,8].map(c => <MenuItem key={c} value={c}>{c} ECTS</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <TextField label={t('adminCourses.form.instructorId', 'Instruktori')} fullWidth value={formData.instructorName} onChange={field('instructorName')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                        </Box>
                    </DialogContent>
                    <DialogActions className="!p-4">
                        <Button onClick={() => setOpenDialog(false)} className="!rounded-xl !normal-case !text-slate-600">{t('adminCourses.form.title', 'Anulo')}</Button>
                        <Button variant="contained" disabled={submitting || !formData.title} className="!rounded-xl !normal-case !font-bold !bg-sky-600 hover:!bg-sky-700">
                            {submitting ? t('adminCourses.form.creating', 'Duke ruajtur...') : t('adminCourses.form.save', 'Ruaj Kursin')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Footer />
        </section>
    )
}
