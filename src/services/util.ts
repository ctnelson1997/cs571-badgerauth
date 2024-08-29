import crypto from 'crypto'

export class Util {
    public static generateBadgerId(): string {
        return "bid_" + crypto.randomBytes(32).toString('hex');
    }

    // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    public static validateEmail(email: string): boolean {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ) ? true : false;
    };
}