export interface User {
  id: string;
  email: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: {
    profile: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

