import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const ENDPOINT: string = process.env.CLOUDFLARE_S3_ENDPOINT || "";
const ACCESS_KEY_ID: string = process.env.CLOUDFLARE_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY: string =
  process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "";
const BUCKET_NAME: string = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const putObject = async (
  key: string,
  body: Buffer,
  contentType: string
): Promise<boolean> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return true;
};

export const deleteObject = async (key: string): Promise<boolean> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
  return true;
};
