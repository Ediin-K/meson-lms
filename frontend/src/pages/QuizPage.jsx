import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import {
    Typography, Container, Box, Button, CircularProgress,
    Card, CardContent, LinearProgress
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import { useAppPreferences } from '../context/appPreferencesContext.js'

export default function QuizPage() {
    const { quizId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [quiz, setQuiz] = useState(null)
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState({}) // { questionId: [answers] }
    const [selected, setSelected] = useState({}) // { questionId: answerId }
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(null)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true)
                const quizRes = await axiosInstance.get(`/quizzes/${quizId}`)
                const questionsRes = await axiosInstance.get(`/quizzes/${quizId}/questions`)
                setQuiz(quizRes.data)
                setQuestions(questionsRes.data)

                // Merr përgjigjet për çdo pyetje
                const answersMap = {}
                await Promise.all(
                    questionsRes.data.map(async (q) => {
                        const res = await axiosInstance.get(`/quizzes/questions/${q.id}/answers/student`)
                        answersMap[q.id] = res.data
                    })
                )
                setAnswers(answersMap)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchQuiz()
    }, [quizId])

    const handleSelect = (questionId, answerId) => {
        setSelected(prev => ({ ...prev, [questionId]: answerId }))
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)

            // Llogarit notën duke kontrolluar përgjigjet e sakta
            let correct = 0
            await Promise.all(
                questions.map(async (q) => {
                    const allAnswers = await axiosInstance.get(`/quizzes/questions/${q.id}/answers`)
                    const correctAnswer = allAnswers.data.find(a => a.eshteSakte)
                    if (correctAnswer && selected[q.id] === correctAnswer.id) {
                        correct++
                    }
                })
            )

            const pikete = (correct / questions.length) * 100

            // Merr userId nga localStorage
            const userId = JSON.parse(localStorage.getItem('user'))?.id

            await axiosInstance.post('/quizzes/attempts', {
                quizId: Number(quizId),
                userId: userId,
                pikete: pikete,
                kohaSekondat: 0
            })

            setScore(pikete)
            setFinished(true)
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    if (finished) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Card elevation={0} className="rounded-3xl border border-slate-200/80 dark:!border-slate-700/80">
                    <CardContent className="!p-8 text-center">
                        <CheckCircleRounded className="!text-6xl text-green-500 mb-4" />
                        <Typography variant="h4" className="!font-extrabold !text-slate-900 dark:!text-white">
                            {t('quiz.finished')}
                        </Typography>
                        <Typography variant="h2" className="!font-extrabold !text-sky-600 !mt-4">
                            {score?.toFixed(0)}%
                        </Typography>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400 !mt-2">
                            {t('quiz.scoreSaved')}
                        </Typography>
                        <Button
                            variant="contained"
                            className="!mt-8 !rounded-full !bg-sky-600 !normal-case !px-8"
                            onClick={() => navigate(-1)}
                        >
                            {t('quiz.backToLesson')}
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        )
    }

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100
    const isLast = currentIndex === questions.length - 1
    const allAnswered = questions.every(q => selected[q.id])

    return (
        <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>

            {/* BACK */}
            <Button
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate(-1)}
                className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 !rounded-full !px-4 !py-2"
            >
                {t('quiz.backToLesson')}
            </Button>

            {/* QUIZ HEADER */}
            <Box className="mb-6">
                <Typography variant="h4" className="!font-extrabold !text-slate-900 dark:!text-white">
                    {quiz?.titulli}
                </Typography>
                <Typography variant="body2" className="!text-slate-500 !mt-1">
                    ⏱ {quiz?.kohezgjatjaMinuta} {t('quiz.minutes')}
                </Typography>
            </Box>

            {/* PROGRESS */}
            <Box className="mb-6">
                <div className="flex justify-between mb-2">
                    <Typography variant="caption" className="!text-slate-500">
                        {t('quiz.question')} {currentIndex + 1} {t('quiz.from')} {questions.length}
                    </Typography>
                    <Typography variant="caption" className="!text-slate-500">
                        {progress.toFixed(0)}%
                    </Typography>
                </div>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: 'rgba(15,23,42,0.08)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 9999,
                            backgroundColor: '#0284c7'
                        }
                    }}
                />
            </Box>

            {/* QUESTION CARD */}
            {currentQuestion && (
                <Card elevation={0} className="rounded-3xl border border-slate-200/80 dark:!border-slate-700/80 mb-6">
                    <CardContent className="!p-6 sm:!p-8">
                        <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-6">
                            {currentQuestion.pyetja}
                        </Typography>

                        <div className="flex flex-col gap-3">
                            {answers[currentQuestion.id]?.map((answer, index) => {
                                const isSelected = selected[currentQuestion.id] === answer.id
                                const letters = ['A', 'B', 'C', 'D']
                                return (
                                    <Box
                                        key={answer.id}
                                        onClick={() => handleSelect(currentQuestion.id, answer.id)}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                            ${isSelected
                                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 dark:border-sky-400'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-slate-800/50'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-sm
                                            ${isSelected
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                            }
                                        `}>
                                            {letters[index]}
                                        </div>
                                        <Typography variant="body1" className={`${isSelected ? '!font-semibold !text-sky-700 dark:!text-sky-300' : '!text-slate-700 dark:!text-slate-300'}`}>
                                            {answer.pergjigja}
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* NAVIGATION */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outlined"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="!normal-case !rounded-full !border-slate-300 !text-slate-600 !px-6"
                >
                    {t('quiz.backBtn')}
                </Button>

                {isLast ? (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        className="!normal-case !rounded-full !bg-sky-600 !px-8"
                    >
                        {submitting ? t('quiz.submittingBtn') : t('quiz.submitBtn')}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!selected[currentQuestion?.id]}
                        className="!normal-case !rounded-full !bg-sky-600 !px-6"
                    >
                        {t('quiz.nextBtn')}
                    </Button>
                )}
            </div>
        </Container>
    )
}