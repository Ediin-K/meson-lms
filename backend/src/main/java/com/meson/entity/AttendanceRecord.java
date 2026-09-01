package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"scheduleSession", "student", "markedBy"})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_session_id", nullable = false)
    private ScheduleSession scheduleSession;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by_id", nullable = false)
    private User markedBy;

    @Column(name = "marked_at", nullable = false)
    private LocalDateTime markedAt;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
