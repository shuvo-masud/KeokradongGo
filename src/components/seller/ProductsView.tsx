import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../lib/auth'
import {
  supabase,
  Product,
  District
} from '../../lib/supabase'

import {
  deleteProductImage
} from '../../lib/storage'

import EditProductModal from './EditProductModal'


type SellerProduct =
  Product & {
    district: District
  }



export default function ProductsView() {

  const { profile } = useAuth()


  const [products, setProducts] =
    useState<SellerProduct[]>([])


  const [districts, setDistricts] =
    useState<District[]>([])


  const [loading, setLoading] =
    useState(true)


  const [editProduct, setEditProduct] =
    useState<SellerProduct | null>(null)



  const loadProducts = useCallback(
    async () => {

      if (!profile) return


      setLoading(true)


      const [
        productsResult,
        districtsResult
      ] =
      await Promise.all([

        supabase
          .from('products')
          .select(`
            *,
            district:districts(*)
          `)
          .eq(
            'seller_id',
            profile.id
          )
          .order(
            'created_at',
            {
              ascending:false
            }
          ),


        supabase
          .from('districts')
          .select('*')
          .order('name')

      ])



      if (productsResult.data) {

        setProducts(
          productsResult.data as SellerProduct[]
        )

      }


      setDistricts(
        districtsResult.data ?? []
      )


      setLoading(false)

    },

    [profile]

  )



  useEffect(() => {

    loadProducts()

  }, [loadProducts])
    async function handleDelete(
    product: SellerProduct
  ) {

    const confirmed =
      window.confirm(
        'Delete this product? This cannot be undone.'
      )


    if (!confirmed) return



    try {

      // Delete image from storage first
      if (product.image_path) {

        await deleteProductImage(
          product.image_path
        )

      }



      const { error } =
        await supabase
          .from('products')
          .delete()
          .eq(
            'id',
            product.id
          )


      if (error) {
        throw error
      }


      loadProducts()


    } catch (err: any) {

      alert(
        err.message ||
        'Failed to delete product'
      )

    }

  }
    function StatusBadge({
    status
  }: {
    status: Product['verification_status']
  }) {

    const styles = {

      verified:
        'bg-green-100 text-green-700',

      pending:
        'bg-yellow-100 text-yellow-700',

      rejected:
        'bg-red-100 text-red-700',

    }



    return (

      <span
        className={`
          text-xs
          px-3
          py-1
          rounded-full
          font-medium
          ${styles[status]}
        `}
      >

        {status}

      </span>

    )

  }
    if (loading) {

    return (

      <div className="card p-10 text-center">

        Loading products...

      </div>

    )

  }



  return (

    <div className="space-y-6">


      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <h1 className="
            font-display
            font-bold
            text-2xl
          ">

            My Products

          </h1>


          <p className="
            text-gray-500
            text-sm
            mt-1
          ">

            Manage your product listings

          </p>

        </div>



        <Link

          to="/dashboard?tab=add"

          className="btn-primary"

        >

          + Add Product

        </Link>


      </div>





      {products.length === 0 ? (

        <div className="
          card
          p-12
          text-center
          text-gray-400
        ">

          <div className="text-4xl mb-3">
            📦
          </div>


          <p>
            No products yet.
          </p>


        </div>


      ) : (



        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-5
        ">


          {products.map(product => (


            <div
              key={product.id}
              className="card overflow-hidden"
            >


              <div className="
                h-48
                bg-gray-100
                relative
              ">


                <img

                  src={
                    product.image_url ||
                    '/placeholder.png'
                  }

                  alt={product.title}

                  className="
                    w-full
                    h-full
                    object-cover
                  "

                />


                <div className="
                  absolute
                  top-3
                  right-3
                ">

                  <StatusBadge

                    status={
                      product.verification_status
                    }

                  />

                </div>


              </div>





              <div className="p-4">


                <h3 className="
                  font-semibold
                  truncate
                ">

                  {product.title}

                </h3>



                <p className="
                  text-xs
                  text-gray-500
                  mt-1
                ">

                  📍 {product.district?.name}

                </p>




                <div className="
                  flex
                  justify-between
                  items-center
                  mt-3
                ">


                  <span className="
                    font-display
                    font-bold
                    text-lg
                    text-primary-700
                  ">

                    ৳
                    {product.price}

                  </span>



                  <span className="
                    text-xs
                    text-gray-400
                  ">

                    {product.stock} available

                  </span>


                </div>




                <div className="
                  flex
                  gap-2
                  mt-4
                ">


                  <button

                    onClick={() =>
                      setEditProduct(product)
                    }

                    className="
                      btn-outline
                      flex-1
                      text-sm
                    "

                  >

                    Edit

                  </button>




                  <button

                    onClick={() =>
                      handleDelete(product)
                    }

                    className="
                      flex-1
                      text-sm
                      rounded-xl
                      bg-red-50
                      text-red-600
                    "

                  >

                    Delete

                  </button>


                </div>


              </div>


            </div>


          ))}


        </div>


      )}





      {editProduct && (

        <EditProductModal

          product={editProduct}

          districts={districts}

          onClose={() =>
            setEditProduct(null)
          }

          onSaved={() => {

            setEditProduct(null)

            loadProducts()

          }}

        />

      )}


    </div>

  )

}