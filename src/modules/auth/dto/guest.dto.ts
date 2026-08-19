import { IsUUID } from 'class-validator';

export class GuestDto {
  @IsUUID('4', { message: 'deviceId must be a valid UUID v4' })
  deviceId: string;
}
