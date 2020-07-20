[![codecov](https://codecov.io/gh/ai-music/echo/branch/master/graph/badge.svg)](https://codecov.io/gh/ai-music/echo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm type definitions](https://img.shields.io/npm/types/typescript)

# Echo

Echo is a tiny library that wraps MongoDB's basic configuration tasks and simplifies them; with native support for Typescript.

**It is not (and does not aim to become) a complete ORM/ODM solution like [TypeORM](https://github.com/typeorm/typeorm) or [Mongoose](https://mongoosejs.com/).**

It is perfect for use in small projects or microservices that handle a limited number of collections or complex queries without the overhead of a big library.

Echo allows you to:

-   build a [\$jsonSchema](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/) via decorators **( incomplete )**
-   build indexes via decorators **( incomplete )**
-   handle a set of custom functions across the document lifecycle.
-   centralize common queries in a single class.

N.B.
**This library is an unstable prototype.**

-   [Quick start](#quick-start)
-   [MongoDBService](#MongoDBService)
-   [Collections and AbstractCollection](#collections-and-abstractcollection)

## Quick start

Install the package

```shell script
yarn add @ai-music/echo
```

Define the shape of your MongoDB document

```typescript
interface UserDocument {
    firstName: string
    lastName: string
    email: string
    createdAt: Date
}
```

Create a collection class from AbstractCollection passing your document shape

```typescript
import { AbstractCollection, Field, IndexUnique } from '@ai-music/echo'

class Users extends AbstractCollection<UserDocument> {
    @Field()
    protected firstName: string

    @Field()
    protected lastName: string

    @Field()
    @IndexUnique()
    protected email: string

    @Field()
    protected createdAt: Date
}
```

Create an instance of MongoDBService, register your collection and create a connection to the database

```typescript
import { MongoDBService } from '@ai-music/echo'

const service = MongoDBService.factory('mongodb://localhost:27017/development', { appName: 'MyService' })
service.registerCollection(Users)
await service.connect()
```

At this stage, you can start to use the your collection class in order to find/create/update/delete documents.

```typescript
const usersCollection = service.getCollection<Users>(Users.name)

// Create new document
const userData: UserDocument = {
    firstName: 'mario',
    lastName: 'bros',
    email: 'mario@bros.com',
    createdAt: new Date()
}
await usersCollection.createDocument(userData)

// Find document
await usersCollection.findDocument({ email: 'mario@bros.com' })
```

## MongoDBService

MongoDBService wraps the official MongoDB node driver.

It is used for:

-   Creating a connection to the database
-   Registering collections to the service
-   Creating all the collections registered to the service ( automatic )
-   Updating the jsonSchema of each collection registered to the service ( automatic via decorators )
-   Creating collections indexes ( automatic via decorators )

The service should be placed in the entry point of your application and stored in a [service locator](https://en.wikipedia.org/wiki/Service_locator_pattern) ( if you use one ).

N.B.
The connection string must include the database

```typescript
import { MongoDBService } from '@ai-music/echo'
import { MyCollection } from './collections'

async function initMyService(): Promise<any> {
    try {
        const service = MongoDBService.factory('mongodb://localhost:27017/development', { appName: 'MyService' })
        //  Collection must be registered before attempting a connection
        service.registerCollection(MyCollection)
        await service.connect()
    } catch (error) {
        console.log(error)
    }
}
```

## Collections and AbstractCollection
