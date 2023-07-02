import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import { CS571Auth } from './auth';
import { Util } from './util';
import { rateLimit } from 'express-rate-limit';

export class CS571Configurator {
    static configure(app: Express): void {
        CS571Configurator.initLogging(app);
        CS571Configurator.initErrorHandling(app);
        CS571Configurator.initBodyParsing(app);
        CS571Configurator.initRateLimiting(app);
        CS571Configurator.initCorsPolicy(app);
        CS571Configurator.initAuth(app);
    }

    private static initLogging(app: Express): void {
        app.use(morgan((tokens, req, res) => {
            return [
                Util.getDateForLogging(),
                tokens['remote-addr'](req, res),
                tokens.method(req, res),
                tokens.url(req, res),
                tokens.status(req, res),
                CS571Auth.getUserFromRequest(req),
                tokens['response-time'](req, res), 'ms'
            ].join(' ')
        }));
    }

    private static initErrorHandling(app: Express): void {
        app.use((err: Error, req: Request, res: Response) => {
            console.log("Encountered an erroneous request!")
            const datetime = new Date();
            const datetimeStr = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`;
            res.status(500).send({
                "error-msg": "Oops! Something went wrong. Check to make sure that you are sending a valid request. Your recieved request is provided below. If it is empty, then it was most likely not provided or malformed. If you have verified that your request is valid, please contact the CS571 staff.",
                "error-req": JSON.stringify(req.body),
                "date-time": datetimeStr
            })
        });
    }

    private static initBodyParsing(app: Express): void {
        app.use(express.json());
        app.use(express.urlencoded({
            extended: true
        }));
    }

    private static initRateLimiting(app: Express): void {
        app.use(rateLimit({
            message: {
                msg: "Too many requests, please try again later."
            },
            windowMs: 30 * 1000, // 30 seconds
            max: (req, _) => req.method === "OPTIONS" ? 0 : 100, // limit each client to 100 requests every 30 seconds
            keyGenerator: (req, _) => req.header('X-CS571-ID') as string // throttle on BID
        }));
        app.set('trust proxy', 1);
    }

    private static initCorsPolicy(app: Express): void {
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);
            res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
            res.header('Access-Control-Allow-Methods', req.headers["access-control-request-method"]);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Expose-Headers', 'Set-Cookie');
            next();
        });
    }

    private static initAuth(app: Express): void {

    }
}