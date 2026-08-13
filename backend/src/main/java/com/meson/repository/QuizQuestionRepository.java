package com.meson.repository;

import com.meson.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByRradhitjaAsc(Long quizId);
    void deleteAllByQuizId(Long quizId);
    long countByQuizId(Long quizId);

    /** Question count + total points for many quizzes in one grouped query, instead of two per quiz. */
    @Query("SELECT q.quiz.id AS quizId, COUNT(q) AS questionCount, SUM(q.pikete) AS totalPoints "
            + "FROM QuizQuestion q WHERE q.quiz.id IN :quizIds GROUP BY q.quiz.id")
    List<QuizQuestionStats> countAndSumPointsByQuizIdIn(@Param("quizIds") List<Long> quizIds);

    interface QuizQuestionStats {
        Long getQuizId();
        long getQuestionCount();
        long getTotalPoints();
    }
}
