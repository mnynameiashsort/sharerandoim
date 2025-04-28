import { useConvexAuth } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { PostList } from "./components/PostList";
import { AddPostForm } from "./components/AddPostForm";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin">↻</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Image Sharing Platform</h1>
        {isAuthenticated ? <SignOutButton /> : null}
      </div>

      {isAuthenticated ? (
        <>
          <PostList />
          <AddPostForm />
        </>
      ) : (
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      )}
    </main>
  );
}
