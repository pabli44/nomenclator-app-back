import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    registerGuest(guestDto: GuestDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    getProfile(req: {
        user: {
            id: string;
            email: string;
        };
    }): {
        id: string;
        email: string;
    };
}
