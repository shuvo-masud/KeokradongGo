import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { supabase, District, Profile } from '../../lib/supabase'
import { uploadProductImage } from '../../lib/storage'
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

const PRODUCT_IMAGES: Record<string, string> = {
  Fruits:
    'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg',
  Textiles:
    'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg',
  Fish:
    'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg',
  Tea:
    'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg',
  Handicraft:
    'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
  Spices:
    'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg',
  Other:
    'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg',
}


export default function AddProductView() {

  const { profile } = useAuth()

  const [districts, setDistricts] =
    useState<District[]>([])

  const [agents, setAgents] =
    useState<Profile[]>([])


  const [imageFile, setImageFile] =
    useState<File | null>(null)


  const [saving, setSaving] =
    useState(false)


  const [success, setSuccess] =
    useState(false)


  const [error, setError] =
    useState<string | null>(null)


  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Fruits',
    districtId: '',
    stock: '1',
  })


  useEffect(() => {

    async function loadDistricts() {

      const { data } =
        await supabase
          .from('districts')
          .select('*')
          .order('name')


      setDistricts(data ?? [])

    }


    loadDistricts()

  }, [])



  useEffect(() => {

    async function loadAgents() {

      if (!form.districtId) {
        setAgents([])
        return
      }


      const { data } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'agent')
          .eq('district_id', form.districtId)
          .eq('status', 'active')


      setAgents(data ?? [])

    }


    loadAgents()

  }, [form.districtId])
    async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (!profile) return


    setSaving(true)
    setError(null)


    let uploadedImagePath = ''
    

    try {

      let imageUrl =
        PRODUCT_IMAGES[form.category]


      let imagePath: string | null = null



      /*
        Upload image if seller selected one
      */
      if (imageFile) {

        const uploaded =
          await uploadProductImage(
            imageFile,
            profile.id
          )


        imageUrl = uploaded.imageUrl
        imagePath = uploaded.imagePath

        uploadedImagePath = uploaded.imagePath
      }



      const assignedAgent =
        agents.length > 0
          ? agents[0].id
          : null



      const { error: insertError } =
        await supabase
          .from('products')
          .insert({

            seller_id: profile.id,

            title:
              form.title.trim(),

            description:
              form.description.trim(),

            price:
              Number(form.price),

            category:
              form.category,

            district_id:
              form.districtId,

            stock:
              Number(form.stock),

            image_url:
              imageUrl,

            image_path:
              imagePath,

            assigned_agent_id:
              assignedAgent,

            verification_status:
              'pending',

          })



      if (insertError) {

        throw insertError

      }



      /*
        Notify district agent
      */
      if (assignedAgent) {

        await supabase
          .from('notifications')
          .insert({

            user_id:
              assignedAgent,

            type:
              'verification',

            title:
              'New product verification',

            body:
              `"${form.title}" needs verification.`

          })

      }



      setSuccess(true)



      setForm({

        title: '',

        description: '',

        price: '',

        category: 'Fruits',

        districtId: '',

        stock: '1',

      })


      setImageFile(null)



    } catch (err: any) {


      /*
        If upload succeeded but database failed,
        remove unused image
      */

      if (uploadedImagePath) {

        await supabase.storage
          .from('product-images')
          .remove([
            uploadedImagePath
          ])

      }


      setError(
        err.message ||
        'Something went wrong'
      )

    }


   setSaving(false)

}  // close handleSubmit


if (success) {

    return (

      <div className="max-w-xl mx-auto card p-10 text-center">

        <div className="text-5xl mb-4">
          ✅
        </div>


        <h2 className="font-display font-bold text-xl mb-2">
          Product Submitted Successfully
        </h2>


        <p className="text-gray-500 text-sm mb-6">
          Your product is waiting for district agent verification.
        </p>


        <button

          onClick={() =>
            setSuccess(false)
          }

          className="btn-primary"

        >
          Add Another Product

        </button>


      </div>

    )

  }
    return (

    <div className="max-w-2xl mx-auto space-y-6">

      <div>

        <h1 className="font-display font-bold text-2xl">
          Add New Product
        </h1>


        <p className="text-gray-500 text-sm mt-1">
          List an authentic product with district origin
        </p>

      </div>



      <form
        onSubmit={handleSubmit}
        className="card p-6 space-y-5"
      >


        {error && (

          <div className="
            p-3
            rounded-xl
            bg-red-50
            text-red-600
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

            required

            placeholder="
              e.g. Rajshahi Mangoes - Himsagar
            "

            value={form.title}

            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value
              })
            }

          />

        </div>




        <div>

          <label className="label">
            Description
          </label>


          <textarea

            className="input min-h-[120px]"

            required

            placeholder="
              Describe quality, origin and authenticity...
            "

            value={form.description}

            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value
              })
            }

          />

        </div>





        <div className="grid grid-cols-2 gap-4">


          <div>

            <label className="label">
              Price (৳)
            </label>


            <input

              type="number"

              min="1"

              step="0.01"

              required

              className="input"

              value={form.price}

              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value
                })
              }

            />

          </div>




          <div>

            <label className="label">
              Stock Quantity
            </label>


            <input

              type="number"

              min="1"

              required

              className="input"

              value={form.stock}

              onChange={(e) =>
                setForm({
                  ...form,
                  stock: e.target.value
                })
              }

            />

          </div>


        </div>





        <div className="grid grid-cols-2 gap-4">


          <div>

            <label className="label">
              Category
            </label>


            <select

              className="input"

              value={form.category}

              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value
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
              District of Origin
            </label>


            <select

              className="input"

              required

              value={form.districtId}

              onChange={(e) =>
                setForm({
                  ...form,
                  districtId: e.target.value
                })
              }

            >

              <option value="">
                Select district
              </option>


              {districts.map(district => (

                <option

                  key={district.id}

                  value={district.id}

                >

                  {district.name}
                  {' — '}
                  {district.division}

                </option>

              ))}


            </select>

          </div>


        </div>





        <ImageUploader

          onChange={setImageFile}

        />





        {form.districtId && (

          <div className="
            p-3
            rounded-xl
            bg-ocean-50
            text-ocean-700
            text-sm
          ">


            {agents.length > 0

              ? `✓ ${agents.length} agent(s) available. Product will be assigned automatically.`

              : 'No active agent found. Product will remain pending.'

            }


          </div>

        )}






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

            ? 'Uploading...'

            : 'Submit Product'

          }


        </button>



      </form>


    </div>

  )

}