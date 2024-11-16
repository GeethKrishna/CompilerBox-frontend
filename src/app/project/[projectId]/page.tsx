'use client'
import React, { useEffect, useState } from 'react';
import Cmd from "@/components/Cmd";
import NavBar from '@/components/NavBar';
import FileEditor from "@/components/FileEditor";
import FileList from "@/components/FileList";
import { useUserStore } from '@/stores/useUserStore';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function Project() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { setSelectedProject } = useUserStore();
  const [loading, setLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();

  // Effect for data fetching with backoff
  useEffect(() => {
    let attempts = 0;
    const maxRetries = 50;
    const retryDelay = 15000;

    const fetchData = async () => {
      try {
        await axios.get(`http://${projectId}.southindia.azurecontainer.io:3001/api/health-check`, { timeout: 10000 });
        setLoading(false);
      } catch (error) {
        console.error("Error loading data", error);
        if (attempts < maxRetries) {
          attempts += 1;
          setTimeout(fetchData, retryDelay);
        } else {
          console.error("Failed to load data after multiple attempts");
          setLoading(false);
        }
      }
    };

    fetchData();
    setSelectedProject(projectId);
  }, [projectId, setSelectedProject]); // Separate dependencies specific to data fetching

  const handleSelectFile = (filePath: string | null) => {
    setSelectedFile(filePath);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white text-2xl">
        <div className="flex items-center space-x-3">
          <div className="loader w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900">
      <NavBar/>
      <div className="flex mt-14" style={{height: '92vh'}}>
        <div className="w-1/5 p-4 border-r border-gray-400">
          <FileList selectedFile={selectedFile} onSelectFile={handleSelectFile} />
        </div>
        <div className='flex flex-col w-4/5 p-4'>
          {
            selectedFile ? (
              <div>
                <FileEditor filePath={selectedFile} />
                <Cmd />
              </div>
            )
            :
            <p className="text-gray-300 text-xl text-center mt-10">Select a file to view its content</p>
          }
        </div>
      </div>
    </div>
  );
}
