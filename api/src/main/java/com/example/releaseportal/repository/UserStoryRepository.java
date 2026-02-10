package com.example.releaseportal.repository;

import com.example.releaseportal.model.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, String> {
    List<UserStory> findByComponents_Id(String componentId);
}