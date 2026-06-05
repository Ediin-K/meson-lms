package com.meson.repository;

import com.meson.entity.Direction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DirectionRepository extends JpaRepository<Direction, Long> {
    Optional<Direction> findByEmertimi(String emertimi);
    boolean existsByEmertimi(String emertimi);
}
