// import { Request, Response, NextFunction } from "express";

// export interface IReqUser extends Request {
//   user?: any;
// }

// export default (req: Request, res: Response, Next: NextFunction) => {
//   const authorization = req.headers.authorization?.split(" ")[1];

//   if (!authorization) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const [prefix, accessToken] = authorization.split(" ");

//   if (!(prefix === "Bearer" && accessToken)) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const user = getUserData(accessToken);
// };
