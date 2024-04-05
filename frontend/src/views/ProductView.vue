<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.productId);
const loading = ref(false);
const error = ref(false);
const isOwner = ref(false);
const product = ref({});
const price = ref(0);

async function fetchProduct() {
  error.value = false;
  loading.value = true;
  try {
    const res = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
    );
    product.value = await res.json();
    const lastBid = getLastBid.value;
    if (lastBid) {
      price.value = lastBid.price + 1;
    }
    if (isAuthenticated.value && userData.value.id === product.value.sellerId) {
      isOwner.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

async function deleteProduct(productId) {
  error.value = false;
  loading.value = true;
  try {
    await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    await router.push({
      name: "Home",
    });
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

fetchProduct();

async function deleteBid(bidId) {
  error.value = false;
  loading.value = true;
  try {
    await fetch(`http://localhost:3000/api/bids/${bidId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    fetchProduct();
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

const disabledButtonAddBid = computed(() => {
  const maxPrice = getLastBid.value?.price ?? 10;
  return price.value < maxPrice;
});
const getLastBid = computed(() => {
  if (product.value.bids.length > 0) {
    return product.value.bids.slice(-1)[0] ?? null;
  }
  return null;
});

function getTimeDifference(endDate) {
  const endDateObj = new Date(endDate);
  const currentDateObj = new Date();

  const differenceInMs = endDateObj - currentDateObj;
  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((differenceInMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((differenceInMs / (1000 * 60)) % 60);

  return `${days}j ${hours}h ${minutes}min`;
}

async function addBid() {
  try {
    await fetch(`http://localhost:3000/api/products/${productId.value}/bids`, {
      method: "POST",
      body: JSON.stringify({ price: price.value }),
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });
    fetchProduct();
  } catch (e) {
    error.value = true;
  }
}
</script>

<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading v-if="loading && !error">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
      v-if="error"
    >
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div class="row" data-test-product v-if="!loading && !error">
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src="product.pictureUrl"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant :{{
                formatDate(product.endDate) > formatDate(Date.now())
                  ? getTimeDifference(product.endDate)
                  : "Terminé"
              }}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ product.name }}
            </h1>
          </div>
          <div class="col-lg-6 text-end" v-if="isAdmin || isOwner">
            <RouterLink
              :to="{ name: 'ProductEdition', params: { productId: productId } }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button
              class="btn btn-danger"
              data-test-delete-product
              @click.prevent="deleteProduct(product.id)"
            >
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{ product.description }}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>
            Prix de départ : {{ product.originalPrice }} €
          </li>
          <li data-test-product-end-date>
            Date de fin : {{ formatDate(product.endDate) }}
          </li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: product.seller.id } }"
              data-test-product-seller
            >
              {{ product.seller.username }}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in product.bids" :key="bid" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidder.id } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidder.username }}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.price }} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button
                  class="btn btn-danger btn-sm"
                  data-test-delete-bid
                  v-if="
                    isAdmin ||
                    (isAuthenticated && userData.id === bid.bidder.id)
                  "
                  @click="deleteBid(bid.id)"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids v-if="product.bids.length === 0">
          Aucune offre pour le moment
        </p>

        <form data-test-bid-form @submit.prevent="addBid">
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              data-test-bid-form-price
              v-model="price"
            />
            <small class="form-text text-muted">
              Le montant doit être supérieur à 10 €.
            </small>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="disabledButtonAddBid"
            data-test-submit-bid
          >
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
