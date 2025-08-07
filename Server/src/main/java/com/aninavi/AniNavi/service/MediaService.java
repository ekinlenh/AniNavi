package com.aninavi.AniNavi.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.aninavi.AniNavi.dto.MediaDto;
import com.aninavi.AniNavi.model.Media;
import com.aninavi.AniNavi.model.User;
import com.aninavi.AniNavi.repository.MediaRepository;
import com.aninavi.AniNavi.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class MediaService {

    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;

    public MediaService(UserRepository userRepository, MediaRepository mediaRepository) {
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
    }

    public Set<Media> getUserMedia(User user) {
        return user.getMediaList();
    }

    @Transactional
    public Media saveMediaForUser(Long userId, MediaDto mediaDto) {

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            Optional<Media> optionalMedia = mediaRepository.findByMediaId(mediaDto.getMediaId());

            Media media;
            if (optionalMedia.isPresent()) {
                media = optionalMedia.get();

                if (user.getMediaList().contains(media)) {
                    System.out.println(user.getUsername() + " already has this media in their list.");
                    throw new IllegalStateException("Media already saved by user.");
                }

            } else {
                media = new Media();
                media.setMediaId(mediaDto.getMediaId());
                media.setMediaTitle(mediaDto.getMediaTitle());
                media.setMediaImage(mediaDto.getMediaImage());
            }

            user.addSavedMedia(media);
            mediaRepository.save(media);

            return media;
        }

        return null;

    }

    @Transactional
    public Media removeMediaForUser(Long userId, Long mediaId) {

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            Optional<Media> optionalMedia = mediaRepository.findByMediaId(mediaId);
            if (optionalMedia.isPresent()) {
                Media media = optionalMedia.get();

                if (user.getMediaList().contains(media)) {
                    user.removeSavedMedia(media);
                } else {
                    System.out.println("User does not have the media: " + media.getMediaTitle() +
                            "Cannot remove this media.");
                }

                userRepository.save(user);
                return media;
            }
        }

        return null;
    }

}
