package com.example.releaseportal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Team {
    @Id
    private String id;
    private String name;
    private String teamDl;
    private String productOwner;
    private String qaSignedOff; // 'Pending', 'Completed'
    private String appOwnerSignedOff; // 'Pending', 'Completed'

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Component> components = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UserStory> userStories = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id")
    @JsonIgnore
    private Release release;
}