'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiFetch from '@/lib/api';
import NextImage from 'next/image'; // Используем Next.js Image

type FormValues = {
  prompt: string;
};

export default function ImageGenPage() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setImages([]);
    try {
      const payload = {
        prompt: data.prompt,
        steps: 25,
      };
      const response = await apiFetch('/api/image/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setImages(response.images); // Ожидаем base64 строки
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Image Generation</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="mb-2 block text-sm font-medium">
            Prompt
          </label>
          <textarea
            id="prompt"
            {...register('prompt', { required: true })}
            rows={4}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="A stunning portrait of a robot..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-center font-medium text-primaryForeground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && (
        <p className="rounded bg-red-900 p-3 text-center text-red-100">
          {error}
        </p>
      )}

      {isSubmitting && <p>Generating image, this may take a minute...</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((imgBase64, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg border border-neutral-800">
              <NextImage
                src={`data:image/png;base64,${imgBase64}`}
                alt={`Generated image ${idx + 1}`}
                width={1024}
                height={1024}
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}