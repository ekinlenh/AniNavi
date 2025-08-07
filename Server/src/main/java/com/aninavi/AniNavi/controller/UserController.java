package com.aninavi.AniNavi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.aninavi.AniNavi.dto.MediaDto;
import com.aninavi.AniNavi.dto.ProfileDto;
import com.aninavi.AniNavi.model.Media;
import com.aninavi.AniNavi.model.User;
import com.aninavi.AniNavi.responses.UserUploadResponse;
import com.aninavi.AniNavi.service.JwtService;
import com.aninavi.AniNavi.service.MediaService;
import com.aninavi.AniNavi.service.UploadProfileService;
import com.aninavi.AniNavi.service.UserService;

@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.OPTIONS })
@RequestMapping("api/users")
@RestController
public class UserController {

    private final JwtService jwtService;
    private final UserService userService;
    private final UploadProfileService uploadProfileService;
    private final MediaService mediaService;

    public UserController(JwtService jwtService, UserService userService, UploadProfileService uploadProfileService,
            MediaService mediaService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.uploadProfileService = uploadProfileService;
        this.mediaService = mediaService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Long userId = currentUser.getId();
        Map<String, Object> response = userService.grabUserInformation(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<List<User>> allUsers() {
        List<User> users = userService.allUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/validated")
    public ResponseEntity<Boolean> isUserValidated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isUserValidated = authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser");

        return ResponseEntity.ok(isUserValidated);
    }

    // PROFILE INFORMATION
    @PostMapping("/me/uploadInfo")
    public ResponseEntity<UserUploadResponse> uploadInfo(@RequestBody ProfileDto data) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // update user info
        Long userId = currentUser.getId();
        uploadProfileService.uploadInfo(userId, data);

        // generate new JWT token
        String newToken = jwtService.generateToken(currentUser);

        UserUploadResponse response = new UserUploadResponse(currentUser, newToken, jwtService.getExpirationTime());
        return ResponseEntity.ok(response);
    }

    // USER'S ANIME DATA
    @PostMapping("/me/uploadMedia")
    public ResponseEntity<Media> uploadMedia(@RequestBody MediaDto mediaDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Long userId = currentUser.getId();
        Media media = mediaService.saveMediaForUser(userId, mediaDto);

        return ResponseEntity.ok(media);
    }

    @PostMapping("/me/removeMedia")
    public ResponseEntity<Media> removeMedia(@RequestBody Long mediaId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        System.out.println(currentUser.getUsername());

        Long userId = currentUser.getId();
        Media media = mediaService.removeMediaForUser(userId, mediaId);

        return ResponseEntity.ok(media);
    }
}
