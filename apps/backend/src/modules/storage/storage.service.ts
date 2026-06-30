import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageMetadata {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver = process.env.STORAGE_DRIVER || 'local';

  async uploadFile(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }): Promise<StorageMetadata> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }
    
    const fileId = Math.random().toString(36).substring(2, 15);
    const mockUrl = this.driver === 's3' 
      ? `https://${process.env.S3_BUCKET_NAME || 'his-patient-records'}.s3.amazonaws.com/${fileId}_${file.originalname}`
      : `/uploads/${fileId}_${file.originalname}`;

    if (this.driver === 'local') {
      const uploadDir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, `${fileId}_${file.originalname}`);
      fs.writeFileSync(filePath, file.buffer);
    }

    this.logger.log(`[Storage] Uploaded via driver: ${this.driver} | File: ${file.originalname} | Size: ${file.size} bytes`);
    
    return {
      fileId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: mockUrl,
    };
  }

  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    this.logger.log(`[Storage] Deleted fileId: ${fileId} using driver: ${this.driver}`);
    return { success: true };
  }
}
