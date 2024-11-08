// types.ts
import type { ObjectId, OptionalId } from "mongodb";

// Definición del tipo para la colección de usuarios
export type UserModel = OptionalId<{
    _id: ObjectId;
    name: string;
    age: number;
}>;

// Definición del tipo para la colección de items
export type ItemModel = OptionalId<{
    _id: ObjectId;
    name: string;
    description: string;
    price: number;
}>;
