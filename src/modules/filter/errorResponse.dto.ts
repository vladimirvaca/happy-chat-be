import { ApiProperty } from '@nestjs/swagger';
import { FieldErrorDto } from './fieldError.dto';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ type: [FieldErrorDto], required: false })
  errors?: FieldErrorDto[];
}
