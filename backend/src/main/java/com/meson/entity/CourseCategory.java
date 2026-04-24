package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name="course_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCategories{

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable= false,unique=true)
    private String emertimi;

    @Column(columnDefinition = "TEXT")
    private String pershkrimi;


}