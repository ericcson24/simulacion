import { MongoClient, ObjectId } from 'mongodb';
import { UserModel, ItemModel } from './type.ts';

// Configuración de conexión
const url = Deno.env.get("MONGO_URL");
if (!url) {
  console.log("No existe url");
  Deno.exit(1);
}
const client = new MongoClient(url);

// Conexión a la base de datos y colecciones
await client.connect();
console.log('Connected successfully to server');

const db = client.db("base_de_Datos");
const usercollection = db.collection<UserModel>('users');
const itemcollection = db.collection<ItemModel>('items');

// Función principal de la API
const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    const id = path.split("/")[2]; // ID en caso de que sea necesario

    // -------------------------------------------------------------------------------
    // Operaciones para la colección de usuarios (users)
    if (path.startsWith("/users")) {

        // Obtener todos los usuarios o un usuario específico
        if (method === "GET") {
            if (!id) {
                // Obtener todos los usuarios
                const users = await usercollection.find().toArray();
                const transformedUsers = users.map(user => ({
                    id: user._id.toString(),
                    name: user.name,
                    age: user.age,
                }));
                return new Response(JSON.stringify(transformedUsers), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                // Obtener un usuario específico
                const user = await usercollection.findOne({ _id: new ObjectId(id) });
                if (user) {
                    return new Response(JSON.stringify({
                        id: user._id.toString(),
                        name: user.name,
                        age: user.age,
                    }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    });
                } else {
                    return new Response("User not found", { status: 404 });
                }
            }
        }

        // Crear un nuevo usuario (POST)
        else if (method === "POST") {
            const body = await req.json();
            const existingUser = await usercollection.findOne({ name: body.name, age: body.age });
            if (existingUser) {
                return new Response("Usuario ya existe en la base de datos", { status: 409 });
            }
            const { insertedId } = await usercollection.insertOne({
                name: body.name,
                age: body.age,
            });
            return new Response("Usuario con id: " + insertedId, { status: 201 });
        }

        // Actualizar un usuario existente (PUT)
        else if (method === "PUT" && id) {
            const body = await req.json();
            const result = await usercollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: body }
            );
            return result.matchedCount > 0 
                ? new Response("Usuario actualizado", { status: 200 })
                : new Response("Usuario no encontrado", { status: 404 });
        }

        // Eliminar un usuario (DELETE)
        else if (method === "DELETE" && id) {
            const result = await usercollection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0 
                ? new Response("Usuario eliminado", { status: 200 })
                : new Response("Usuario no encontrado", { status: 404 });
        }
    }

    // -------------------------------------------------------------------------------
    // Operaciones para la colección de items (items)
    else if (path.startsWith("/items")) {

        // Obtener todos los items o un item específico
        if (method === "GET") {
            if (!id) {
                // Obtener todos los items
                const items = await itemcollection.find().toArray();
                const transformedItems = items.map(item => ({
                    id: item._id.toString(),
                    name: item.name,
                    description: item.description,
                    price: item.price,
                }));
                return new Response(JSON.stringify(transformedItems), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                // Obtener un item específico
                const item = await itemcollection.findOne({ _id: new ObjectId(id) });
                if (item) {
                    return new Response(JSON.stringify({
                        id: item._id.toString(),
                        name: item.name,
                        description: item.description,
                        price: item.price,
                    }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    });
                } else {
                    return new Response("Item not found", { status: 404 });
                }
            }
        }

        // Crear un nuevo item (POST)
        else if (method === "POST") {
            const body = await req.json();
            const existingItem = await itemcollection.findOne({ name: body.name });
            if (existingItem) {
                return new Response("Item ya existe en la base de datos", { status: 409 });
            }
            const { insertedId } = await itemcollection.insertOne({
                name: body.name,
                description: body.description,
                price: body.price,
            });
            return new Response("Item con id: " + insertedId, { status: 201 });
        }

        // Actualizar un item existente (PUT)
        else if (method === "PUT" && id) {
            const body = await req.json();
            const result = await itemcollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: body }
            );
            return result.matchedCount > 0 
                ? new Response("Item actualizado", { status: 200 })
                : new Response("Item no encontrado", { status: 404 });
        }

        // Eliminar un item (DELETE)
        else if (method === "DELETE" && id) {
            const result = await itemcollection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0 
                ? new Response("Item eliminado", { status: 200 })
                : new Response("Item no encontrado", { status: 404 });
        }
    }

    // En caso de que el endpoint no coincida con ninguno
    return new Response("Endpoint not found", { status: 400 });
};

// Inicia el servidor en el puerto 3000
Deno.serve({ port: 3000 }, handler);
