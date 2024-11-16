import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/cosmosClient'; // Adjust the import path based on your project structure

export async function POST(request: NextRequest) {
  try {
    const { id, name, email } = await request.json();
    console.log('byee');
    // Check if the user already exists
    const { resource: existingUser } = await container.item(id, id).read();

    if (existingUser) {
      // If user already exists, return the existing user data
      return NextResponse.json({ message: "User already exists", user: existingUser }, { status: 200 });
    }

    // If user does not exist, create a new user document
    const newUser = { id, name, email };
    const { resource: createdUser } = await container.items.create(newUser);

    return NextResponse.json({ message: "User created successfully", user: createdUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse("Failed to create user", { status: 500 });
  }
}
