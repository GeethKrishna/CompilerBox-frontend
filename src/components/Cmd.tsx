'use client'
import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import io, { Socket } from 'socket.io-client';

const Cmd = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const {projectId} = useParams();

  useEffect(() => {

    if (!terminalRef.current) {
      console.error('Terminal container is not available.');
      return;
    }

    // Initialize Xterm.js terminal
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      theme: {
        background: '#1e1e1e', // Dark background
        foreground: '#dcdcdc', // Light text
        cursor: 'lightgreen',  // Cursor color
      },
    });
    terminal.open(terminalRef.current);
    termRef.current = terminal;

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Connect to the socket.io backend
    const socket = io(`http://${projectId}.southindia.azurecontainer.io:3001`, { reconnection: true });
    socketRef.current = socket;

    // When receiving output from the backend, print it in the terminal
    socket.on('output', (data) => {
      terminal.write(data);
    });

    // Send input to the backend when typing in the terminal
    terminal.onData((input) => {
      socket.emit('input', input);
    });

    // Handle terminal resize
    terminal.onResize(({ cols, rows }) => {
      socket.emit('resize', cols, rows);
    });

    fitAddon.fit();

    return () => {
      // Clean up when component unmounts
      terminal.dispose();
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center justify-center mt-2 bg-slate-950 rounded-lg p-4" style={{height: '28vh'}}>
      <div
        ref={terminalRef}
        className="w-full max-w-3xl bg-black border-2 border-gray-700 shadow-lg"
        style={{height: '25vh'}}
      ></div>
    </div>
  );
};

export default Cmd;