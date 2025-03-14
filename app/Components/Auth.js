import { Authenticator } from '@aws-amplify/ui-react';

export default function Auth() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}
