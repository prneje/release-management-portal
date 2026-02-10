import { Release } from '../models/release.model';

// FIX: Corrected typo in constant name from MOCK_RELELEASES to MOCK_RELEASES.
export const MOCK_RELEASES: Release[] = [
  {
    id: 'mock-q1-2024-aurora',
    name: 'Project Aurora (Loading...)',
    version: '2.1.0',
    releaseDate: '2024-03-30',
    status: 'In Progress',
    overallAppOwnerSignedOff: 'Pending',
    teams: [
      {
        id: 'mock-alpha-squad',
        name: 'Alpha Squad',
        teamDl: 'alpha-squad@example.com',
        productOwner: 'Alice Smith',
        qaSignedOff: 'Pending',
        appOwnerSignedOff: 'Pending',
        components: [
          {
            id: 'mock-auth-service',
            name: 'Authentication Service',
            version: '1.2.3',
            sonarQube: 'Passed',
            nexusIq: 'Passed',
            checkmarx: 'Passed',
          },
          {
            id: 'mock-ui-gateway',
            name: 'UI Gateway',
            version: '2.0.1',
            sonarQube: 'Pending',
            nexusIq: 'Passed',
            checkmarx: 'Pending',
          },
        ],
        userStories: [
          {
            id: 'mock-US-101',
            description: 'As a user, I should be able to log in with my username and password.',
            qaStatus: 'Passed',
            components: [{
              id: 'mock-auth-service', name: 'Authentication Service', version: '1.2.3',
              sonarQube: 'Passed', nexusIq: 'Passed', checkmarx: 'Passed'
            }],
          },
          {
            id: 'mock-US-102',
            description: 'As a user, I should see an error for invalid credentials.',
            qaStatus: 'In Progress',
            components: [{
              id: 'mock-auth-service', name: 'Authentication Service', version: '1.2.3',
              sonarQube: 'Passed', nexusIq: 'Passed', checkmarx: 'Passed'
            }, {
              id: 'mock-ui-gateway', name: 'UI Gateway', version: '2.0.1',
              sonarQube: 'Pending', nexusIq: 'Passed', checkmarx: 'Pending'
            }],
          }
        ]
      },
      {
        id: 'mock-bravo-team',
        name: 'Bravo Team',
        teamDl: 'bravo-team@example.com',
        productOwner: 'Bob Johnson',
        qaSignedOff: 'Completed',
        appOwnerSignedOff: 'Completed',
        components: [],
        userStories: []
      },
    ],
  },
  {
    id: 'mock-q4-2023-nebula',
    name: 'Project Nebula (Loading...)',
    version: '1.9.5',
    releaseDate: '2023-12-15',
    status: 'Completed',
    overallAppOwnerSignedOff: 'Completed',
    teams: [
      {
        id: 'mock-delta-force',
        name: 'Delta Force',
        teamDl: 'delta-force@example.com',
        productOwner: 'Charlie Brown',
        qaSignedOff: 'Completed',
        appOwnerSignedOff: 'Completed',
        components: [
          {
            id: 'mock-reporting-api',
            name: 'Reporting API',
            version: '2.2.0',
            sonarQube: 'Passed',
            nexusIq: 'Passed',
            checkmarx: 'Passed',
          },
        ],
        userStories: [
           {
            id: 'mock-US-301',
            description: 'Generate end-of-day sales reports.',
            qaStatus: 'Passed',
            components: [{
              id: 'mock-reporting-api', name: 'Reporting API', version: '2.2.0',
              sonarQube: 'Passed', nexusIq: 'Passed', checkmarx: 'Passed'
            }]
          }
        ]
      },
    ],
  },
];
