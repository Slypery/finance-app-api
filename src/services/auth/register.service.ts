import { db } from '@/db/index.js'
import { users, type Users } from '@/db/schema.js'
import { AppError } from '@/errors/app.error.js'
import { argon2id } from 'hash-wasm'

export class UsernameAlreadyExistsError extends AppError {
  constructor(username: string) {
    super(`User with the username: "${username}" already exists`, 409, 'USERNAME_ALREADY_TAKEN')
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`User with the email: "${email}" already exists`, 409, 'EMAIL_ALREADY_EXISTS')
  }
}

type RegisterNewUserInput = {
  username: string
  email: string
  displayName: string
  password: string
}

type RegisterNewUserResult = Pick<Users, 'id' | 'username' | 'email' | 'displayName' | 'createdAt'>

export async function registerNewUser(input: RegisterNewUserInput): Promise<RegisterNewUserResult> {
  // check email and username
  const existing = await db.query.users.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  })

  if (existing) {
    if (existing.username === input.username) throw new UsernameAlreadyExistsError(input.username)
    throw new EmailAlreadyExistsError(input.email)
  }

  // create password hash
  const passwordHash = await argon2id({
    password: input.password,
    salt: crypto.getRandomValues(new Uint8Array(16)),
    parallelism: 1,
    iterations: 2,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'encoded',
  })

  // insert into Users Table
  const [userData] = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      displayName: input.displayName,
      passwordHash,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })

  return userData
}
