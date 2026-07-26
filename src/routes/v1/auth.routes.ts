import { Router } from "express";
import crypto from "node:crypto";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma.js";
import { userSchema, userSchemaSignin } from "../../schema/user.schema.js";
import bcrypt from 'bcrypt';
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
    clearSessionCookie,
    createSessionToken,
    setSessionCookie,
} from "../../lib/session.js";


export const authRoutes = Router();
const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function oauthCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: OAUTH_COOKIE_MAX_AGE_MS,
        path: "/api/v1/auth/google/callback",
    };
}

function getGoogleConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw new Error(
            "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL must be configured",
        );
    }

    return { clientId, clientSecret, callbackUrl };
}

function getGoogleClient() {
    const { clientId, clientSecret, callbackUrl } = getGoogleConfig();
    return new OAuth2Client(clientId, clientSecret, callbackUrl);
}

function frontendUrl(path: string) {
    return new URL(path, process.env.FRONTEND_URL ?? "http://localhost:3000").toString();
}

function normalizeUsername(value: string) {
    const normalized = value
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);

    return normalized.length >= 3 ? normalized : `user-${normalized || "google"}`;
}

async function availableUsername(email: string, name?: string) {
    const base = normalizeUsername(name || email.split("@")[0] || "google-user");
    let candidate = base;

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const exists = await prisma.user.findUnique({ where: { username: candidate } });
        if (!exists) return candidate;
        candidate = `${base.slice(0, 40)}-${crypto.randomBytes(3).toString("hex")}`;
    }

    throw new Error("Unable to generate a unique username");
}

authRoutes.post("/signup",async (req,res)=>{
    try{
    const parsedData = userSchema.safeParse(req.body);
    if(!parsedData.success){
        const errors = parsedData.error.issues.map(i => i.message).join(", ");
        res.status(411).json({
            message: errors
        })
        return
    }

    const username = parsedData.data.username;
    const password = parsedData.data.password;
    const passwordHint = parsedData.data.passwordHint || null;

    const hashPassword = await bcrypt.hash(password,11);

    const check_user = await prisma.user.findUnique({
        where: {username: username}
    });
    if(check_user){
        res.status(403).json({
            message: "User already exist with this username"
        })
        return
    }

    await prisma.user.create({
        data:{
            username: username,
            password: hashPassword,
            passwordHint: passwordHint
        }
    })
    res.status(200).json({
        message: "Signed Up"
    })

    }catch(error){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

authRoutes.post("/signin",async (req,res)=>{
    try{
    const parsedData = userSchemaSignin.safeParse(req.body);

    if(!parsedData.success){
        res.status(403).json({
            message: "Invalid username or password"
        })
        return
    }

    const user = await prisma.user.findUnique({
        where:{
            username: parsedData.data.username
        }
    })

    if(!user){
        res.status(403).json({
            message: "username not found"
        })
        return
    }
    
    if (!user.password) {
        res.status(403).json({
            message: "This account uses Google sign-in"
        })
        return
    }

    const checkPassword = await bcrypt.compare(parsedData.data.password,user.password);

    if(!checkPassword){
        res.status(403).json({
            message: "Incorrect password",
            hint: user.passwordHint || null
        })
        return
    }

    const token = createSessionToken(user.id);
    setSessionCookie(res, token);

    res.json({
        token: token,
        username: parsedData.data.username
    })


    }catch(error){
        res.status(500).json({
            message: "Fail to generate token"
        })
    }
})

authRoutes.get("/auth/google", async (_req, res) => {
    try {
        const client = getGoogleClient();
        const state = crypto.randomBytes(32).toString("base64url");
        const nonce = crypto.randomBytes(32).toString("base64url");
        const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
        if (!codeChallenge) {
            throw new Error("Unable to generate OAuth PKCE challenge");
        }
        const options = oauthCookieOptions();

        res.cookie("sb_oauth_state", state, options);
        res.cookie("sb_oauth_nonce", nonce, options);
        res.cookie("sb_oauth_verifier", codeVerifier, options);

        const authorizationUrl = client.generateAuthUrl({
            access_type: "online",
            scope: ["openid", "email", "profile"],
            state,
            nonce,
            code_challenge: codeChallenge,
            code_challenge_method: CodeChallengeMethod.S256,
            prompt: "select_account",
        });

        res.redirect(authorizationUrl);
    } catch (error) {
        console.error("Unable to start Google OAuth:", error);
        res.redirect(frontendUrl("/signin?error=oauth_not_configured"));
    }
});

authRoutes.get("/auth/google/callback", async (req, res) => {
    const callbackError = () => res.redirect(frontendUrl("/signin?error=oauth_failed"));

    try {
        const code = typeof req.query.code === "string" ? req.query.code : undefined;
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        const storedState = req.cookies?.sb_oauth_state;
        const nonce = req.cookies?.sb_oauth_nonce;
        const codeVerifier = req.cookies?.sb_oauth_verifier;

        if (!code || !state || !storedState || !nonce || !codeVerifier) {
            return callbackError();
        }

        const providedState = Buffer.from(state);
        const expectedState = Buffer.from(storedState);
        if (
            providedState.length !== expectedState.length ||
            !crypto.timingSafeEqual(providedState, expectedState)
        ) {
            return callbackError();
        }

        const client = getGoogleClient();
        const { tokens } = await client.getToken({ code, codeVerifier });
        if (!tokens.id_token) return callbackError();

        const { clientId } = getGoogleConfig();
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId,
        });
        const payload = ticket.getPayload();

        if (
            !payload?.sub ||
            !payload.email ||
            payload.email_verified !== true ||
            payload.nonce !== nonce
        ) {
            return callbackError();
        }

        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: payload.sub,
                },
            },
            include: { user: true },
        });

        let user = existingAccount?.user;
        if (!user) {
            const existingEmail = await prisma.user.findUnique({
                where: { email: payload.email },
            });

            if (existingEmail) {
                return res.redirect(frontendUrl("/signin?error=account_link_required"));
            }

            const username = await availableUsername(payload.email, payload.name);
            user = await prisma.user.create({
                data: {
                    username,
                    email: payload.email,
                    accounts: {
                        create: {
                            provider: "google",
                            providerAccountId: payload.sub,
                        },
                    },
                },
            });
        }

        const token = createSessionToken(user.id);
        setSessionCookie(res, token);

        const { maxAge: _maxAge, ...clearOptions } = oauthCookieOptions();
        res.clearCookie("sb_oauth_state", clearOptions);
        res.clearCookie("sb_oauth_nonce", clearOptions);
        res.clearCookie("sb_oauth_verifier", clearOptions);
        return res.redirect(frontendUrl("/dashboard"));
    } catch (error) {
        console.error("Google OAuth callback failed:", error);
        return callbackError();
    }
});

authRoutes.get("/auth/me", authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, username: true, email: true },
    });

    if (!user) {
        clearSessionCookie(res);
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    res.json({ user });
});

authRoutes.post("/auth/logout", (_req, res) => {
    clearSessionCookie(res);
    res.status(204).send();
});


