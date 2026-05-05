import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Avatar, CircularProgress
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import PeopleOutlineRounded from '@mui/icons-material/PeopleOutlineRounded'
import Footer from '../components/ui/Footer'

const ROLE_STYLE = {
    admin:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    teacher: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
    student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    parent:  'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
}
const AVATAR_GRADIENT = {
    admin:   'from-violet-500 to-purple-600',
    teacher: 'from-sky-500 to-blue-600',
    student: 'from-emerald-500 to-teal-600',
    parent:  'from-amber-500 to-orange-600',
}
const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'student', status: 'active' }

export default function AdminUsers() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call — const [users, setUsers] = useState([])
    const [users]         = useState([])
    const [loading]       = useState(false)
    const [searchTerm, setSearchTerm]   = useState('')
    const [openDialog, setOpenDialog]   = useState(false)
    const [isEdit, setIsEdit]           = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [submitting, setSubmitting]   = useState(false)
    const [formData, setFormData]       = useState(EMPTY_FORM)

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenAdd = () => {
        setIsEdit(false); setSelectedUser(null)
        setFormData(EMPTY_FORM); setOpenDialog(true)
    }
    const handleOpenEdit = (user) => {
        setIsEdit(true); setSelectedUser(user)
        setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role, status: user.status })
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
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <PeopleRounded className="text-indigo-600 !text-xl" />
                            </div>
                            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                                {t('adminUsers.title', 'Menaxhimi i Përdoruesve')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                            {t('adminUsers.subtitle', 'Menaxho llogaritë, rolet dhe statusin e përdoruesve.')}
                        </Typography>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <TextField
                            placeholder={t('adminUsers.searchPlaceholder', 'Kërko me emër ose email...')}
                            variant="outlined" size="small" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64"
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Button variant="contained" startIcon={<AddRounded />} onClick={handleOpenAdd}
                            className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-500/20">
                            {t('adminUsers.form.addTitle', 'Shto Përdorues')}
                        </Button>
                    </div>
                </Box>

                <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {loading ? (
                        <Box className="flex justify-center py-24"><CircularProgress className="!text-indigo-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                                    <TableRow>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminUsers.table.name', 'Emri')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminUsers.table.role', 'Roli')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminUsers.table.status', 'Statusi')}</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminUsers.table.joined', 'Anëtarësuar')}</TableCell>
                                        <TableCell align="right" className="!font-bold !text-slate-700 dark:!text-slate-200">{t('adminUsers.table.actions', 'Veprime')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Box className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                                        <PeopleOutlineRounded className="!text-4xl text-indigo-400" />
                                                    </div>
                                                    <Typography className="!font-semibold !text-slate-500">{t('adminUsers.noUsers', 'Nuk ka përdorues akoma.')}</Typography>
                                                    <Button variant="outlined" startIcon={<AddRounded />} onClick={handleOpenAdd}
                                                        className="!rounded-xl !normal-case !border-indigo-300 !text-indigo-600">
                                                        {t('adminUsers.form.addTitle', 'Shto Përdoruesin e Parë')}
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box className="flex items-center gap-3">
                                                    <Avatar className={`!w-9 !h-9 !text-sm !bg-gradient-to-br ${AVATAR_GRADIENT[user.role] || 'from-slate-400 to-slate-500'} !font-bold`}>
                                                        {user.firstName?.charAt(0)}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_STYLE[user.role] || ''}`}>{user.role}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                    {user.status === 'active' ? t('adminUsers.status.active', 'Aktiv') : t('adminUsers.status.inactive', 'Joaktiv')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="!text-slate-500 !text-sm">{user.joined}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenEdit(user)} className="!text-slate-400 hover:!text-indigo-600"><EditRounded fontSize="small" /></IconButton>
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
                    <DialogTitle className="!font-bold !text-slate-900 dark:!text-white">
                        {isEdit ? t('adminUsers.form.editTitle', 'Ndrysho Përdoruesin') : t('adminUsers.form.addTitle', 'Shto Përdorues të Ri')}
                    </DialogTitle>
                    <DialogContent>
                        <Box className="flex flex-col gap-4 mt-2">
                            <Box className="flex gap-3">
                                <TextField label={t('adminUsers.form.firstName', 'Emri')} fullWidth value={formData.firstName} onChange={field('firstName')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                <TextField label={t('adminUsers.form.lastName', 'Mbiemri')} fullWidth value={formData.lastName} onChange={field('lastName')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            </Box>
                            <TextField label={t('adminUsers.form.email', 'Email')} type="email" fullWidth value={formData.email} onChange={field('email')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                            {!isEdit && <TextField label={t('adminUsers.form.password', 'Fjalëkalimi')} type="password" fullWidth value={formData.password} onChange={field('password')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                            <Box className="flex gap-3">
                                <FormControl fullWidth size="small">
                                    <InputLabel>{t('adminUsers.form.role', 'Roli')}</InputLabel>
                                    <Select value={formData.role} label={t('adminUsers.form.role', 'Roli')} onChange={field('role')} sx={{ borderRadius: '12px' }}>
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Pedagog</MenuItem>
                                        <MenuItem value="parent">Prind</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Statusi</InputLabel>
                                    <Select value={formData.status} label="Statusi" onChange={field('status')} sx={{ borderRadius: '12px' }}>
                                        <MenuItem value="active">{t('adminUsers.status.active', 'Aktiv')}</MenuItem>
                                        <MenuItem value="inactive">{t('adminUsers.status.inactive', 'Joaktiv')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions className="!p-4">
                        <Button onClick={() => setOpenDialog(false)} className="!rounded-xl !normal-case !text-slate-600">{t('adminUsers.form.cancel', 'Anulo')}</Button>
                        <Button variant="contained" disabled={submitting || !formData.firstName || !formData.email}
                            className="!rounded-xl !normal-case !font-bold !bg-indigo-600 hover:!bg-indigo-700">
                            {submitting ? t('adminUsers.form.creating', 'Duke ruajtur...') : t('adminUsers.form.save', 'Ruaj')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Footer />
        </section>
    )
}
