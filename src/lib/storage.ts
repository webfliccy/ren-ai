import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getClient() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing required AWS environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET"
    );
  }

  return { client: new S3Client({ region, credentials: { accessKeyId, secretAccessKey } }), bucket };
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const { client, bucket } = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  const region = process.env.AWS_REGION!;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
