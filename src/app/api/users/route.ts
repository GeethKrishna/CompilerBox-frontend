import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/cosmosClient';  // Adjust the import path based on your file structure

// GET request to fetch user details by ID
export async function GET(request: NextRequest) {
  // Retrieve userId from the query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  try {
    // Query the container to fetch user details
    const { resource: user } = await container.item(userId, userId).read();

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to fetch user", { status: 500 });
  }
}

// POST request to store new user details
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const user = await request.json();

    if (!user.id || !user.name) {
      return new NextResponse("User 'id' and 'name' are required fields", { status: 400 });
    }

    // Add new user to the Cosmos DB container
    const { resource: createdUser } = await container.items.create(user);

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to create user", { status: 500 });
  }
}
