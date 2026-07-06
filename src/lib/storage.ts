import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

interface S3Config {
  client: S3Client;
  bucket: string;
  region: string;
}

let config: S3Config | null = null;

function getConfig(): S3Config {
  if (!config) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.S3_BUCKET;

    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        "Missing required AWS environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET",
      );
    }

    config = {
      client: new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      }),
      bucket,
      region,
    };
  }
  return config;
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  if (!filename.trim()) throw new Error("File must have a name");

  const { client, bucket, region } = getConfig();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const suffix = crypto.randomUUID().slice(0, 8);
  const key = `uploads/${Date.now()}_${suffix}_${safeName}`;

  const disposition = contentType.startsWith("image/")
    ? undefined
    : `attachment; filename="${filename}"`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...(disposition ? { ContentDisposition: disposition } : {}),
      // No ACL — bucket must have a public-read bucket policy for anonymous GET access.
    }),
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
