package com.aninavi.AniNavi.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.aninavi.AniNavi.model.Media;
import com.aninavi.AniNavi.model.User;

@Repository
public interface MediaRepository extends CrudRepository<Media, Long> {

    Optional<Media> findByMediaId(Long mediaId);

    Set<User> findAllUsersByMediaId(Long mediaId);

    User findUserByMediaId(Long mediaId);

}
