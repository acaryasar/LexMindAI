import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskCommentDto {
  @ApiProperty({ description: 'Yorum içeriği' })
  @IsString()
  content: string;
}
