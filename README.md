![npm](https://img.shields.io/npm/v/@ai-music/echo?label=current%20version)
[![codecov](https://codecov.io/gh/ai-music/echo/branch/master/graph/badge.svg)](https://codecov.io/gh/ai-music/echo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm type definitions](https://img.shields.io/npm/types/typescript)

# Echo

Echo is a tiny library that wraps MongoDB's basic configuration tasks and simplifies them; with native support for TypeScript.

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
-   [Retrieve Document Methods](#retrieve-document-methods)
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

Create a collection class from AbstractCollection passing your document shape. To create a database index for a field, define the index parameters as an argument to the `@Field` decorator, as shown on the `email` field below.

```typescript
import { AbstractCollection, Field } from '@ai-music/echo'

class Users extends AbstractCollection<UserDocument> {
    @Field()
    protected firstName: string

    @Field()
    protected lastName: string

    @Field({ index: { order: 1, unique: true } })
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

At this stage, you can start to use your collection class in order to find/create/update/delete documents.

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

## Retrieve Document Methods

-   `findDocument` can be used to retrieve a single document by specific filters.
-   `findDocuments` can be used to retrieve an array of documents by specific filters.

```typescript
interface IFindDocumentsInput<T>  {
	filters?: FilterQuery<T>
}

findDocument(filters?: FilterQuery<T>, fieldsToPopulate?: string[] ): Promise<T | null>

findDocuments(filters?: IFindDocumentsInput<T>, fieldsToPopulate?: string[] ): Promise<IDocumentsResponse<T>>

```

Example :

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
const user = await usersCollection.findDocument({ email: 'mario@bros.com' })
// user => { firstName: 'mario', lastName: 'bros', id: '1234-1234-1234-1234', email: 'mario@bros.com', createdAt: '2021-02-05T14:42:44.758Z' }

// Find documents
const users = await usersCollection.findDocuments({ email: 'mario@bros.com' })
// users => { data: [ { firstName: 'mario', lastName: 'bros', id: '1234-1234-1234-1234', email: 'mario@bros.com', createdAt: '2021-02-05T14:42:44.758Z' } ] }
```

You can also pass in a second argument, which is optional, that allows you to populate the model with the specified keys

Example:

```typescript
const user = await usersCollection.findDocument({ email: 'mario@bros.com' }, ['firstName', 'lastName'])
// user => { firstName: 'mario', lastName: 'bros', id: '1234-1234-1234-1234' }

// Find documents
const users = await usersCollection.findDocuments({ filters: { email: 'mario@bros.com' } }, ['firstName', 'lastName'])
// users => { data: [ { firstName: 'mario', lastName: 'bros', id: '1234-1234-1234-1234' } ] }
```

-   `findPaginatedDocuments` this one can be used to retrieve an array of documents by specific filters and paginator.
    Also in this method you can pass in a second argument, which is optional, that allows you to populate the models with the specified keys

```typescript
interface IFindPaginatedDocumentsInput<T> extends IFindDocumentsInput<T> {
	paginator?: Partial<IPaginatorInput>
}

findPaginatedDocuments(filters?: IFindPaginatedDocumentsInput<T>, fieldsToPopulate?: string[] ): Promise<IPaginatedDocumentsResponse<T>>
```

Example:

```typescript
const users = await usersCollection.findPaginatedDocument(
    { filters: { email: 'mario@bros.com' }, paginator: { from: 0, size: 2 } },
    ['firstName', 'lastName']
)

// users => { data: [ { firstName: 'mario', lastName: 'bros', id: '1234-1234-1234-1234' } ], paginator: { total: 1, from: 0, size: 2 } }
```

## Collections and AbstractCollection