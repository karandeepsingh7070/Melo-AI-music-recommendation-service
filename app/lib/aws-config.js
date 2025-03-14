import AWS from "aws-sdk";

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const rekognition = new AWS.Rekognition();

export default rekognition;