import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for user registration requests.
 * Defines the shape and validation rules for the request body.
 */
export class RegisterUserDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  password: string;
}