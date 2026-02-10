package com.example.releaseportal.service;

import com.example.releaseportal.model.Release;
import com.example.releaseportal.model.Team;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class EmailService {

    public void sendApprovalNotification(Release release) {
        log.info("--- Preparing Approval Email for Release: {} ---", release.getName());
        Set<String> recipients = new HashSet<>();

        // Add Release Manager email (hardcoded for demonstration)
        recipients.add("release.manager@example.com");

        if (release.getTeams() != null) {
            for (Team team : release.getTeams()) {
                if (team.getTeamDl() != null && !team.getTeamDl().isEmpty()) {
                    recipients.add(team.getTeamDl());
                }
                if (team.getProductOwner() != null && !team.getProductOwner().isEmpty()) {
                    // Assuming product owner name can be converted to an email for this example
                    String poEmail = team.getProductOwner().toLowerCase().replace(" ", ".") + "@example.com";
                    recipients.add(poEmail);
                }
            }
        }

        log.info("Recipients: {}", recipients);
        log.info("Subject: Release {} ({}) has been Approved", release.getName(), release.getVersion());
        log.info("Body: The release '{}' has received final approval from the Application Owner and is ready to proceed.", release.getName());
        log.info("--- Email Simulation End ---");
    }
}
