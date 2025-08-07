package com.aninavi.AniNavi.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private boolean enabled;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_expiration")
    private LocalDateTime verificationCodeExpiration;

    private String profileImage;

    private String profileDescription;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnore
    @JoinTable(name = "user_media", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "media_id"))
    private Set<Media> mediaList;

    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.mediaList = new HashSet<Media>();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // user connection with media
    public void addSavedMedia(Media media) {
        System.out.println("Adding media " + media.getMediaId() + " to user " + this.getId());

        System.out.println("About to add to mediaList...");

        try {
            boolean added = this.mediaList.add(media);
            System.out.println("Media added successfully: " + added);
        } catch (Exception e) {
            System.err.println("Exception during mediaList.add(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void removeSavedMedia(Media media) {
        System.out.println("Removing media " + media.getMediaId() + " to user " + this.getId());

        System.out.println("About to remove from mediaList...");

        try {
            boolean removed = this.mediaList.remove(media);
            System.out.println("Media removed successfully: " + removed);
        } catch (Exception e) {
            System.err.println("Exception during mediaList.remove(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

}
