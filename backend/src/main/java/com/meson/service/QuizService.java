package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuizAttemptRepository attemptRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    // QUIZ
    public List<QuizResponse> getAll() {
        return quizRepository.findAll().stream().map(this::toQuizResponse).toList();
    }

    public QuizResponse getById(Long id) {
        return toQuizResponse(quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kuizi nuk u gjet")));
    }

    public List<QuizResponse> getByLessonId(Long lessonId) {
        return quizRepository.findByLessonId(lessonId).stream().map(this::toQuizResponse).toList();
    }

    public QuizResponse createQuiz(QuizRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        Quiz quiz = new Quiz();
        quiz.setTitulli(request.getTitulli());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());
        quiz.setLesson(lesson);
        return toQuizResponse(quizRepository.save(quiz));
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kuizi nuk u gjet"));
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        quiz.setTitulli(request.getTitulli());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());
        quiz.setLesson(lesson);
        return toQuizResponse(quizRepository.save(quiz));
    }

    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id))
            throw new RuntimeException("Kuizi nuk u gjet");
        quizRepository.deleteById(id);
    }

    // QUESTION
    public List<QuizQuestionResponse> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId)
                .stream().map(this::toQuestionResponse).toList();
    }

    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Kuizi nuk u gjet"));
        QuizQuestion question = new QuizQuestion();
        question.setPyetja(request.getPyetja());
        question.setLloji(request.getLloji());
        question.setRradhitja(request.getRradhitja());
        question.setQuiz(quiz);
        return toQuestionResponse(questionRepository.save(question));
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id))
            throw new RuntimeException("Pyetja nuk u gjet");
        questionRepository.deleteById(id);
    }

    // ANSWER
    public List<QuizAnswerResponse> getAnswersByQuestionId(Long questionId) {
        return answerRepository.findByQuestionId(questionId)
                .stream().map(this::toAnswerResponse).toList();
    }

    public QuizAnswerResponse createAnswer(QuizAnswerRequest request) {
        QuizQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Pyetja nuk u gjet"));
        QuizAnswer answer = new QuizAnswer();
        answer.setPergjigja(request.getPergjigja());
        answer.setEshteSakte(request.getEshteSakte());
        answer.setQuestion(question);
        return toAnswerResponse(answerRepository.save(answer));
    }

    public void deleteAnswer(Long id) {
        if (!answerRepository.existsById(id))
            throw new RuntimeException("Pergjigja nuk u gjet");
        answerRepository.deleteById(id);
    }

    // ATTEMPT
    public List<QuizAttemptResponse> getAttemptsByQuizId(Long quizId) {
        return attemptRepository.findByQuizId(quizId)
                .stream().map(this::toAttemptResponse).toList();
    }

    public List<QuizAttemptResponse> getAttemptsByUserId(Long userId) {
        return attemptRepository.findByUserId(userId)
                .stream().map(this::toAttemptResponse).toList();
    }

    public QuizAttemptResponse createAttempt(QuizAttemptRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Kuizi nuk u gjet"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setPikete(request.getPikete());
        attempt.setKohaSekondat(request.getKohaSekondat());
        return toAttemptResponse(attemptRepository.save(attempt));
    }

    // toResponse
    private QuizResponse toQuizResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .titulli(quiz.getTitulli())
                .kohezgjatjaMinuta(quiz.getKohezgjatjaMinuta())
                .lessonId(quiz.getLesson().getId())
                .lessonTitulli(quiz.getLesson().getTitulli())
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizQuestionResponse toQuestionResponse(QuizQuestion q) {
        return QuizQuestionResponse.builder()
                .id(q.getId())
                .pyetja(q.getPyetja())
                .lloji(q.getLloji())
                .rradhitja(q.getRradhitja())
                .quizId(q.getQuiz().getId())
                .build();
    }

    private QuizAnswerResponse toAnswerResponse(QuizAnswer a) {
        return QuizAnswerResponse.builder()
                .id(a.getId())
                .pergjigja(a.getPergjigja())
                .eshteSakte(a.getEshteSakte())
                .questionId(a.getQuestion().getId())
                .build();
    }

    private QuizAttemptResponse toAttemptResponse(QuizAttempt at) {
        return QuizAttemptResponse.builder()
                .id(at.getId())
                .quizId(at.getQuiz().getId())
                .quizTitulli(at.getQuiz().getTitulli())
                .userId(at.getUser().getId())
                .userEmri(at.getUser().getEmri())
                .pikete(at.getPikete())
                .kohaSekondat(at.getKohaSekondat())
                .data(at.getData())
                .build();
    }

    public List<QuizAnswerStudentResponse> getAnswersByQuestionIdForStudent(Long questionId) {
        return answerRepository.findByQuestionId(questionId)
                .stream()
                .map(a -> QuizAnswerStudentResponse.builder()
                        .id(a.getId())
                        .pergjigja(a.getPergjigja())
                        .questionId(a.getQuestion().getId())
                        .build())
                .toList();
    }
}