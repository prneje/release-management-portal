export type ScanStatus = 'Pending' | 'Passed' | 'Failed';
export type SignOffStatus = 'Pending' | 'Completed';
export type QAStatus = 'Pending' | 'In Progress' | 'Passed' | 'Failed';

export interface UserStory {
  id: string;
  description: string;
  qaStatus: QAStatus;
  components: Component[];
}

export interface Component {
  id:string;
  name: string;
  version: string;
  sonarQube: ScanStatus;
  nexusIq: ScanStatus;
  checkmarx: ScanStatus;
}

export interface Team {
  id: string;
  name: string;
  teamDl: string;
  productOwner: string;
  qaSignedOff: SignOffStatus;
  appOwnerSignedOff: SignOffStatus;
  components: Component[];
  userStories: UserStory[];
}

export interface Release {
  id: string;
  name: string;
  version: string;
  releaseDate: string;
  status: 'In Progress' | 'Completed' | 'Blocked';
  overallAppOwnerSignedOff: SignOffStatus;
  teams: Team[];
}
