// components/NavBar.js
'use client'
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';

export default function NavBar() {
  const { isLoaded } = useAuth();
  //const router = useRouter();
  //const path = window.location.pathname;
  //const {fetchUser} = useUserStore();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <nav className={`px-4 py-3 shadow-md w-full fixed top-0 bg-slate-800 z-10`}>
    <div className="flex justify-between items-center px-12">
      <div 
        className="text-2xl cursor-pointer font-bold text-transparent bg-clip-text animate-color-gradient"
      >
        CompileBox
      </div>

      <div className="flex items-center space-x-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-5 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center">
            <UserButton /> 
          </div>
        </SignedIn>
      </div>
    </div>
  </nav>
  );
}
