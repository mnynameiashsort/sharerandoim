import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AddPostForm() {
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.create);
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting) return;

    try {
      setIsSubmitting(true);
      // Get the upload URL
      const postUrl = await generateUploadUrl();

      // Upload the image
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": image.type },
        body: image,
      });
      
      if (!result.ok) {
        throw new Error("Failed to upload image");
      }
      
      const { storageId } = await result.json();

      // Create the post
      await createPost({
        imageId: storageId,
        caption,
        tags: tags
          .split(/[\s,]+/) // Split by spaces or commas
          .filter(Boolean)
          .map(tag => tag.startsWith("#") ? tag.slice(1) : tag),
      });

      toast.success("Post created!");
      setIsOpen(false);
      setImage(null);
      setCaption("");
      setTags("");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        + New Post
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Post</h2>
          <button
            onClick={() => !isSubmitting && setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > 8 * 1024 * 1024) {
                  toast.error("Image must be smaller than 8MB");
                  e.target.value = "";
                  return;
                }
                setImage(file ?? null);
              }}
              className="mt-1 block w-full"
              required
              disabled={isSubmitting}
            />
            {image && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-48 rounded object-contain"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
              disabled={isSubmitting}
              maxLength={1000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (separate with spaces or commas)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nature, travel, photography"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!image || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">↻</span>
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
