'use client';
import React, { useState, useRef } from 'react';
import NavBar from '@/components/NavBar';
import { useUserStore } from '@/stores/useUserStore';
import Image from 'next/image';
import CustomDropdown from '@/components/CustomDropdown';
import {format} from 'date-fns';
import { Player } from '@lordicon/react';

const TRASH_ICON = require('@/app/assets/wired-outline-185-trash-bin-hover-empty (2).json');

const colorClass: Record<string, string> = {
  'node-template' : 'hover:shadow-green-600/60',
  'template' : 'hover:shadow-purple-600/60',
  'vite-template' : 'hover:shadow-blue-600/60',
}

const Home = () => {
  const { user, isLoading, addProject,deleteProject, setSelectedProject } = useUserStore();
  const [newProject, setNewProject] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const playerRefs = useRef<(Player | null)[]>([]);
  //const router = useRouter();

  const handleMouseEnter = (index: number) => { 
    const player = playerRefs.current[index];
    if (player) {
      player.playFromBeginning();
    }
  };

  async function createExistingContainer(project: string) {
    setIsCreating(true);
    const response = await fetch('https://newhelperfunction.azurewebsites.net/api/createContainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        containerName: project,
        imageName: 'node-image', // Image name in ACR
        tag: 'latest', // Optional, default is 'latest'
        technology: 'none',
        userId: user?.id,
      }),
    });
  
    //const data = await response.json();
    if (response.ok) {
      window.open(`/project/${project}`, '_blank');
    } else {
      console.error(`Error creating container.`);
    }
    setIsCreating(false);
  }
  async function createNewContainer(project: string, technology: string) {
    setIsCreating(true);
    const response = await fetch('https://newhelperfunction.azurewebsites.net/api/createContainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        containerName: project,
        imageName: 'node-image', // Image name in ACR
        tag: 'latest', // Optional, default is 'latest'
        technology: technology,
        userId: user?.id,
      }),
    });
  
    //const data = await response.json();
    if (response.ok) {
      window.open(`/project/${project}`, '_blank');
    } else {
      alert(`Error creating container.`);
    }
    setIsCreating(false);
  }

  const handleAddProject = async () => {
    if(newTechnology === ''){
      alert('Please select a technology.');
      return;
    }
    if (newProject.length > 8) {
      try {
        // Wait for addProject to complete
        const addProjectResult = await addProject(newProject, newTechnology);

        if (addProjectResult) {
          // If addProject is successful, call createNewContainer
          await createNewContainer(newProject, newTechnology);

          // Clear the input after successful operations
          setNewProject('');
        } else {
          alert('Failed to add project. Please try again.');
        }
      } catch (error) {
        console.error('Error in adding project or creating container:', error);
      }
    }
    else {
      alert('Please enter a valid project name.');
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    try {
      // Show a confirmation dialog to the user
      const isConfirmed = window.confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`);
  
      if (!isConfirmed) {
        console.log("User canceled project deletion.");
        return; // Exit if the user cancels
      }
  
      // Proceed with the deletion
      const success = await deleteProject(projectName);
  
      if (success) {
        alert("Project deleted successfully!");
      } else {
        alert("Failed to delete the project. Please try again.");
      }
    } catch (error) {
      console.error('Error while deleting project:', error);
      alert("An unexpected error occurred.");
    }
  };
  

  return (
  <div className="w-full flex flex-row justify-evenly h-screen bg-slate-900">
    {isCreating && (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50 text-white text-2xl z-50">
        <div className="flex items-center space-x-3">
          <div className="loader w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    )}

    <NavBar />
    <div className="user-info mt-16 w-1/3 p-8">
      {isLoading ? (
        <p className="text-slate-300">Loading user information...</p>
      ) : user ? (
        <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold">
            Welcome, {user.name}
          </h1>
          <h2 className="text-sm text-slate-300 mb-2">Your existing projects:</h2>
          
          {user.projects && user.projects.length > 0 ? (
            <ul>
              {user.projects.map((currentProject, index) => (
                <li
                  key={currentProject.createdAt}
                > 
                  <div 
                    className={`flex flex-col w-3/4 py-2 px-4 text-md text-slate-100 bg-slate-600 rounded-lg mb-3 
                      cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg hover:brightness-110
                      ${colorClass[currentProject.technology]}`}
                  >
                    <div className="flex flex-row justify-between items-center m-0">
                      <div 
                        className="flex flex-col"
                        onClick={() => {
                          setSelectedProject(currentProject?.name);
                          createExistingContainer(currentProject?.name);
                        }}
                      >
                        <span>{currentProject?.name}</span>
                        <span className="text-xs text-slate-400">{format(new Date(currentProject?.createdAt), "dd-MM-yyyy, h:mm a")}</span>
                      </div>
                      <div className='flex flex-row gap-2'>
                        <Image src={
                          currentProject?.technology === 'node-template' 
                            ? '/nodejs-original.svg'
                            : currentProject?.technology === 'template'
                            ? '/Vitejs-logo.svg'
                            : currentProject?.technology === 'vite-template'
                            ? '/react-original.svg'
                            : ''
                        } height={27} width={27} alt="" />
                        <div
                          className="cursor-pointer pl-1 border-l-2 border-slate-700 "
                          onMouseEnter={() => handleMouseEnter(index)} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(currentProject?.name)
                          }} 
                        >
                          <Player ref={(el) => {playerRefs.current[index] = el}} size={25} icon={TRASH_ICON} />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">You don't have any projects yet.</p>
          )}
        </div>
      ) : (
        <p className="text-slate-400">No user information available.</p>
      )}
    </div>
    <div className="create-project h-fit mt-24 w-1/2 bg-slate-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold">Want to start a new project?</h2>
      <p className="text-slate-300 mb-4 text-sm">Give the project a unique name, it must be at least 8 characters.</p>
      
      <div className="flex flex-col gap-4 items-center">
        {/* Input for project name */}
        <div className='flex flex-row justify-between items-center gap-6 w-full'>
        <input
          type="text"
          placeholder="Project name"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          className="input p-2 w-full text-gray-900 rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
        />

        {/* Dropdown selector */}
        <CustomDropdown onSelect={setNewTechnology} />
        </div>
        <button 
          onClick={handleAddProject} 
          className="w-24 text-white bg-gradient-to-br from-purple-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2 text-center my-2"
        >
          <span className="relative z-10">Create</span>
        </button>
      </div>
    </div>
  </div>
  );
};

export default Home;
