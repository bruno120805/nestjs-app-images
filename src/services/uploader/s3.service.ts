import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucketName: string;
  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  async upload(image: Express.Multer.File, key: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key + '.jpg',
        Body: image.buffer,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload image to S3');
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key + '.jpg',
    });

    return await getSignedUrl(this.client, command, { expiresIn: 7200 });
  }

  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key + '.jpg',
    });

    await this.client.send(command);
  }

  async getFileStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key + '.jpg',
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('El archivo no se encontró o no tiene contenido');
    }

    return response.Body as Readable;
  }
}
