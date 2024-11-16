import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/cosmosClient';

type Project = {
  name: string;
  technology: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, technology, createdAt } = await req.json();
    
    // Fetch the user from CosmosDB
    const { resource: user } = await container.item(id, id).read();

    // Check if a project with the same name already exists
    const existingProject = user?.projects?.find((p:Project) => p.name === name);
    if (existingProject) {
      return NextResponse.json(
        { message: 'Project with the same name already exists' },
        { status: 409 } // Conflict status code
      );
    }

    // Create a new project object with current timestamp
    const newProject = {
      name,
      technology,
      createdAt,
    };

    // Add the new project to the user's project list
    const updatedProjects = [...(user.projects || []), newProject];
    user.projects = updatedProjects;

    // Update the user document in CosmosDB
    await container.item(id, id).replace(user);

    return NextResponse.json(
      { message: 'Project added successfully', projects: updatedProjects },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { message: 'Failed to add project' },
      { status: 400 }
    );
  }
}
