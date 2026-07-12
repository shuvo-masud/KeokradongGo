import { useState } from 'react'

import {
  supabase,
  Product,
  District
} from '../../lib/supabase'

import {
  uploadProductImage,
  deleteProductImage
} from '../../lib/storage'

import ImageUploader from './ImageUploader'


const CATEGORIES = [
  'Fruits',
  'Textiles',
  'Fish',
  'Tea',
  'Handicraft',
  'Spices',
  'Other',
]


type EditableProduct =
  Product & {
    district: District
  }



interface Props {

  product: EditableProduct

  districts: District[]

  onClose: () => void

  onSaved: () => void

}



export default function EditProductModal({

  product,

  districts,

  onClose,

  onSaved,

}: Props) {


  const [form, setForm] = useState({

    title:
      product.title,

    description:
      product.description,

    price:
      String(product.price),

    stock:
      String(product.stock),

    category:
      product.category,

    districtId:
      product.district_id,

  })



  const [imageFile, setImageFile] =
    useState<File | null>(null)



  const [saving, setSaving] =
    useState(false)



  const [error, setError] =
    useState<string | null>(null)
      async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault()


    setSaving(true)

    setError(null)


    try {


      let imageUrl =
        product.image_url


      let imagePath =
        product.image_path




      /*
        If new image selected:
        delete old one
        upload new one
      */

      if (imageFile) {


        if (product.image_path) {

          await deleteProductImage(
            product.image_path
          )

        }



        const uploaded =
          await uploadProductImage(
            imageFile,
            product.seller_id
          )


        imageUrl =
          uploaded.imageUrl


        imagePath =
          uploaded.imagePath

      }




      const { error: updateError } =

        await supabase
          .from('products')
          .update({

            title:
              form.title.trim(),

            description:
              form.description.trim(),

            price:
              Number(form.price),

            stock:
              Number(form.stock),

            category:
              form.category,

            district_id:
              form.districtId,


            image_url:
              imageUrl,


            image_path:
              imagePath,

          })
          .eq(
            'id',
            product.id
          )




      if (updateError) {

        throw updateError

      }



      onSaved()



    } catch (err: any) {


      setError(

        err.message ||
        'Update failed'

      )

    }



    setSaving(false)

  }
    return (

    <div

      className="
        fixed
        inset-0
        bg-black/50
        z-50
        flex
        items-center
        justify-center
        p-4
      "

      onClick={onClose}

    >


      <div

        className="
          bg-white
          rounded-2xl
          max-w-xl
          w-full
          max-h-[90vh]
          overflow-y-auto
          p-6
        "

        onClick={(e)=>
          e.stopPropagation()
        }

      >


        <div className="
          flex
          justify-between
          items-center
          mb-5
        ">


          <h2 className="
            font-display
            font-bold
            text-xl
          ">

            Edit Product

          </h2>



          <button

            onClick={onClose}

            className="text-gray-500"

          >

            ✕

          </button>


        </div>
                <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {error && (

            <div className="
              bg-red-50
              text-red-600
              p-3
              rounded-xl
              text-sm
            ">

              {error}

            </div>

          )}




          <div>

            <label className="label">
              Product Title
            </label>

            <input

              className="input"

              value={form.title}

              onChange={(e)=>
                setForm({
                  ...form,
                  title:e.target.value
                })
              }

            />

          </div>




          <div>

            <label className="label">
              Description
            </label>


            <textarea

              className="input min-h-[100px]"

              value={form.description}

              onChange={(e)=>
                setForm({
                  ...form,
                  description:e.target.value
                })
              }

            />

          </div>
                    <div className="
            grid
            grid-cols-2
            gap-4
          ">


            <div>

              <label className="label">
                Price
              </label>


              <input

                type="number"

                className="input"

                value={form.price}

                onChange={(e)=>
                  setForm({
                    ...form,
                    price:e.target.value
                  })
                }

              />

            </div>




            <div>

              <label className="label">
                Stock
              </label>


              <input

                type="number"

                className="input"

                value={form.stock}

                onChange={(e)=>
                  setForm({
                    ...form,
                    stock:e.target.value
                  })
                }

              />

            </div>


          </div>
                    <div className="
            grid
            grid-cols-2
            gap-4
          ">


            <div>

              <label className="label">
                Category
              </label>


              <select

                className="input"

                value={form.category}

                onChange={(e)=>
                  setForm({
                    ...form,
                    category:e.target.value
                  })
                }

              >

                {CATEGORIES.map(category => (

                  <option

                    key={category}

                    value={category}

                  >

                    {category}

                  </option>

                ))}

              </select>

            </div>





            <div>

              <label className="label">
                District
              </label>


              <select

                className="input"

                value={form.districtId}

                onChange={(e)=>
                  setForm({
                    ...form,
                    districtId:e.target.value
                  })
                }

              >


                {districts.map(district => (

                  <option

                    key={district.id}

                    value={district.id}

                  >

                    {district.name}

                  </option>

                ))}


              </select>


            </div>


          </div>
                    <ImageUploader

            currentImage={
              product.image_url
            }

            onChange={
              setImageFile
            }

          />
                    <button

            type="submit"

            disabled={saving}

            className="
              btn-primary
              w-full
              py-3
            "

          >

            {saving
              ? 'Saving...'
              : 'Save Changes'
            }


          </button>


        </form>


      </div>


    </div>

  )

}