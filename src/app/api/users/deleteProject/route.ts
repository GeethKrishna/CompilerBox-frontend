import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/cosmosClient';

type Project = {
    name: string;
    technology: string;
    createdAt: string;
  }

export async function POST(req: NextRequest) {
  try {
    const { userId, projectName } = await req.json();

    // Fetch and update the user (same as before)
    const { resource: user } = await container.item(userId, userId).read();

    if (!user){ 
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const projectIndex = user.projects?.findIndex((p: Project) => p.name === projectName);

    if (projectIndex === -1 || projectIndex === undefined) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Call the file deletion API
    const fileDeletionResponse = await fetch(`https://newhelperfunction.azurewebsites.net/api/removefiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectName }),
    });

    if (!fileDeletionResponse.ok) {
      console.error('File deletion failed:', await fileDeletionResponse.text());
      return NextResponse.json({ message: 'Failed to delete project files' }, { status: 500 });
    }

    user.projects.splice(projectIndex, 1);
    await container.item(userId, userId).replace(user);
    
    return NextResponse.json({ message: 'Project and files deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Failed to delete project' }, { status: 400 });
  }
}
