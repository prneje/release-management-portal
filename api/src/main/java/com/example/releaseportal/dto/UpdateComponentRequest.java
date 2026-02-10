package com.example.releaseportal.dto;

import lombok.Data;

@Data
public class UpdateComponentRequest {
    private String name;
    private String version;
}