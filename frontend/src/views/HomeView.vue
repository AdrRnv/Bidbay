<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const loading = ref(false);
const error = ref(false);
const products = ref([]);
const filterText = ref('');
const sortOption = ref('nom');
const router = useRouter();

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const response = await fetch('http://localhost:3000/api/products');
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits');
    }
    const data = await response.json();
    products.value = data;
  } catch (e) {
    error.value = true;
    console.error(e.message);
  } finally {
    loading.value = false;
  }
}

function filteredProducts() {
  if (filterText.value) {
    return products.value.filter(product => product.name.toLowerCase().includes(filterText.value.toLowerCase()));
  } else {
    return products.value;
  }
}

const sortedProducts = computed(() => {
  let sorted = [...filteredProducts()];

  if (sortOption.value === 'nom') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption.value === 'prix') {
    sorted.sort((a, b) => a.originalPrice - b.originalPrice);
  }

  return sorted;
});

function setSortOption(option) {
  sortOption.value = option;
}

onMounted(fetchProducts);

function navigateToProduct(productId) {
  router.push({ name: 'Product', params: { productId } });
}

</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
                type="text"
                class="form-control"
                placeholder="Filtrer par nom"
                data-test-filter
                v-model.trim="filterText"
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
              type="button"
              class="btn btn-primary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-test-sorter
          >
            Trier par {{ sortOption }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click="setSortOption('nom')">Nom</a>
            </li>
            <li>
              <a class="dropdown-item" href="#" data-test-sorter-price @click="setSortOption('prix')">Prix</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error.value" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div class="row" v-if="!loading">
      <div class="col-md-4 mb-4" v-for="product in sortedProducts" :key="product.id" data-test-product>
        <div class="card">
          <button @click="navigateToProduct(product.id)">
            <img
                :src="product.pictureUrl"
                data-test-product-picture
                class="card-img-top"
            />
          </button>
          <div class="card-body">
            <h5 class="card-title">
              <button @click="navigateToProduct(product.id)">
                {{ product.name }}
              </button>
            </h5>
            <p class="card-text" data-test-product-description>
              {{ product.description }}
            </p>
            <p class="card-text">
              Vendeur :
              <button @click="navigateToProduct(product.seller.id)">
                {{ product.seller.username }}
              </button>
            </p>
            <p class="card-text" data-test-product-date>
              En cours jusqu'au {{ product.endDate }}
            </p>
            <p class="card-text" data-test-product-price>
              {{
                new Date(product.endDate) > new Date()
                    ? "Prix de départ : " + product.originalPrice + " €"
                    : "Prix actuel : " +
                    (product.bids.length
                        ? product.bids[product.bids.length - 1].price + " €"
                        : product.originalPrice + " €")
              }}
            </p>
            <button class="btn btn-primary">Faire une offre</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
