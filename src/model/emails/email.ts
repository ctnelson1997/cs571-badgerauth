import Mail from "nodemailer/lib/mailer";

export interface CS571Email {
    readonly to: string;
    readonly subj: string;
    readonly text: string;

    generate(): Mail.Options;
}