package com.meson.service;

import com.meson.entity.CourseCategory;
import com.meson.repository.CourseCategoryRepository;
import com.meson.dto.CourseCategoryRequest;
import com.meson.dto.CourseCategoryResponse;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseCategoryService{

    private final CourseCategoryRepository courseCategoryRepository;

    public List<CourseCategoryResponse> getAll(){
        return courseCategoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public CourseCategoryResponse getById(Long id){
        CourseCategory courseCategory = courseCategoryRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Kategoria nuk u gjet"));
        return toResponse(courseCategory);
    }

    public CourseCategoryResponse create(CourseCategoryRequest request){
        CourseCategory courseCategory = new CourseCategory();
        courseCategory.setEmertimi(request.getEmertimi());
        courseCategory.setPershkrimi(request.getPershkrimi());
        return toResponse(courseCategoryRepository.save(courseCategory));
    }

    public CourseCategoryResponse update(Long id,CourseCategoryRequest request){
        CourseCategory courseCategory = courseCategoryRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Kategoria nuk u gjet"));
        courseCategory.setEmertimi(request.getEmertimi());
        courseCategory.setPershkrimi(request.getPershkrimi());
        return toResponse(courseCategoryRepository.save(courseCategory));
    }

    public void delete(Long id){
        CourseCategory courseCategory = courseCategoryRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Kategoria nuk u gjet"));
        if (!courseCategory.getCourses().isEmpty()) {
            throw new RuntimeException("Nuk mund të fshish kategorinë — ka kurse në këtë kategori");
        }
        courseCategoryRepository.deleteById(id);
    }

    private CourseCategoryResponse toResponse(CourseCategory courseCategory){
        CourseCategoryResponse response = new CourseCategoryResponse();
        response.setId(courseCategory.getId());
        response.setEmertimi(courseCategory.getEmertimi());
        response.setPershkrimi(courseCategory.getPershkrimi());
        return response;
    }
}
