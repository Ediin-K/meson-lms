package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherQuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuizAttemptRepository attemptRepository;
    private final LessonRepository lessonRepository;
    private final QuizService quizService;
    private final QuizQuestionHelper questionHelper;
    private final SubjectAccessService subjectAccessService;

    public List<QuizResponse> getQuizzesByLesson(Long lessonId) {
        assertManagesLesson(lessonId);
        return quizService.toQuizResponses(quizRepository.findByLessonId(lessonId));
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request) {
        Lesson lesson = assertManagesLesson(request.getLessonId());

        Quiz quiz = Quiz.builder()
                .titulli(request.getTitulli())
                .pershkrimi(request.getPershkrimi())
                .kohezgjatjaMinuta(request.getKohezgjatjaMinuta())
                .status(QuizStatus.DRAFT)
                .lesson(lesson)
                .build();

        Quiz saved = quizRepository.save(quiz);
        questionHelper.saveNestedQuestions(saved, request.getQuestions());
        return quizService.toQuizResponse(saved);
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = loadManagedQuiz(id);

        if (!QuizStatus.DRAFT.equals(quiz.getStatus())) {
            throw new BadRequestException("Vetem kuizet DRAFT mund te modifikohen. Mbylleni kuizin aktiv fillimisht.");
        }

        quiz.setTitulli(request.getTitulli());
        quiz.setPershkrimi(request.getPershkrimi());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());

        if (request.getQuestions() != null) {
            questionHelper.replaceQuestions(quiz, request.getQuestions());
        }

        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse activateQuiz(Long id) {
        Quiz quiz = loadManagedQuiz(id);

        if (QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Kuizi eshte tashme aktiv.");
        }
        if (QuizStatus.CLOSED.equals(quiz.getStatus())) {
            throw new BadRequestException("Kuizi eshte i mbyllur dhe nuk mund te rihapet.");
        }

        long questionCount = questionRepository.countByQuizId(quiz.getId());
        if (questionCount == 0) {
            throw new BadRequestException("Kuizi nuk ka pyetje. Shto pyetje para aktivizimit.");
        }

        quiz.setStatus(QuizStatus.ACTIVE);
        quiz.setActivatedAt(LocalDateTime.now());
        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse closeQuiz(Long id) {
        Quiz quiz = loadManagedQuiz(id);

        if (!QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Mund te mbyllet vetem kuizi aktiv.");
        }

        quiz.setStatus(QuizStatus.CLOSED);
        quiz.setClosedAt(LocalDateTime.now());
        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse publishQuiz(Long id) {
        return activateQuiz(id);
    }

    public List<QuizAttemptResponse> getResults(Long quizId) {
        loadManagedQuiz(quizId);

        return attemptRepository.findByQuizIdOrderBySubmittedAtDesc(quizId).stream()
                .filter(attempt -> Boolean.TRUE.equals(attempt.getSubmitted()))
                .map(quizService::toAttemptResponse)
                .toList();
    }

    public List<QuizAttemptResponse> getAllAttempts(Long quizId) {
        loadManagedQuiz(quizId);

        return attemptRepository.findByQuizIdOrderByStartedAtDesc(quizId).stream()
                .map(quizService::toAttemptResponse)
                .toList();
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = loadManagedQuiz(id);

        if (QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Nuk mund te fshihet kuizi aktiv. Mbylleni fillimisht.");
        }

        quizRepository.delete(quiz);
    }

    public List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId) {
        loadManagedQuiz(quizId);

        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId);
        Map<Long, List<QuizAnswer>> answersByQuestion = batchAnswersByQuestion(questions);
        return questions.stream()
                .map(q -> toQuestionResponseWithOptions(q, answersByQuestion.getOrDefault(q.getId(), List.of())))
                .collect(Collectors.toList());
    }

    /** One query for every question's answer options, instead of one per question. */
    private Map<Long, List<QuizAnswer>> batchAnswersByQuestion(List<QuizQuestion> questions) {
        if (questions.isEmpty()) {
            return Map.of();
        }
        List<Long> questionIds = questions.stream().map(QuizQuestion::getId).toList();
        return answerRepository.findByQuestionIdIn(questionIds).stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getId()));
    }

    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        Quiz quiz = loadManagedQuiz(request.getQuizId());

        if (!QuizStatus.DRAFT.equals(quiz.getStatus())) {
            throw new BadRequestException("Pyetjet mund te shtohen vetem ne kuizin DRAFT.");
        }

        QuizQuestion question = QuizQuestion.builder()
                .pyetja(request.getPyetja())
                .lloji(request.getLloji())
                .rradhitja(request.getRradhitja())
                .pikete(request.getPikete() != null ? request.getPikete() : 1)
                .quiz(quiz)
                .build();

        return toQuestionResponse(questionRepository.save(question));
    }

    @Transactional
    public QuizAnswerResponse addAnswer(Long questionId, QuizAnswerRequest request) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pyetja nuk u gjet."));
        loadManagedQuiz(question.getQuiz().getId());

        QuizAnswer answer = QuizAnswer.builder()
                .pergjigja(request.getPergjigja())
                .eshteSakte(request.getEshteSakte())
                .question(question)
                .build();

        return toAnswerResponse(answerRepository.save(answer));
    }

    private Lesson assertManagesLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Leksioni nuk u gjet."));
        subjectAccessService.assertManagesSubject(lesson.getModule().getSubject().getId());
        return lesson;
    }

    private Quiz loadManagedQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet."));
        subjectAccessService.assertManagesSubject(quiz.getLesson().getModule().getSubject().getId());
        return quiz;
    }

    private QuizQuestionResponse toQuestionResponseWithOptions(QuizQuestion question, List<QuizAnswer> answers) {
        return QuizQuestionResponse.builder()
                .id(question.getId())
                .pyetja(question.getPyetja())
                .lloji(question.getLloji())
                .rradhitja(question.getRradhitja())
                .pikete(question.getPikete())
                .quizId(question.getQuiz().getId())
                .options(answers.stream()
                        .map(this::toAnswerResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private QuizQuestionResponse toQuestionResponse(QuizQuestion question) {
        return QuizQuestionResponse.builder()
                .id(question.getId())
                .pyetja(question.getPyetja())
                .lloji(question.getLloji())
                .rradhitja(question.getRradhitja())
                .pikete(question.getPikete())
                .quizId(question.getQuiz().getId())
                .build();
    }

    private QuizAnswerResponse toAnswerResponse(QuizAnswer answer) {
        return QuizAnswerResponse.builder()
                .id(answer.getId())
                .pergjigja(answer.getPergjigja())
                .eshteSakte(answer.getEshteSakte())
                .questionId(answer.getQuestion().getId())
                .build();
    }
}
