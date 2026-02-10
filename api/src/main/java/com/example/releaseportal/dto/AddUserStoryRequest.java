package com.example.releaseportal.dto;

import lombok.Data;
import java.util.List;

@Data
public class AddUserStoryRequest {
    private String description;
    private List<String> componentIds;
}
