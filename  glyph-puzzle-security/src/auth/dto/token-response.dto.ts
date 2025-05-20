import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class TokenResponseDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @IsString()
    @IsOptional() // Refresh token might be optional depending on the flow
    refreshToken?: string;

    @IsNumber()
    @IsNotEmpty()
    expiresIn: number; // Typically in seconds

    @IsString()
    @IsNotEmpty()
    tokenType: string; // e.g., "Bearer"

    constructor(accessToken: string, expiresIn: number, tokenType: string = 'Bearer', refreshToken?: string) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}