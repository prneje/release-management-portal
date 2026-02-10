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
public class UserStory {
    @Id
    private String id;
    
    @Column(length = 1024)
    private String description;
    
    private String qaStatus; // 'Pending', 'In Progress', 'Passed', 'Failed'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
      name = "user_story_component", 
      joinColumns = @JoinColumn(name = "user_story_id"), 
      inverseJoinColumns = @JoinColumn(name = "component_id"))
    private List<Component> components = new ArrayList<>();
}