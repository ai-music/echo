[![codecov](https://codecov.io/gh/ai-music/echo/branch/master/graph/badge.svg)](https://codecov.io/gh/ai-music/echo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm type definitions](https://img.shields.io/npm/types/typescript)

# Echo

Echo is a tiny library that wraps MongoDB basic configuration tasks in a super-easy way with native support for Typescript.

**It is not ( and does not aim to be ) a clever package like [TypeORM](https://github.com/typeorm/typeorm) or [Mongoose](https://mongoosejs.com/).**

It is perfect to be used in small projects or microservices that handle a limited number of collections without the overhead of a big library.

Echo allows you:

-   build \$jsonSchema via decorators ( incomplete )
-   build indexes via decorators ( incomplete )
-   handle a set of custom functions across the document lifecycle.
-   centralize common queries in a single class.

N.B.
**This library is an unstable prototype.**

## Collections

```typescript
interface UserDocument {
    firstName: string
    lastName: string
    email: string
    password?: string
    createdAt: Date
}

@Collection
class Users extends AbstractCollection<UserDocument> {
    @Field()
    protected firstName: string

    @Field()
    protected lastName: string

    @Field()
    @IndexUnique()
    protected email: string

    @Field()
    protected password: string

    @Field()
    protected createdAt: Date
}
```
