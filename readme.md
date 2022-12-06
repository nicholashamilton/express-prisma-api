# Express Prisma API
This web API is built with Express, Prisma ORM and TypeScript.

## Usage
Clone the repo `git clone https://github.com/nicholashamilton/express-prisma-api.git`

Configure and rename `.env.development.local.example` to `.env.development.local`

Install node modules `npm install`

Generate Prisma Client `npm run prisma:generate`

Start dev environment `npm run dev`

## Postman
A [Postman](https://www.postman.com/) collection can be found [here](https://github.com/nicholashamilton/express-prisma-api/blob/main/postman_collection.json)

### Notes
This project is still being worked on. Here is a brief overview of the roadmap.

 * [x] Auth Endpoints (signIn, logIn, logOut, secret)
 * [ ] Auth Endpoints (currentUser, passwordReset, confirmEmail)
 * [x] Admin Endpoints (getUsers, getUserById, createUser, updateUser, deleteUser)
 * [ ] Redis session cache
