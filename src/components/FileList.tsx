import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { useParams } from 'next/navigation';
import axios from 'axios';

type FileItem = {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[]; // Optional to store children if a folder is opened
};

interface FileListProps {
  selectedFile: string | null;
  onSelectFile: (filePath: string | null) => void;
}

const FileList: React.FC<FileListProps> = ({ selectedFile, onSelectFile }) => {
  const { user } = useUserStore();
  const {projectId} = useParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const BASE_DIRECTORY = '/usr/src/app';
  useEffect(() => {
    // Fetch the root directory files on initial load
    fetchFiles(BASE_DIRECTORY);
  }, []);

  // Fetch files for a specific directory
  const fetchFiles = async (directory: string) => {
    try {
      const response = await axios.get<FileItem[]>(
        `http://${projectId}.southindia.azurecontainer.io:3001/api/list-files?path=${encodeURIComponent(directory)}`
      );
      if (directory === BASE_DIRECTORY) {
        setFiles(response.data);
      } else {
        // Set children for the folder
        setFiles(prevFiles => updateFilesWithChildren(prevFiles, directory, response.data));
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const onAddFile = async (directoryPath:string) => {
    const fileName = prompt('Enter the new file name:');
    if (fileName) {
      const filePath = `${directoryPath}/${fileName}`;
      try {
        await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/add-new-file`, { path: filePath });
        // Refresh the file list or handle the UI update as needed
        fetchFiles(BASE_DIRECTORY);
      } catch (error) {
        console.error('Error creating file:', error);
        alert('Could not create file. Please try again.');
      }
    }
  };

  const onAddFolder = async (directoryPath:string) => {
    const folderName = prompt('Enter the new file name:');
    if (folderName) {
      const folderPath = `${directoryPath}/${folderName}`;
      try {
        await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/add-new-folder`, { path: folderPath });
        // Refresh the file list or handle the UI update as needed
        fetchFiles(BASE_DIRECTORY);
      } catch (error) {
        console.error('Error creating file:', error);
        alert('Could not create file. Please try again.');
      }
    }
  };

  // Function to rename a file
  const onRename = async (filePath:string) => {
    const newName = prompt('Enter the new file name:');
    if (newName) {
      const newPath = filePath.substring(0, filePath.lastIndexOf('/')) + `/${newName}`;
      try {
        await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/rename`, { oldPath: filePath, newPath: newPath });
        // Refresh the file list or handle the UI update as needed
        fetchFiles(BASE_DIRECTORY);
        if(selectedFile === filePath) {
          onSelectFile(null);
        }
      } catch (error) {
        console.error('Error renaming file:', error);
        alert('Could not rename file. Please try again.');
      }
    }
  };

  // Function to delete a file
  const onDeleteFile = async (filePath:string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (confirmDelete) {
      try {
        await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/delete-file`, { path: filePath });
        // Refresh the file list or handle the UI update as needed
        fetchFiles(BASE_DIRECTORY);
        if(selectedFile === filePath) {
          onSelectFile(null);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Could not delete file. Please try again.');
      }
    }
  };

  const onDeleteFolder = async (folderPath:string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (confirmDelete) {
      try {
        await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/delete-folder`, { path: folderPath });
        // Refresh the file list or handle the UI update as needed
        fetchFiles(BASE_DIRECTORY);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Could not delete file. Please try again.');
      }
    }
  };

  // Recursive function to update files state with children
  const updateFilesWithChildren = (files: FileItem[], path: string, children: FileItem[]): FileItem[] => {
    return files.map(file => {
      if (file.path === path) {
        return { ...file, children }; // Add children if it's the folder we are expanding
      } else if (file.isDirectory && file.children) {
        return { ...file, children: updateFilesWithChildren(file.children, path, children) }; // Recurse for nested folders
      }
      return file;
    });
  };

  // Toggle folder open/close state and fetch children if opening
  const toggleFolder = (file: FileItem) => {
    if (!file.isDirectory) return;

    const newOpenFolders = new Set(openFolders);
    if (openFolders.has(file.path)) {
      newOpenFolders.delete(file.path);
    } else {
      newOpenFolders.add(file.path);
      if (!file.children) {
        fetchFiles(file.path);
      }
    }
    setOpenFolders(newOpenFolders);
  };

  // Recursive function to render file list with nested structure
  const renderFiles = (files: FileItem[], indentLevel: number = 0) => (
    <ul className="space-y-1 pl-4">
      {files.map(file => (
        <React.Fragment key={file.path}>
          <li
            className='cursor-pointer p-2 my-0 rounded-md hover:bg-slate-800 hover:border-slate-500 hover:border-2 flex justify-between items-center'
            onClick={() => (file.isDirectory ? toggleFolder(file) : onSelectFile(file.path))}
          >
            <span style={{ paddingLeft: `${indentLevel * 20}px` }}>
              {file.isDirectory ? (openFolders.has(file.path) ? '📂' : '📁') : '📄'} {file.name}
            </span>
            {/* Three-dot menu button */}
            <div className='relative'>
              <button
                className='text-gray-400 hover:text-gray-200'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering onClick of li
                  setMenuOpen(menuOpen === file.path ? null : file.path); // Toggle menu visibility
                }}
              >
                •••
              </button>

              {/* Menu options */}
              {menuOpen === file.path && (
                <ul className='absolute right-0 mt-2 w-32 bg-gray-800 text-white shadow-md rounded-md z-10'>
                  {!file.isDirectory && (<li
                    className='p-2 hover:bg-slate-600 cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.path);
                      setMenuOpen(null);
                    }}
                  >
                    Delete
                  </li>)}
                  {file.isDirectory && (<li
                    className='p-2 hover:bg-slate-600 cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(file.path);
                      setMenuOpen(null);
                    }}
                  >
                    Delete
                  </li>)}
                  <li
                    className='p-2 hover:bg-slate-600 cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(file.path);
                      setMenuOpen(null);
                    }}
                  >
                    Rename
                  </li>
                  {file.isDirectory && (
                    <li
                      className='p-2 hover:bg-slate-600 cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFile(file.path);
                        setMenuOpen(null);
                      }}
                    >
                      Add file
                    </li>
                  )}
                  {file.isDirectory && (
                    <li
                      className='p-2 hover:bg-slate-600 cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFolder(file.path);
                        setMenuOpen(null);
                      }}
                    >
                      Add folder
                    </li>
                  )}
                </ul>
              )}
            </div>
          </li>
          {file.isDirectory && openFolders.has(file.path) && file.children && (
            <li>{renderFiles(file.children, indentLevel + 1)}</li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );

  return (
    <div className="bg-slate-950 p-4 rounded-lg shadow-lg h-full overflow-y-scroll custom-scrollbar">
      <div className='flex flex-row justify-between items-center mb-2'>
        <h3 className="text-xl font-semibold">📂 Base Directory</h3>
        <div className='relative'>
          <button
            className='text-gray-400 hover:text-gray-200'
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering onClick of li
              setMenuOpen(menuOpen === BASE_DIRECTORY ? null : BASE_DIRECTORY); // Toggle menu visibility
            }}
          >
            •••
          </button>
          {/* Menu options */}
          {menuOpen === BASE_DIRECTORY && (
            <ul className='absolute right-0 mt-2 w-32 bg-gray-800 text-white shadow-md rounded-md'>
              <li
                className='p-2 hover:bg-gray-700 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  onAddFile(BASE_DIRECTORY);
                  setMenuOpen(null);
                }}
              >
                Add file
              </li>
              <li
                className='p-2 hover:bg-gray-700 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  onAddFolder(BASE_DIRECTORY);
                  setMenuOpen(null);
                }}
              >
                Add folder
              </li>
            </ul>
          )}
        </div>
      </div>
      <hr className='m-0 mb-2 p-0' />
      {renderFiles(files)}
    </div>
  );
};

export default FileList;
