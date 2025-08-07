package com.aninavi.AniNavi.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.aninavi.AniNavi.model.User;
import com.aninavi.AniNavi.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
    }

    public List<User> allUsers() {
        List<User> users = new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        return users;
    }

    public Map<String, Object> grabUserInformation(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // set user information
            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("username", user.getUsername());
            result.put("email", user.getEmail());
            result.put("profileImage", user.getProfileImage());
            result.put("profileDescription", user.getProfileDescription());
            result.put("mediaList", user.getMediaList());

            return result;
        } else {
            throw new Error("Could not grab user information for ID: " + userId);
        }
    }
}
