package com.example.releaseportal.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "release")
public class Release {
    @Id
    private String id;
    private String name;
    private String version;
    private String releaseDate;
    private String status; // 'In Progress', 'Completed', 'Blocked'
    private String overallAppOwnerSignedOff; // 'Pending', 'Completed'

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Team> teams = new ArrayList<>();
}