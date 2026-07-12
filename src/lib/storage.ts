import { supabase } from './supabase'

const BUCKET = 'product-images'

export async function uploadProductImage(
  file: File,
  sellerId: string
) {
  const extension = file.name.split('.').pop()

  const filename =
    `${sellerId}/${crypto.randomUUID()}.${extension}`

  const { error } =
    await supabase.storage
      .from(BUCKET)
      .upload(filename, file)

  if (error) throw error

  const { data } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename)

  return {
    imageUrl: data.publicUrl,
    imagePath: filename,
  }
}

export async function deleteProductImage(path: string) {
  if (!path) return

  await supabase.storage
    .from(BUCKET)
    .remove([path])
}