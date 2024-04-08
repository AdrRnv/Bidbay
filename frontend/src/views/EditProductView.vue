<script setup>
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

const productName = ref('')
const productDescription = ref('')
const productPictureUrl = ref('')
const productCategory = ref('')
const productOriginalPrice = ref('')
const productEndDate = ref('')

const loading = ref(false);
const error = ref(false);

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}
const productId = ref(route.params.productId);

async function editProduct(){
  loading.value = true
  try{
    let response = await fetch('http://localhost:3000/api/products/' + productId.value, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        name: productName.value,
        description: productDescription.value,
        pictureUrl: productPictureUrl.value,
        category: productCategory.value,
        originalPrice: productOriginalPrice.value,
        endDate: productEndDate.value
      })
    })
    if(response.ok) {
      let product = await response.json()
      router.push({ name: "Product", params: { productId: product.id } })
    } else{
      error.value = true
    }

  } catch(e){
    error.value = true
  } finally{
    loading.value = false
  }
}

async function fetchProduct(){
  loading.value = true
  try{
    let response = await fetch('http://localhost:3000/api/products/' + productId.value, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
    })

    if(response.ok) {
      const fetchedProduct = await response.json();
      productName.value = fetchedProduct.name
      productDescription.value = fetchedProduct.description
      productCategory.value = fetchedProduct.category
      productOriginalPrice.value = fetchedProduct.originalPrice
      productPictureUrl.value = fetchedProduct.pictureUrl
      let date = new Date(fetchedProduct.endDate).toISOString().split('T')[0]
      productEndDate.value = date.replaceAll("/", "-")
    } else{
      error.value = true
    }
  } catch(e){
    error.value = true
  } finally{
    loading.value = false
  }
}
fetchProduct()

</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="editProduct()">
        <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
          Une erreur est survenue
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
              type="text"
              class="form-control"
              id="product-name"
              required
              v-model=productName
              data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
              class="form-control"
              id="product-description"
              name="description"
              v-model="productDescription"
              rows="3"
              required
              data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
              type="text"
              class="form-control"
              id="product-category"
              v-model="productDescription"
              required
              data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
                type="number"
                class="form-control"
                id="product-original-price"
                name="originalPrice"
                v-model="productOriginalPrice"
                step="1"
                min="0"
                required
                data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
              type="url"
              class="form-control"
              id="product-picture-url"
              v-model="productPictureUrl"
              name="pictureUrl"
              required
              data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
              type="date"
              class="form-control"
              id="product-end-date"
              v-model="productEndDate"
              name="endDate"
              required
              data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button
              type="submit"
              class="btn btn-primary"
              data-test-submit
          >
            Modifier le produit
            <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                data-test-spinner
                v-if="loading"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>