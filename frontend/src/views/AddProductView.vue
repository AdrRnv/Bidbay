<script setup>
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();

const name = ref("");
const description = ref("");
const category = ref("");
const originalPrice = ref(null);
const pictureUrl = ref("");
const endDate = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const errorStatus = ref(false);

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

// router.push({ name: "Product", params: { productId: 'TODO } });

const sendProduct = async () => {
  isSubmitting.value = true;
  console.log("ici");
  try {
    const response = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        name: name.value,
        description: description.value,
        category: category.value,
        originalPrice: originalPrice.value,
        pictureUrl: pictureUrl.value,
        endDate: endDate.value,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      errorMessage.value = error;
      errorStatus.value = true;
    } else {
      const { id } = await response.json();
      router.push({ name: "Product", params: { productId: id } });
    }
  } catch (e) {
    errorMessage.value = e;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="sendProduct">
        <div
            v-if="errorMessage"
            class="alert alert-danger mt-4"
            role="alert"
            data-test-error
        >
          Une erreur s'est produite {{ errorMessage.value }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
              v-model="name"
              type="text"
              class="form-control"
              id="product-name"
              required
              data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
              v-model="description"
              class="form-control"
              id="product-description"
              name="description"
              rows="3"
              required
              data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
              v-model="category"
              type="text"
              class="form-control"
              id="product-category"
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
                v-model="originalPrice"
                type="number"
                class="form-control"
                id="product-original-price"
                name="originalPrice"
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
              v-model="pictureUrl"
              type="url"
              class="form-control"
              id="product-picture-url"
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
              v-model="endDate"
              type="date"
              class="form-control"
              id="product-end-date"
              name="endDate"
              required
              data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button
              type="submit"
              class="btn btn-primary"
              v-bind:disabled="isSubmitting"
              data-test-submit
          >
            Ajouter le produit
            <span
                v-if="isSubmitting"
                data-test-spinner
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>