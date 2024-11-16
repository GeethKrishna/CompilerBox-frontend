'use client'
import { SignInButton, SignedOut, SignedIn, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { Typewriter } from 'react-simple-typewriter'
import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react'

const CLOUD_ICON = require('./assets/wired-gradient-1331-repository-in-reveal.json');
const CMD_ICON = require('./assets/wired-gradient-1326-command-window-line-morph-code.json');
const DEV_ICON = require('./assets/wired-gradient-680-it-developer-hover-pinch.json');

export default function Page() {
  const { isLoaded } = useAuth();
  const router = useRouter();
  const cloud_playerRef = useRef<Player>(null);
  const cmd_playerRef = useRef<Player>(null);
  const dev_playerRef = useRef<Player>(null);

  const handleMouseEnter = (ref : React.RefObject<Player>) => {
    if (ref.current) {
      ref.current.playFromBeginning();
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  useEffect(() => {
    if(cloud_playerRef.current) cloud_playerRef.current.playFromBeginning();
    if(cmd_playerRef.current) cmd_playerRef.current.playFromBeginning();
    if(dev_playerRef.current) dev_playerRef.current.playFromBeginning();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="text-center">
          <p className="text-5xl font-bold mb-4 ml-52 text-left">
            Welcome to
            <span className="text-5xl ml-3 cursor-pointer font-bold text-transparent bg-clip-text animate-color-gradient">
              <Typewriter
                words={['CompileBox']}
                loop={true}
                cursor
                cursorStyle="_"
                typeSpeed={120}
                deleteSpeed={120}
                delaySpeed={2500}
              />
            </span>
          </p>

          <p className="text-sm mb-8 text-gray-300">
            A cloud based online coding platform for developers to code, develop, and execute in real-time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center text-center">
              <div onMouseEnter={() => handleMouseEnter(cmd_playerRef)}>
                <Player ref={cmd_playerRef} size={82} icon={CMD_ICON} />
              </div>
              <p className="text-md font-semibold">Real-Time Execution</p>
              <p className="text-gray-400 text-xs">Run your code instantly and see results in real time.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div onMouseEnter={() => handleMouseEnter(dev_playerRef)}>
                <Player ref={dev_playerRef} size={82} icon={DEV_ICON} />
              </div>
              <p className="font-semibold text-md">Easy to use</p>
              <p className="text-gray-400 text-xs">Similar interface to your local IDE's.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div onMouseEnter={() => handleMouseEnter(cloud_playerRef)}>
                <Player ref={cloud_playerRef} size={82} icon={CLOUD_ICON} />
              </div>
              <p className="font-semibold text-md">Secure Environment</p>
              <p className="text-gray-400 text-xs">Keep your projects safe with our secure cloud environment.</p>
            </div>
          </div>

          <SignedOut>
              <SignInButton mode="modal">
                <button 
                  className="text-white  bg-gradient-to-br mr-3 from-purple-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-md px-5 py-2 text-center mb-8"
                >
                  Sign In
                </button>
              </SignInButton>
            <button 
              onClick={() => router.push('/learn-more')}
              type="button" 
              className="text-white bg-gradient-to-br from-purple-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-md px-5 py-2 text-center mb-8"
            >
              Learn More
            </button>
          </SignedOut>

          <SignedIn>
            <button 
              onClick={() => router.push('/home')}
              type="button" 
              className="text-white bg-gradient-to-br mr-3 from-purple-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-md px-5 py-2 text-center mb-8"
            >
              View Projects
            </button>
            <button 
              onClick={() => router.push('/learn-more')}
              type="button" 
              className="text-white bg-gradient-to-br from-purple-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-md px-5 py-2 text-center mb-8"
            >
              Learn More
            </button>
          </SignedIn>
        </div>
      </main>

      <footer className="p-4 text-sm text-center relative z-10 text-gray-400">
        <p>© 2024 CompileBox. <a href="https://lordicon.com/">Icons by Lordicon.com</a></p>
      </footer>
    </div>
  );
}
