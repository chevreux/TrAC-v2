import { IsEmail, IsHash, Length } from "class-validator";
import { ArgsType, Field, ObjectType } from "type-graphql";

import { User } from "./user";

@ArgsType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsHash("sha1", { message: "password must be a hash" })
  password: string;
}

@ArgsType()
export class UnlockInput extends LoginInput {
  @Field()
  @Length(32, 100)
  unlockKey: string;
}

@ObjectType()
export class AuthResult {
  @Field({ nullable: true })
  user?: User;

  @Field({ nullable: true })
  error?: string;
}
