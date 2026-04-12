package com.meson.config;

import com.meson.repository.UserRepository;
import com.meson.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Merr Authorization header
        String authHeader = request.getHeader("Authorization");
        System.out.println("AUTH HEADER: " + authHeader);

        // 2. Kontrollo nëse ka token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("NO TOKEN - vazhdoj pa autentifikim");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Nxjerr token (hiq "Bearer ")
        String token = authHeader.substring(7);

        // 4. Nxjerr emailin nga token
        String email = jwtService.extractEmail(token);
        System.out.println("EMAIL: " + email);

        // 5. Kontrollo nëse useri ekziston dhe nuk është autentifikuar
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 6. Gjej userin nga DB
            boolean userExists = userRepository.existsByEmailIgnoreCase(email);
            System.out.println("USER EXISTS: " + userExists);

            if (userExists && jwtService.isTokenValid(token, email)) {

                // 7. Krijo UserDetails
                UserDetails userDetails = User.builder()
                        .username(email)
                        .password("")
                        .authorities(new ArrayList<>())
                        .build();

                // 8. Krijo Authentication token
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 9. Vendos Authentication në SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("AUTENTIFIKUAR: " + email);
            }
        }

        // 10. Vazhdo me kërkesën
        filterChain.doFilter(request, response);
    }
}