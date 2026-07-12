import { useEffect, useState } from 'react'

interface Props {
  currentImage?: string | null
  onChange(file: File | null): void
}

export default function ImageUploader({
  currentImage,
  onChange,
}: Props) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (currentImage) setPreview(currentImage)
  }, [currentImage])

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Maximum image size is 5MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  return (
    <div className="space-y-3">
      <label className="label">
        Product Image
      </label>

      <div className="border-2 border-dashed rounded-xl p-5 text-center">

        {preview ? (
          <img
            src={preview}
            alt=""
            className="mx-auto h-56 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="py-10 text-gray-400">
            No image selected
          </div>
        )}

        <input
          className="hidden"
          id="product-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            if (!e.target.files?.length) return

            handleFile(e.target.files[0])
          }}
        />

        <label
          htmlFor="product-image"
          className="btn-outline mt-4 inline-flex cursor-pointer"
        >
          Choose Image
        </label>

      </div>

      <p className="text-xs text-gray-500">
        PNG, JPG or WEBP • Maximum 5MB
      </p>
    </div>
  )
}