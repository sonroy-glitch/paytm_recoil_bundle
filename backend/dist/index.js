"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtPasscode = "grey-eyes";
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
var usernameSchema = zod_1.z.string().min(1);
var emailSchema = zod_1.z.string().email();
var passwordSchema = zod_1.z.string().min(8);
var pinSchema = zod_1.z.string().min(4);
//signup endpoint 
app.use((0, cors_1.default)());
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const usernameSearch = yield prisma.user.findFirst({
        where: { username: body.username }
    });
    const emailSearch = yield prisma.user.findFirst({
        where: { email: body.email }
    });
    if (usernameSearch == null) {
        if (emailSearch == null) {
            var check = usernameSchema.safeParse(body.username);
            var check1 = emailSchema.safeParse(body.email);
            var check2 = passwordSchema.safeParse(body.password);
            var check3 = pinSchema.safeParse(body.pin);
            if ((check.success && check1.success && check2.success && check3.success)) {
                const hashedPassword = yield bcryptjs_1.default.hash(body.password, 10);
                const data = yield prisma.user.create({
                    data: {
                        username: body.username,
                        email: body.email,
                        password: hashedPassword
                    }
                });
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    const data1 = yield prisma.user.findFirst({
                        where: { username: body.username }
                    });
                    const hashedPin = yield bcryptjs_1.default.hash(body.pin, 10);
                    if (data1 != null) {
                        yield prisma.bank.create({
                            data: {
                                user_id: data1.id,
                                username: data1.username,
                                balance: (Math.random()) * 10000,
                                pin: hashedPin
                            }
                        });
                        yield prisma.friend.create({
                            data: {
                                user_id: data1.id,
                                username: data1.username,
                                friend: []
                            }
                        });
                        res.status(200).send("User created");
                    }
                }), 500);
            }
            else {
                res.status(200).send("Invalid input");
            }
        }
        else {
            res.status(200).send("Email already exists kindly signin");
        }
    }
    else {
        res.status(202).send("Username already in use");
    }
}));
//signin endpoint
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var find = yield prisma.user.findFirst({
        where: { email: body.data }
    });
    var find1 = yield prisma.user.findFirst({
        where: { username: body.data }
    });
    // console.log(find)
    // console.log(find1)
    if (find !== null) {
        const output = yield bcryptjs_1.default.compare(body.password, find.password);
        if (!(output)) {
            res.status(202).send("Wrong credentials");
        }
        else {
            var token = jsonwebtoken_1.default.sign({ username: find.username }, jwtPasscode);
            res.status(200).send(token);
        }
    }
    else if (find1 !== null) {
        const output = yield bcryptjs_1.default.compare(body.password, find1.password);
        if (!(output)) {
            res.status(202).send("Wrong credentials");
        }
        else {
            var token = jsonwebtoken_1.default.sign({ username: find1.username }, jwtPasscode);
            res.status(200).send(token);
        }
    }
    else {
        res.status(202).send("User not found");
    }
}));
// friend user 
//receives a username from the frontend
function jwtMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var token = String(req.headers.auth);
        try {
            var verify = jsonwebtoken_1.default.verify(token, jwtPasscode, (err) => {
                if (!err) {
                    next();
                }
                else {
                    res.send(err);
                }
            });
        }
        catch (error) {
            res.send(error);
        }
    });
}
//friend user , transaction,view balance,fetch friends
app.post("/user/friend", jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = req.body;
    var token = String(req.headers.auth);
    var access = jsonwebtoken_1.default.decode(token);
    // console.log(access)
    if (access !== null && typeof access === "object") {
        var find = yield prisma.friend.findFirst({
            where: {
                username: access.username
            }
        });
        // console.log(find)
        if (find != null) {
            find.friend.push(data.friend);
            yield prisma.friend.update({
                where: { username: access.username },
                data: {
                    friend: find.friend
                }
            });
            res.send("Friend successfully added");
        }
    }
}));
//fetch all users
app.get("/user/friend/fetch", jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = String(req.headers.auth);
    var arr = [];
    var arrFinal = [];
    var access = jsonwebtoken_1.default.decode(token);
    if (token !== null && typeof access === "object") {
        var data = yield prisma.friend.findFirst({
            where: { username: access.username
            }, select: {
                friend: true
            }
        });
        var dataAll = yield prisma.user.findMany({
            select: {
                username: true,
            }
        });
        if (dataAll != null) {
            dataAll.map((item) => {
                if (access.username != item.username) {
                    arr.push(item.username);
                }
            });
            if (data != null) {
                arrFinal = arr.filter((item) => {
                    return !(data.friend).includes((item));
                });
            }
        }
    }
    res.send(arrFinal);
}));
//fetch friends
app.get("/user/fetch", jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = String(req.headers.auth);
    var access = jsonwebtoken_1.default.decode(token);
    if (token !== null && typeof access === "object") {
        var data = yield prisma.friend.findFirst({
            where: { username: access.username
            }, select: {
                friend: true
            }
        });
        res.send(data);
    }
}));
//balance
app.get("/user/balance", jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = String(req.headers.auth);
    var access = jsonwebtoken_1.default.decode(token);
    if (token !== null && typeof access === "object") {
        var data = yield prisma.user.findFirst({
            where: { username: access.username
            }, select: {
                id: true
            }
        });
        if (data != null) {
            var finalData = yield prisma.bank.findFirst({
                where: { user_id: data.id
                }, select: {
                    username: true,
                    balance: true
                }
            });
            if (finalData !== null) {
                res.status(202).json(finalData);
            }
        }
    }
}));
//transactions
app.post("/user/payment", jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var token = String(req.headers.auth);
    var access = jsonwebtoken_1.default.decode(token);
    if (access !== null && typeof access === "object") {
        var finalSearch = yield prisma.bank.findFirst({
            where: { username: access.username },
            select: {
                balance: true,
                pin: true
            }
        });
        if (finalSearch !== null) {
            if (finalSearch.balance - body.amount >= 0) {
                var check = yield bcryptjs_1.default.compare(body.pin, finalSearch.pin);
                if (!(check)) {
                    res.send("Wrong pin");
                }
                else {
                    // updation logic for both users  
                    yield prisma.bank.update({
                        where: { username: access.username },
                        data: {
                            balance: finalSearch.balance - body.amount
                        }
                    });
                    var receiverData = yield prisma.bank.findFirst({
                        where: { username: body.username },
                        select: { balance: true }
                    });
                    if (receiverData !== null && typeof body.amount === "number") {
                        var value = parseInt(String(receiverData.balance) + (body.amount));
                        console.log(typeof receiverData.balance);
                        console.log(typeof body.amount);
                        yield prisma.bank.update({
                            where: { username: body.username },
                            data: {
                                balance: value
                            }
                        });
                    }
                    res.send("Transaction is successful");
                }
            }
            else {
                res.send("insufficient balance");
            }
        }
    }
}));
app.listen(3000);
