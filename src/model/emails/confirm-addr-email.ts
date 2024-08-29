import { CS571BaseEmail } from "./base-email";

export class CS571ConfirmAddressEmail extends CS571BaseEmail {
    public constructor(to: string, code: string) {
        super(to, "CS571 Email Verification Code", `Hello ${to},\n\nYour 12-character verification code is:\n\n${code}\n\nThis code is valid for 15 minutes. Please enter it on the course webpage.`);
    }
}