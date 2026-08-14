package com.meson.repository;

import com.meson.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    List<QuizAnswer> findByQuestionId(Long questionId);
    List<QuizAnswer> findByQuestionIdIn(List<Long> questionIds);
    void deleteAllByQuestionId(Long questionId);
}
