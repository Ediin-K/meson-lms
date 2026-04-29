package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // QUIZ
    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAll() {
        return ResponseEntity.ok(quizService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getById(id));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<QuizResponse>> getByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getByLessonId(lessonId));
    }

    @PostMapping
    public ResponseEntity<QuizResponse> create(@Valid @RequestBody QuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuiz(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // QUESTION
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuestionsByQuizId(quizId));
    }

    @PostMapping("/questions")
    public ResponseEntity<QuizQuestionResponse> createQuestion(@Valid @RequestBody QuizQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuestion(request));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ANSWER
    @GetMapping("/questions/{questionId}/answers")
    public ResponseEntity<List<QuizAnswerResponse>> getAnswers(@PathVariable Long questionId) {
        return ResponseEntity.ok(quizService.getAnswersByQuestionId(questionId));
    }

    @PostMapping("/answers")
    public ResponseEntity<QuizAnswerResponse> createAnswer(@Valid @RequestBody QuizAnswerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createAnswer(request));
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id) {
        quizService.deleteAnswer(id);
        return ResponseEntity.noContent().build();
    }

    // ATTEMPT
    @GetMapping("/{quizId}/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizId(quizId));
    }

    @GetMapping("/attempts/user/{userId}")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getAttemptsByUserId(userId));
    }

    @PostMapping("/attempts")
    public ResponseEntity<QuizAttemptResponse> createAttempt(@Valid @RequestBody QuizAttemptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createAttempt(request));
    }
}