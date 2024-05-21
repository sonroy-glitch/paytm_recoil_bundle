import express,{Request,Response,NextFunction} from "express";
import {z} from "zod";
import cors from "cors"
import {PrismaClient} from "@prisma/client"
import jwt,{Jwt,JwtPayload} from "jsonwebtoken"
import bcrypt from "bcryptjs"
const jwtPasscode="grey-eyes"
const prisma = new PrismaClient();
const app =express();
app.use(express.json());
var usernameSchema= z.string().min(1)
var emailSchema = z.string().email();
var passwordSchema=z.string().min(8)
var pinSchema=z.string().min(4)
//signup endpoint 
app.use(cors());

app.post("/signup",async (req:Request,res:Response)=>{
    const body:{
        username:string,
        email:string,
        password:string,
        pin:string
    }=req.body;
    const usernameSearch= await prisma.user.findFirst({
        where:{username:body.username}
    })
    const emailSearch= await prisma.user.findFirst({
        where:{email:body.email}
    })
    if(usernameSearch==null){
       if(emailSearch==null){
         var check = usernameSchema.safeParse(body.username)
         var check1 = emailSchema.safeParse(body.email)
         var check2 = passwordSchema.safeParse(body.password)
         var check3= pinSchema.safeParse(body.pin)

        if ((check.success&&check1.success&&check2.success&&check3.success)){
            const hashedPassword= await bcrypt.hash(body.password,10)
            const data = await prisma.user.create({
                data:{
                    username:body.username,
                    email:body.email,
                    password:hashedPassword
                }
            })
            setTimeout(async() => {
                const data1=await prisma.user.findFirst({
                    where:{username:body.username}
                })
                const hashedPin=await bcrypt.hash(body.pin,10)
                if (data1!=null){
                    await prisma.bank.create({
                        data:{
                       user_id:data1.id,
                       username:data1.username,
                       balance:(Math.random())*10000,
                       pin:hashedPin
                        }
                    })
                    await prisma.friend.create({
                        data:{
                            user_id:data1.id,
                            username:data1.username,
                            friend:[]
                        }
                    })

                    res.status(200).send("User created")
                }
               
    
            }, 500);
            
        }
        else{
         
         res.status(200).send("Invalid input")
        }
       }
       else{
        res.status(200).send("Email already exists kindly signin")
       }
    }
    else{
        res.status(202).send("Username already in use")
    }
})
//signin endpoint
app.post("/signin",async(req:Request,res:Response)=>{
    var body :{
        data:string,
        password:string
    }=req.body;
    var find = await prisma.user.findFirst({
        where:{email:body.data}
    })
    var find1 = await prisma.user.findFirst({
        where:{username:body.data}
    })
    // console.log(find)
    // console.log(find1)

    if(find!==null){
      const output = await bcrypt.compare(body.password,find.password)
      if(!(output)){
        res.status(202).send("Wrong credentials")
      }
      else{
        var token = jwt.sign({username:find.username},jwtPasscode)
        res.status(200).send(token)
      }
    }
    else if(find1!==null){
        const output = await bcrypt.compare(body.password,find1.password)
        if(!(output)){
          res.status(202).send("Wrong credentials")
        }
        else{
          var token = jwt.sign({username:find1.username},jwtPasscode)
          res.status(200).send(token)
        }
      }
    else{
        res.status(202).send("User not found")
    }
})
// friend user 
//receives a username from the frontend
async function jwtMiddleware(req:Request,res:Response,next:NextFunction){
    var token = String(req.headers.auth);
    try {
    var verify=jwt.verify(token,jwtPasscode,(err)=>{
        if(!err){
            next()
        }
        else{
            res.send(err)
        }
    })
      
    } catch (error) {
        res.send(error)
    }
}
//friend user , transaction,view balance,fetch friends
app.post("/user/friend",jwtMiddleware,async(req:Request,res:Response)=>{
    var data:{
        friend:string
    }=req.body;
    var token=String(req.headers.auth)
    var access=jwt.decode(token)  as JwtPayload;
    // console.log(access)
    if(access!==null && typeof access === "object"){
        var find = await prisma.friend.findFirst({
            where:{
                username:access.username
            }
        })
        // console.log(find)
        if(find!=null){
            find.friend.push(data.friend);
          await prisma.friend.update({
        where:{username:access.username},
        data:{
           friend:find.friend
        }
    })
    res.send("Friend successfully added")
        }
    }
})
//fetch all users
app.get("/user/friend/fetch",jwtMiddleware,async(req:Request,res:Response)=>{
    var token = String(req.headers.auth);
    var arr:any=[]
    var arrFinal:any=[]

    var access=jwt.decode(token)  as JwtPayload;
    if(token!==null&& typeof access === "object"){
        var data = await prisma.friend.findFirst({
            where:{username:access.username
        },select:{
            friend:true
        }})
        var dataAll= await prisma.user.findMany({
            select:{
                username:true,
            }
        });
        if(dataAll!=null){
            dataAll.map((item)=>{
                if(access.username!=item.username){
                    arr.push(item.username)
                }
            })
            if(data!=null){
              arrFinal=arr.filter((item:any)=>{
                return !(data!.friend).includes((item))
              })
            }
        }


    }
   res.send(arrFinal)
   
})
//fetch friends
app.get ("/user/fetch",jwtMiddleware,async (req:Request,res:Response)=>{
    var token = String(req.headers.auth);
    var access=jwt.decode(token)  as JwtPayload;
    if(token!==null&& typeof access === "object"){
        var data = await prisma.friend.findFirst({
            where:{username:access.username
        },select:{
            friend:true
        }})
        res.send(data)

    }
})
//balance
app.get ("/user/balance",jwtMiddleware,async (req:Request,res:Response)=>{
    var token = String(req.headers.auth);
    var access=jwt.decode(token)  as JwtPayload;
    if(token!==null&& typeof access === "object"){
        var data = await prisma.user.findFirst({
            where:{username:access.username
        },select:{
            id:true
        }})
        if(data!=null){var finalData = await prisma.bank.findFirst({
            where:{user_id:data.id
        },select:{
            username:true,
            balance:true
        }})
        if(finalData!==null){
            res.status(202).json(finalData)
        }
        }

    }
})
//transactions

app.post("/user/payment",jwtMiddleware,async(req:Request,res:Response)=>{
    var body:{
        username:string,
        amount:number,
        pin:string
    }=req.body;
    var token = String(req.headers.auth);
    var access= jwt.decode(token) as JwtPayload;
    if(access!==null && typeof access ==="object"){
        var finalSearch= await prisma.bank.findFirst({
            where:{username:access.username},
            select:{
                balance:true,
                pin:true
            }
        })
       if(finalSearch!==null){
         if(finalSearch.balance-body.amount>=0){
         var check= await bcrypt.compare(body.pin,finalSearch.pin)
         if(!(check)){
          res.send("Wrong pin")
         }
         else{
           // updation logic for both users  
           await prisma.bank.update({
            where:{username:access.username},
            data:{
                balance:finalSearch.balance-body.amount
            }
           })
           var receiverData = await prisma.bank.findFirst({
            where:{username:body.username},
            select:{balance:true}
           })
           if(receiverData!==null&&typeof  body.amount ==="number" )
            {
           var value:number=parseInt(String(receiverData.balance)+(body.amount))
                console.log(typeof receiverData.balance )
                console.log(typeof body.amount )

                await prisma.bank.update({
            where:{username:body.username},
            data:{
                balance:value
            }
           })
        }
           res.send("Transaction is successful")
         }
        }
        else{
            res.send("insufficient balance")
        }}
    }
        
       }
    
)
app.listen(3000)