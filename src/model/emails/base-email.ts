import { Options } from "nodemailer/lib/mailer";
import { CS571Email } from "./email";

export class CS571BaseEmail implements CS571Email {

    public readonly to: string;
    public readonly subj: string;
    public readonly text: string;

    public constructor(to: string, subj: string, text: string) {
        this.to = to;
        this.subj = subj;
        this.text = text + "\n\nSincerely,\nThe CS571 Course Staff\n\nCS571 course staff and information systems will NEVER send you links or ask for personal information.";
    }

    public generate(): Options {
        return {
            to: this.to,
            subject: this.subj,
            text: this.text
        }
    }

}