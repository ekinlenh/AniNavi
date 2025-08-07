package com.aninavi.AniNavi.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aninavi.AniNavi.dto.ProfileDto;
import com.aninavi.AniNavi.model.User;
import com.aninavi.AniNavi.repository.UserRepository;

@Service
public class UploadProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UploadProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void uploadInfo(Long userId, ProfileDto data) {

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (isNotEmpty(data.getUsername())) {
                user.setUsername(data.getUsername());
            }

            if (isNotEmpty(data.getEmail())) {
                user.setEmail(data.getEmail());
            }

            if (isNotEmpty(data.getPassword())) {
                user.setPassword(passwordEncoder.encode(data.getPassword()));
            }

            if (isNotEmpty(data.getDescription())) {
                user.setProfileDescription(data.getDescription());
            }

            if (isNotEmpty(data.getProfileImage())) {
                user.setProfileImage(data.getProfileImage());
            }

            userRepository.save(user);
        } else {
            System.out.println("User not found.");
        }
    }

    private boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
