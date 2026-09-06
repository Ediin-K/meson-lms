package com.meson.service;

import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

/**
 * Turns a user's set of roles into the shapes auth needs: the list of normalized
 * names for the JWT, and the single "primary" role for redirect hints. A user may
 * hold several roles at once; the JWT carries all of them.
 */
@Component
public class RoleResolver {

    /** Highest privilege first. Anything not listed sorts last. */
    private static final List<String> PRIORITY = List.of("ADMIN", "DEPARTMENT_HEAD", "TEACHER", "STUDENT");

    public List<Role> rolesOf(User user) {
        return user.getUserRoles() == null ? List.of()
                : user.getUserRoles().stream().map(UserRole::getRole).toList();
    }

    /** Normalized names, uppercased — what the JWT carries and {@code hasRole(...)} checks. */
    public List<String> normalizedNames(Collection<Role> roles) {
        return roles.stream()
                .map(r -> r.getNormalizedName().toUpperCase())
                .distinct()
                .toList();
    }

    /** Display names (the {@code emertimi}), lowercased — what the frontend stores and switches on. */
    public List<String> displayNames(Collection<Role> roles) {
        return roles.stream()
                .map(r -> r.getEmertimi().toLowerCase())
                .distinct()
                .toList();
    }

    /** The highest-privilege role, or null when the user has none. */
    public Role primary(Collection<Role> roles) {
        return roles.stream()
                .min(Comparator.comparingInt(r -> {
                    int i = PRIORITY.indexOf(r.getNormalizedName().toUpperCase());
                    return i < 0 ? Integer.MAX_VALUE : i;
                }))
                .orElse(null);
    }
}
