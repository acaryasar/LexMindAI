import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClientNoteDto {
  @IsNotEmpty({ message: 'Not içeriği zorunludur' })
  @IsString()
  content: string;
}
