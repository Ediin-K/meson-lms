package com.meson.service;

import com.meson.dto.RoleRequest;
import com.meson.dto.RoleResponse;
import com.meson.entity.Role;
import com.meson.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoleService{
    private final RoleRepository roleRepository;

    // Every hasRole(...) check in the app is keyed off these three normalized names.
    // Renaming or deleting one would silently break authorization for that entire
    // user class, so they're protected here regardless of who has that role today.
    private static final Set<String> PROTECTED_NORMALIZED_NAMES = Set.of("ADMIN", "TEACHER", "STUDENT", "DEPARTMENT_HEAD");

    public List<RoleResponse> getAll(){
        return roleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public RoleResponse getById(Long id){
        Role role = roleRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Roli nuk u gjet"));
        return toResponse(role);

    }

    public RoleResponse create(RoleRequest request) {
        Role role = new Role();
        role.setEmertimi(request.getEmertimi());
        role.setNormalizedName(request.getNormalizedName().toUpperCase());
        role.setPershkrimi(request.getPershkrimi());
        return toResponse(roleRepository.save(role));
    }
    public RoleResponse update(Long id,RoleRequest request){
        Role role = roleRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Roli nuk u gjet"));
        String newNormalizedName = request.getNormalizedName().toUpperCase();
        if (PROTECTED_NORMALIZED_NAMES.contains(role.getNormalizedName())
                && !role.getNormalizedName().equals(newNormalizedName)) {
            throw new RuntimeException(
                    "Roli \"" + role.getNormalizedName() + "\" nuk mund të riemërtohet — përdoret nga sistemi");
        }
        role.setEmertimi(request.getEmertimi());
        role.setNormalizedName(newNormalizedName);
        role.setPershkrimi(request.getPershkrimi());
        return toResponse(roleRepository.save(role));
    }

    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Roli nuk u gjet"));
        if (PROTECTED_NORMALIZED_NAMES.contains(role.getNormalizedName())) {
            throw new RuntimeException(
                    "Roli \"" + role.getNormalizedName() + "\" nuk mund të fshihet — përdoret nga sistemi");
        }
        if (!role.getUserRoles().isEmpty()) {
            throw new RuntimeException("Nuk mund të fshish rolin — ka userë me këtë rol");
        }
        roleRepository.deleteById(id);
    }
    private RoleResponse toResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setEmertimi(role.getEmertimi());
        response.setNormalizedName(role.getNormalizedName());
        response.setPershkrimi(role.getPershkrimi());
        return response;
    }

}
