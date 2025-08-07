package com.aninavi.AniNavi.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.aninavi.AniNavi.model.User;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationCode(String verificationCode);

    Optional<User> findByUsernameOrEmail(String username, String email);

    default boolean mediaExistsByUserId(Long userId, Long mediaId) {
        return findById(userId)
                .map(user -> user.getMediaList().stream()
                        .anyMatch(media -> media.getId().equals(mediaId)))
                .orElse(false);
    }

}
