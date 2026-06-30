import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file / digital assets (scans, PDFs)' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  async uploadFile(@UploadedFile() file: any) {
    return this.storageService.uploadFile(file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by identifier' })
  @ApiResponse({ status: 200, description: 'File removed successfully.' })
  async deleteFile(@Param('id') id: string) {
    return this.storageService.deleteFile(id);
  }
}
