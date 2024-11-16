import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/stores/useUserStore';
interface FileEditorProps {
  filePath: string;
}

const FileEditor: React.FC<FileEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  //const {user, selectedProject: projectId} = useUserStore();
  const {user} = useUserStore();
  const {projectId} = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [dots, setDots] = useState('..');

  useEffect(() => {
    if (isSaving) {
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length < 5 ? prevDots + '.' : '..'));
      }, 500); // Adjust the speed as needed
      return () => clearInterval(interval);
    }
  }, [isSaving]);

  useEffect(() => {
    if (filePath) {
      axios.get(`http://${projectId}.southindia.azurecontainer.io:3001/api/file-content?path=${filePath}`)
        .then(response => setContent(response.data.content))
        .catch(error => console.error("Error fetching file content:", error));
    }
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
  };

  const extractLanguage = () => {
    const extension = filePath.split('.').pop();
    if (extension === 'js' || extension === 'jsx') {
      return 'javascript';
    } else if (extension === 'css') {
      return 'css';
    } else if (extension === 'html') {
      return 'html';
    } else if(extension === 'json') {
      return 'json';
    } else if(extension === 'txt') {
      return 'text';
    }
  }

  const saveFile = async () => {
    setStatus('Saving file...');
    setIsSaving(true);
    try {
      await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/update-file`, { path: filePath, content });
      setStatus('File saved successfully!')
    } catch (error) {
      setStatus('Error saving file.')
    }
    setIsSaving(false);
  };

  const saveFileToAzure = async () => {
    setIsSaving(true);
    setStatus('Saving file to azure...');
    try {
      await axios.post(`http://${projectId}.southindia.azurecontainer.io:3001/api/save-project`, { userId: user?.id, projectId: projectId });
      setStatus('File saved to azure successfully!')
    } catch (error) {
      setStatus('Error saving to azure.')
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col bg-slate-950 rounded-lg">
      <div className='flex flex-row justify-between items-center p-3 '>
        <h3 className="text-lg">Editing the file: {filePath.slice(13)} </h3>
        <div className='flex flex-row gap-4 items-center'>
          {status && (
            <p className="mx-2 text-md text-green-600">
              {isSaving ? `${status}${dots}` : status}
            </p>
          )}
          <button
            onClick={saveFile}
            disabled={isSaving}
            className={`self-start text-sm bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Save file
          </button>
          <button
            onClick={saveFileToAzure}
            disabled={isSaving}
            className={`self-start text-sm bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Save to cloud
          </button>
        </div>
      </div>
      <div className="flex-1 mx-4 mb-4">
        <MonacoEditor
          height="330px"
          language={extractLanguage()}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark" // Set the theme to a darker style
          options={{ fontSize: 12 }}
          className="shadow-lg border-gray-700 border-2"
        />
      </div>
    </div>
  );
}

export default FileEditor;