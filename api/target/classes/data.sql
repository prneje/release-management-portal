-- Insert Releases
-- Note: Hibernate converts camelCase to snake_case, so overallAppOwnerSignedOff becomes overall_app_owner_signed_off
INSERT INTO release (id, name, version, release_date, status, overall_app_owner_signed_off) VALUES
('q1-2024-aurora', 'Project Aurora', '2.1.0', '2024-03-30', 'In Progress', 'Pending'),
('q4-2023-nebula', 'Project Nebula', '1.9.5', '2023-12-15', 'Completed', 'Completed'),
('q2-2024-titan', 'Project Titan', '2.2.0', '2024-05-15', 'Blocked', 'Pending'),
('q3-2024-viking', 'Project Viking', '3.0.0', '2024-08-01', 'In Progress', 'Pending');


-- Insert Teams for 'Project Aurora'
INSERT INTO team (id, name, team_dl, product_owner, qa_signed_off, app_owner_signed_off, release_id) VALUES
('alpha-squad', 'Alpha Squad', 'alpha@example.com', 'John Doe', 'Pending', 'Pending', 'q1-2024-aurora'),
('bravo-team', 'Bravo Team', 'bravo@example.com', 'Jane Smith', 'Completed', 'Completed', 'q1-2024-aurora'),
('charlie-unit', 'Charlie Unit', 'charlie@example.com', 'Peter Jones', 'Completed', 'Pending', 'q1-2024-aurora');

-- Insert Components for 'Alpha Squad'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('auth-service', 'Authentication Service', '1.2.3', 'Passed', 'Passed', 'Passed', 'alpha-squad'),
('ui-gateway', 'UI Gateway', '2.0.1', 'Pending', 'Passed', 'Pending', 'alpha-squad');

-- Insert User Stories for 'Alpha Squad'
INSERT INTO user_story (id, description, qa_status, team_id) VALUES
('US-101', 'As a user, I should be able to log in with my username and password.', 'Passed', 'alpha-squad'),
('US-102', 'As a user, I should see an error for invalid credentials.', 'In Progress', 'alpha-squad'),
('US-103', 'As a gateway user, I need requests to be routed correctly.', 'Pending', 'alpha-squad');

-- Link User Stories to Components for 'Alpha Squad'
INSERT INTO user_story_component (user_story_id, component_id) VALUES
('US-101', 'auth-service'),
('US-102', 'auth-service'),
('US-103', 'ui-gateway'),
('US-103', 'auth-service'); -- US-103 now links to two components

-- Insert Components for 'Bravo Team'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('payment-processor', 'Payment Processor', '3.5.0', 'Failed', 'Passed', 'Passed', 'bravo-team'),
('notification-engine', 'Notification Engine', '1.8.2', 'Passed', 'Pending', 'Failed', 'bravo-team');

-- Insert User Stories for 'Bravo Team'
INSERT INTO user_story (id, description, qa_status, team_id) VALUES
('US-201', 'Process Visa and Mastercard payments successfully.', 'Failed', 'bravo-team'),
('US-202', 'Send email notifications for successful payments.', 'Passed', 'bravo-team');

-- Link User Stories to Components for 'Bravo Team'
INSERT INTO user_story_component (user_story_id, component_id) VALUES
('US-201', 'payment-processor'),
('US-202', 'notification-engine');

-- Insert Components for 'Charlie Unit'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('data-pipeline', 'Data Pipeline', '4.1.0', 'Passed', 'Passed', 'Pending', 'charlie-unit');

-- Insert User Stories for 'Charlie Unit'
INSERT INTO user_story (id, description, qa_status, team_id) VALUES
('US-203', 'Ensure data pipeline processes 1M records per minute.', 'Passed', 'charlie-unit');

-- Link User Stories to Components for 'Charlie Unit'
INSERT INTO user_story_component (user_story_id, component_id) VALUES
('US-203', 'data-pipeline');


-- Insert Teams for 'Project Nebula' (Completed Release)
INSERT INTO team (id, name, team_dl, product_owner, qa_signed_off, app_owner_signed_off, release_id) VALUES
('delta-force', 'Delta Force', 'delta@example.com', 'Susan Miller', 'Completed', 'Completed', 'q4-2023-nebula');

-- Insert Components for 'Delta Force'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('reporting-api', 'Reporting API', '2.2.0', 'Passed', 'Passed', 'Passed', 'delta-force'),
('analytics-dashboard', 'Analytics Dashboard', '3.1.1', 'Passed', 'Passed', 'Passed', 'delta-force');

-- Insert User Stories for 'Delta Force'
INSERT INTO user_story (id, description, qa_status, team_id) VALUES
('US-301', 'Generate end-of-day sales reports.', 'Passed', 'delta-force'),
('US-302', 'Display key metrics on the analytics dashboard.', 'Passed', 'delta-force');

-- Link User Stories to Components for 'Delta Force'
INSERT INTO user_story_component (user_story_id, component_id) VALUES
('US-301', 'reporting-api'),
('US-302', 'analytics-dashboard'),
('US-302', 'reporting-api');


-- Insert Teams for 'Project Titan' (Blocked Release)
INSERT INTO team (id, name, team_dl, product_owner, qa_signed_off, app_owner_signed_off, release_id) VALUES
('echo-squad', 'Echo Squad', 'echo@example.com', 'David Chen', 'Pending', 'Pending', 'q2-2024-titan'),
('foxtrot-group', 'Foxtrot Group', 'foxtrot@example.com', 'Karen White', 'Pending', 'Pending', 'q2-2024-titan');

-- Insert Components for 'Echo Squad'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('inventory-service', 'Inventory Service', '1.5.0', 'Passed', 'Failed', 'Pending', 'echo-squad'),
('order-api', 'Order API', '1.2.1', 'Passed', 'Passed', 'Passed', 'echo-squad');

-- Insert User Stories for 'Echo Squad'
INSERT INTO user_story (id, description, qa_status, team_id) VALUES
('US-401', 'Update inventory levels after a sale is made.', 'Passed', 'echo-squad');

-- Link User Stories to Components for 'Echo Squad'
INSERT INTO user_story_component (user_story_id, component_id) VALUES
('US-401', 'inventory-service'),
('US-401', 'order-api');

-- Insert Components for 'Foxtrot Group'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('user-profile-svc', 'User Profile Service', '2.3.0', 'Passed', 'Passed', 'Passed', 'foxtrot-group');

-- Insert Teams for 'Project Viking' (New 'In Progress' Release)
INSERT INTO team (id, name, team_dl, product_owner, qa_signed_off, app_owner_signed_off, release_id) VALUES
('golf-platoon', 'Golf Platoon', 'golf@example.com', 'Chris Green', 'Pending', 'Pending', 'q3-2024-viking'),
('hotel-company', 'Hotel Company', 'hotel@example.com', 'Patricia Blue', 'Pending', 'Pending', 'q3-2024-viking');

-- Insert Components for 'Golf Platoon'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('search-engine', 'Search Engine', '1.0.0', 'Pending', 'Pending', 'Pending', 'golf-platoon');

-- Insert Components for 'Hotel Company'
INSERT INTO component (id, name, version, sonar_qube, nexus_iq, checkmarx, team_id) VALUES
('recommendation-engine', 'Recommendation Engine', '2.1.0', 'Passed', 'Pending', 'Pending', 'hotel-company'),
('logging-framework', 'Logging Framework', '1.1.5', 'Passed', 'Passed', 'Passed', 'hotel-company');
