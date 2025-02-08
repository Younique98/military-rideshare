export const handleImageUpload = async ( file: File ) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // TODO: (ET and a way to upload to your API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.url;
  } catch (error) {
    throw error;
  }
};