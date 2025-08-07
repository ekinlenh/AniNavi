package com.aninavi.AniNavi.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medias")
@Getter
@Setter
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long mediaId;

    @Column(nullable = false)
    private String mediaTitle;

    @Column
    private String mediaImage;

    @ManyToMany(mappedBy = "mediaList")
    @JsonIgnore
    private Set<User> users = new HashSet<User>();

    @Override
    public String toString() {
        return "Media Title: " + mediaTitle + "\n"
                + "Media Id: " + mediaId + "\n"
                + "Media Image: " + mediaImage + "\n";
    }
}
