package com.example.releaseportal.dto;

import lombok.Data;

@Data
public class UpdateReleaseRequest {
    private String name;
    private String version;
    private String releaseDate;
}