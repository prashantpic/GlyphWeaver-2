import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for email/password login requests.
 * Defines the shape and validation rules for the request body.
 */
export class LoginEmailDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty.' })
  password: string;
}