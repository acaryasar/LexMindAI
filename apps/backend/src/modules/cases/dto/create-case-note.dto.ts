import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCaseNoteDto {
  @IsNotEmpty({ message: 'Not içeriği zorunludur' })
  @IsString()
  content: string;
}
