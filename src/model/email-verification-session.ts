export class EmailVerificationSession {
    
    public static readonly DEFAULT_EXPIRATION_TIME = 15 * 60;

    public readonly email: string;
    public readonly code: string;

    public readonly iat: Date;
    public readonly eat: Date;
    
    public constructor(email: string, code: string, expTime?: number) {
        this.email = email;
        this.code = code;
        this.iat = new Date();
        this.eat = new Date(this.iat.getTime() + (expTime ? 
            expTime :
            EmailVerificationSession.DEFAULT_EXPIRATION_TIME
        ) * 1000);
    }

    public isExpired(): boolean {
        return this.eat.getTime() < new Date().getTime();
    }
}