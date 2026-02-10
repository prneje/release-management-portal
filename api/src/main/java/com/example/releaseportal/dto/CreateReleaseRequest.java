package com.example.releaseportal.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateReleaseRequest {
    private String name;
    private String version;
    private String releaseDate;
    private List<String> teamIds;
}
