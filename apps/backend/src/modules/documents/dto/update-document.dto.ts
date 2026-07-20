import { PartialType } from '@nestjs/mapped-types';
import { UploadDocumentDto } from './upload-document.dto';

export class UpdateDocumentDto extends PartialType(UploadDocumentDto) {}
