package com.example.releaseportal.controller;

import com.example.releaseportal.dto.AddUserStoryRequest;
import com.example.releaseportal.dto.CreateReleaseRequest;
import com.example.releaseportal.dto.UpdateComponentRequest;
import com.example.releaseportal.dto.UpdateReleaseRequest;
import com.example.releaseportal.dto.UpdateTeamRequest;
import com.example.releaseportal.dto.UpdateUserStoryRequest;
import com.example.releaseportal.model.Component;
import com.example.releaseportal.model.Release;
import com.example.releaseportal.model.Team;
import com.example.releaseportal.model.UserStory;
import com.example.releaseportal.repository.ComponentRepository;
import com.example.releaseportal.repository.ReleaseRepository;
import com.example.releaseportal.repository.TeamRepository;
import com.example.releaseportal.repository.UserStoryRepository;
import com.example.releaseportal.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseRepository releaseRepository;
    private final TeamRepository teamRepository;
    private final ComponentRepository componentRepository;
    private final UserStoryRepository userStoryRepository;
    private final EmailService emailService;

    @GetMapping("/releases")
    public List<Release> getAllReleases() {
        return releaseRepository.findAll();
    }

    @GetMapping("/teams")
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @GetMapping("/releases/{id}")
    public Release getReleaseById(@PathVariable String id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found"));
    }

    @PutMapping("/releases/{releaseId}")
    public Release updateRelease(@PathVariable String releaseId, @RequestBody UpdateReleaseRequest request) {
        Release release = releaseRepository.findById(releaseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found"));
        release.setName(request.getName());
        release.setVersion(request.getVersion());
        release.setReleaseDate(request.getReleaseDate());
        return releaseRepository.save(release);
    }

    @DeleteMapping("/releases/{releaseId}")
    public ResponseEntity<?> deleteRelease(@PathVariable String releaseId) {
        if (!releaseRepository.existsById(releaseId)) {
            return ResponseEntity.notFound().build();
        }
        releaseRepository.deleteById(releaseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/releases")
    @Transactional
    public Release createRelease(@RequestBody CreateReleaseRequest createRequest) {
        Release newRelease = new Release();
        String id = createRequest.getName().toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis();
        newRelease.setId(id);
        newRelease.setName(createRequest.getName());
        newRelease.setVersion(createRequest.getVersion());
        newRelease.setReleaseDate(createRequest.getReleaseDate());
        newRelease.setStatus("In Progress");
        newRelease.setOverallAppOwnerSignedOff("Pending");
        newRelease.setTeams(Collections.emptyList());

        Release savedRelease = releaseRepository.save(newRelease);

        if (createRequest.getTeamIds() != null && !createRequest.getTeamIds().isEmpty()) {
            List<Team> teamsToAssociate = teamRepository.findAllById(createRequest.getTeamIds());
            for (Team team : teamsToAssociate) {
                team.setRelease(savedRelease);
            }
            teamRepository.saveAll(teamsToAssociate);
        }
        
        return releaseRepository.findById(savedRelease.getId()).get();
    }

    @PostMapping("/releases/{releaseId}/teams")
    public Team addTeam(@PathVariable String releaseId, @RequestBody Team teamData) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found"));
        
        String id = teamData.getName().toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis();
        teamData.setId(id);
        teamData.setQaSignedOff("Pending");
        teamData.setAppOwnerSignedOff("Pending");
        teamData.setRelease(release);
        return teamRepository.save(teamData);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}")
    public Team updateTeam(@PathVariable String teamId, @RequestBody UpdateTeamRequest request) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        team.setName(request.getName());
        team.setTeamDl(request.getTeamDl());
        team.setProductOwner(request.getProductOwner());
        return teamRepository.save(team);
    }

    @DeleteMapping("/releases/{releaseId}/teams/{teamId}")
    public ResponseEntity<?> deleteTeam(@PathVariable String teamId) {
        if (!teamRepository.existsById(teamId)) {
            return ResponseEntity.notFound().build();
        }
        teamRepository.deleteById(teamId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/releases/{releaseId}/teams/{teamId}/components")
    public Component addComponent(@PathVariable String teamId, @RequestBody Component componentData) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        
        String id = teamId + "-component-" + System.currentTimeMillis();
        componentData.setId(id);
        componentData.setSonarQube("Pending");
        componentData.setNexusIq("Pending");
        componentData.setCheckmarx("Pending");
        componentData.setTeam(team);
        return componentRepository.save(componentData);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/components/{componentId}")
    public Component updateComponent(@PathVariable String componentId, @RequestBody UpdateComponentRequest request) {
        Component component = componentRepository.findById(componentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Component not found"));
        component.setName(request.getName());
        component.setVersion(request.getVersion());
        return componentRepository.save(component);
    }

    @DeleteMapping("/releases/{releaseId}/teams/{teamId}/components/{componentId}")
    @Transactional
    public ResponseEntity<?> deleteComponent(@PathVariable String componentId) {
        if (!componentRepository.existsById(componentId)) {
            return ResponseEntity.notFound().build();
        }
        
        // Before deleting component, remove its association from any user stories
        List<UserStory> associatedStories = userStoryRepository.findByComponents_Id(componentId);
        for (UserStory story : associatedStories) {
            story.getComponents().removeIf(c -> c.getId().equals(componentId));
        }
        // Transaction will persist the changes to user stories
        
        componentRepository.deleteById(componentId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/releases/{releaseId}/teams/{teamId}/user-stories")
    public UserStory addUserStory(@PathVariable String teamId, @RequestBody AddUserStoryRequest userStoryRequest) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        UserStory newUserStory = new UserStory();
        String id = "US-" + System.currentTimeMillis();
        newUserStory.setId(id);
        newUserStory.setQaStatus("Pending");
        newUserStory.setTeam(team);
        newUserStory.setDescription(userStoryRequest.getDescription());

        if (userStoryRequest.getComponentIds() != null && !userStoryRequest.getComponentIds().isEmpty()) {
            List<Component> components = componentRepository.findAllById(userStoryRequest.getComponentIds());
            newUserStory.setComponents(components);
        } else {
            newUserStory.setComponents(new ArrayList<>());
        }

        return userStoryRepository.save(newUserStory);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/user-stories/{storyId}")
    public UserStory updateUserStory(@PathVariable String storyId, @RequestBody UpdateUserStoryRequest request) {
        UserStory story = userStoryRepository.findById(storyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Story not found"));
        story.setDescription(request.getDescription());
        return userStoryRepository.save(story);
    }

    @DeleteMapping("/releases/{releaseId}/teams/{teamId}/user-stories/{storyId}")
    public ResponseEntity<?> deleteUserStory(@PathVariable String storyId) {
        if (!userStoryRepository.existsById(storyId)) {
            return ResponseEntity.notFound().build();
        }
        userStoryRepository.deleteById(storyId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/user-stories/{storyId}/qa-status")
    public UserStory updateUserStoryQAStatus(@PathVariable String storyId, @RequestBody Map<String, String> payload) {
        UserStory userStory = userStoryRepository.findById(storyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User story not found"));

        userStory.setQaStatus(payload.get("qaStatus"));
        return userStoryRepository.save(userStory);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/components/{componentId}/scan")
    public Component updateComponentScan(@PathVariable String componentId, @RequestBody Map<String, String> payload) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Component not found"));

        String scanType = payload.get("scanType");
        String status = payload.get("status");
        if ("sonarQube".equals(scanType)) {
            component.setSonarQube(status);
        } else if ("nexusIq".equals(scanType)) {
            component.setNexusIq(status);
        } else if ("checkmarx".equals(scanType)) {
            component.setCheckmarx(status);
        }
        return componentRepository.save(component);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/qa-signoff")
    public Team updateQASignOff(@PathVariable String teamId, @RequestBody Map<String, String> payload) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        team.setQaSignedOff(payload.get("qaSignedOff"));
        return teamRepository.save(team);
    }

    @PutMapping("/releases/{releaseId}/teams/{teamId}/appowner-signoff")
    public Team updateAppOwnerSignOff(@PathVariable String teamId, @RequestBody Map<String, String> payload) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        team.setAppOwnerSignedOff(payload.get("appOwnerSignedOff"));
        return teamRepository.save(team);
    }

    @PutMapping("/releases/{releaseId}/overall-signoff")
    public Release updateOverallSignOff(@PathVariable String releaseId, @RequestBody Map<String, String> payload) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found"));
        release.setOverallAppOwnerSignedOff(payload.get("overallAppOwnerSignedOff"));
        return releaseRepository.save(release);
    }

    @PostMapping("/releases/{releaseId}/notify")
    public ResponseEntity<Void> sendApprovalNotification(@PathVariable String releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found"));
        
        emailService.sendApprovalNotification(release);
        
        return ResponseEntity.ok().build();
    }
}