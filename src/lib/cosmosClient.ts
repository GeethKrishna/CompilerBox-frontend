import { CosmosClient, Database, Container } from "@azure/cosmos";

// Initialize CosmosClient with types
const client: CosmosClient = new CosmosClient({
  endpoint: process.env.COSMOSDB_URI as string,
  key: process.env.COSMOSDB_PRIMARY_KEY as string,
});

// Define database and container with appropriate types
const database: Database = client.database(process.env.COSMOSDB_DATABASE_NAME as string);
const container: Container = database.container(process.env.COSMOSDB_CONTAINER_NAME as string);

// Log connection attempt and status
try {
  container.items.readAll().fetchAll().then(() => {
    console.log("Successfully fetched items from the container.");
  }).catch((err) => {
    console.error("Error fetching items from container:", err);
  });

} catch (error) {
  console.error("Error connecting to Cosmos DB:", error);
}

// Export at the top level
export { client, database, container };
