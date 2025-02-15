import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Acara {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string[];
}

export default function UpdateAcara() {
  const { id } = useParams();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [apiImages, setApiImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm<Acara>();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(import.meta.env.VITE_BASE_URL + `/api/event/${id}`);
        const data = await response.json();

        if (data.data) {
          setValue('title', data.data.title);
          setValue('description', data.data.description);
          setValue('location', data.data.location);
          setValue('date', data.data.date);

          let parsedImages = [];
          try {
            parsedImages = JSON.parse(data.data.image);
          } catch {
            parsedImages = Array.isArray(data.data.image) ? data.data.image : [];
          }

          // Store API images separately
          setApiImages(parsedImages.map((image: string) => (image.startsWith('http') ? image : import.meta.env.VITE_BASE_URL + image)));
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to fetch event data');
      }
    }

    fetchData();
  }, [id, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);

      if (imageFiles.length + validFiles.length > 2) {
        toast.error('Maksimal 2 gambar dengan ukuran file maksimal 5MB.');
        return;
      }

      if (imagePreview.length === 0) {
        setApiImages([]);
      }

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      setImageFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setImagePreview((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImagePreview((prevPreview) => {
      URL.revokeObjectURL(prevPreview[index]);
      return prevPreview.filter((_, i) => i !== index);
    });
  };

  const onSubmit: SubmitHandler<Acara> = async (data) => {
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('date', data.date);

      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('image', file);
        });
      } else {
        apiImages.forEach((image) => {
          formData.append('image', image);
        });
      }
      
      const response = await fetch(import.meta.env.VITE_BASE_URL + `/api/event/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal Update data');
      }

      const result = await response.json();
      toast.success('Data berhasil diperbarui');

      if (result) {
        window.location.href = '/admin/acara';
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal Update data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 mt-6">
      <p className="font-bold text-xl">Update Data Acara</p>
      <div className="mt-4 w-full">
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="max-w-7xl w-[60rem] flex justify-between gap-4 max-md:flex col">
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="title">Title</label>
                <Input id="title" placeholder="Masukan title acara" className="w-full" {...register('title', { required: true })} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="description">Description</label>
                <Textarea id="description" placeholder="Masukan deskripsi" className="w-full" {...register('description', { required: true })} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="location">Location</label>
                <Input id="location" placeholder="Masukan lokasi" className="w-full" {...register('location', { required: true })} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="date">Tanggal</label>
                <Input id="date" {...register('date')} type="date" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="images">Gambar (max 2)</label>
                <Input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={imageFiles.length >= 2} />
                <div className="flex gap-2 flex-wrap">
                  {imageFiles.length === 0 &&
                    apiImages.map((image, index) => (
                      <div key={`api-${index}`} className="relative">
                        <img src={image} alt={`API Image ${index}`} className="h-20 w-20 object-cover rounded" />
                      </div>
                    ))}

                  {/* Show new image previews */}
                  {imagePreview.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img src={preview} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded" />
                      <span className="absolute top-0 right-0 text-sm bg-red-500 cursor-pointer hover:bg-red-600 rounded-full text-white px-2 py-0.5" onClick={() => handleRemoveImage(index)}>
                        X
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-medium text-sm">{imageFiles.length}/2 Gambar baru</p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4 mb-10" type="submit" disabled={isLoading}>
            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Update Data'}
          </Button>
        </form>
      </div>
    </div>
  );
}
