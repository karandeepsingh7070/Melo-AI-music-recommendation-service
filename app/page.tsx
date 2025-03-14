'use client'
import MoodUploader from "./Components/MoodUploader";
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from '../src/amplifyconfiguration.json';
Amplify.configure(config);

function Home() {
  return (<>
    <MoodUploader />
  </>);
}

export default withAuthenticator(Home)
