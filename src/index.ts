import express from 'express';
import { VALID_USERS as usersDb } from './userLogins';
import { ERRORS as errors } from './errors';
const app = express()
const port = 3000

app.use(express.json())

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

const basicAuthHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check for Authorization Header
  if (!req.headers.authorization) {
    returnError(res, errors.missingToken)
    return
  }

  const [BasicString, userLoginEncoded] = req.headers.authorization!.split(' ');
  // Check for 'Basic' string in Authorization Header
  if (BasicString !== 'Basic') {
    returnError(res, errors.invalidToken)
    return
  }
  // Decode login details from base64 string
  const [loginName, password] = Buffer.from(userLoginEncoded, 'base64').toString('ascii').split(':');

  const validUser = usersDb.users.find((user) => {
    return (user.userLogin === loginName && user.password === password)
  })

  validUser ? next() : returnError(res, errors.invalidDetails)

}

const returnError = (res: express.Response, error: string) => {
  res.status(401).send({error})
}

app.get('/basic-auth', basicAuthHandler, (req: express.Request, res: express.Response) => {
  res.status(200).end();
})

export const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})