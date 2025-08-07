package com.aninavi.AniNavi.responses;

import com.aninavi.AniNavi.model.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUploadResponse {

    private User user;
    private String token;
    private long expiresIn;

    public UserUploadResponse(User user, String token, long expiresIn) {
        this.user = user;
        this.token = token;
        this.expiresIn = expiresIn;
    }

}
