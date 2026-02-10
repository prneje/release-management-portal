package com.example.releaseportal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Component {
    @Id
    private String id;
    private String name;
    private String version;
    private String sonarQube; // 'Pending', 'Passed', 'Failed'
    private String nexusIq; // 'Pending', 'Passed', 'Failed'
    private String checkmarx; // 'Pending', 'Passed', 'Failed'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;

    @ManyToMany(mappedBy = "components")
    @JsonIgnore
    private List<UserStory> userStories;
}
