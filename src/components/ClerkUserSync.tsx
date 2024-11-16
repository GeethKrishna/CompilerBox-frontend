'use client'
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

const ClerkUserSync = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // Check if user is signed in and hasn't been checked already
    if (isSignedIn && user && !localStorage.getItem("userSyncDone")) {
      createUserInDatabase(user);
    }
  }, [isSignedIn, user]);

  const createUserInDatabase = async (user: any) => {
    try {
      const response = await fetch("/api/users/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        // Set flag to avoid re-checking
        localStorage.setItem("userSyncDone", "true");
        if (response.status === 200) {
          console.log("User already exists.");
        } else if (response.status === 201) {
          console.log("User created successfully.");
        }
      } else {
        console.error("Failed to sync user data with Cosmos DB");
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  return null;
};

export default ClerkUserSync;
