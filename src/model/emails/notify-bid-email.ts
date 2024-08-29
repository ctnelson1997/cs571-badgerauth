import { CS571BaseEmail } from "./base-email";

export class CS571NotifyBidEmail extends CS571BaseEmail {
    public constructor(to: string, bid: string) {
        super(to, "CS571 New Badger ID", `Hello ${to},\n\nA new Badger ID has been generated for you:\n\n${bid}\n\nIn order to use the CS571 APIs, you will need to send this with every API request.`);
    }
}