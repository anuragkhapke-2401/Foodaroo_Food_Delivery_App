import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client
let s3Client;

export const isS3Configured = () => {
  return process.env.USE_S3 === 'true' || process.env.AWS_BUCKET_NAME !== undefined;
};

export const initS3 = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  s3Client = new S3Client({ region });
};

export const getBucketName = () => {
  return process.env.AWS_BUCKET_NAME || "foodaroo-images";
};

export const uploadImageToS3 = async (filename, buffer, mimetype) => {
  if (!s3Client) initS3();
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
  });
  await s3Client.send(command);
};

export const deleteImageFromS3 = async (filename) => {
  if (!s3Client) initS3();
  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: filename,
  });
  await s3Client.send(command);
};

export const generatePresignedUrl = async (filename) => {
  if (!s3Client) initS3();
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: filename,
  });
  // URL expires in 1 hour
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
