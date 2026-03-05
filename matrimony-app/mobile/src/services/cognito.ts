import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { AWS_CONFIG } from '../config/aws';

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.cognito.userPoolId,
  ClientId: AWS_CONFIG.cognito.userPoolClientId,
});

export const cognitoService = {
  // Sign up with phone number
  signUp: (phoneNumber: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'phone_number',
          Value: phoneNumber,
        }),
      ];

      userPool.signUp(
        phoneNumber,
        Math.random().toString(36), // Temporary password
        attributeList,
        [],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  },

  // Verify OTP
  confirmSignUp: (phoneNumber: string, code: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: phoneNumber,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  // Sign in with phone and custom auth
  signIn: (phoneNumber: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: phoneNumber,
        Pool: userPool,
      });

      cognitoUser.initiateAuth(
        {
          AuthFlow: 'CUSTOM_AUTH',
          AuthParameters: {
            USERNAME: phoneNumber,
          },
        },
        {
          onSuccess: resolve,
          onFailure: reject,
          customChallenge: resolve,
        }
      );
    });
  },

  // Get current session
  getCurrentSession: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err) reject(err);
        else resolve(session);
      });
    });
  },

  // Sign out
  signOut: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  },
};
