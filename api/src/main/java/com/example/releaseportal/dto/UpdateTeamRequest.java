package com.example.releaseportal.dto;

import lombok.Data;

@Data
public class UpdateTeamRequest {
    private String name;
    private String teamDl;
    private String productOwner;
}