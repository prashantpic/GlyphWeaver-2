import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDTO {
  @IsString()
  @IsNotEmpty()
  identifier!: string; // Can be email or username

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Example minimum password length
  password!: string;
}