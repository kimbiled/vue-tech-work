<template>
  <div v-if="crudStore.loading" class="text-center p-6">
    <span class="text-xl text-gray-700">Загрузка данных...</span>
  </div>

  <div v-else-if="crudStore.error" class="text-center p-6 text-red-500">
    <span class="text-xl">Ошибка: {{ crudStore.error.message }}</span>
  </div>

  <div class="container mx-auto p-6">
    <h2 class="text-3xl font-semibold text-gray-800 mb-6">Список товаров</h2>
    
    <ul class="space-y-6">
      <li v-for="item in crudStore.items" :key="item.id" class="flex justify-between items-center p-5 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all">
        <div>
          <h3 class="text-lg font-medium text-gray-700">{{ item.product_name }}</h3>
          <p class="text-gray-500">Количество: {{ item.product_amount }}</p>
        </div>

        <div class="flex space-x-3">
          <button @click="editItem(item)" class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all transform hover:scale-105">
            Редактировать
          </button>
          <button @click="showDeleteModal(item)" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all transform hover:scale-105">
            Удалить
          </button>
        </div>
      </li>
    </ul>

   
    <div class="mt-12 bg-white p-8 rounded-lg shadow-lg">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Добавить новый товар</h3>
      <form @submit.prevent="addNewItem" class="space-y-6">
        <input v-model="newItem.product_name" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Название товара" />
        <input v-model="newItem.product_amount" type="number" class="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Количество" />
        <button @click="addItem" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all hover:scale-105">
          Добавить товар
        </button>
      </form>
    </div>


    <div v-if="editingItem" class="mt-10 p-6 bg-white border rounded-lg shadow-lg">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <i class="fas fa-pencil-alt text-blue-500"></i>
        <span>Редактировать товар</span>
      </h3>
      <form @submit.prevent="updateItem" class="space-y-6">
        <input v-model="editingItem.product_name" type="text" class="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Название товара" />
        <input v-model="editingItem.product_amount" type="number" class="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Количество" />
        <div class="flex space-x-4">
          <button @click="updateItem" class="px-4 py-2 bg-gradient-to-r text-white rounded-md transition-all">
            Обновить
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="isModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg">Вы уверены, что хотите удалить этот товар?</p>
        <div class="flex justify-between mt-4">
          <button @click="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Да</button>
          <button @click="cancelDelete" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCrudStore } from "@/stores/crudStore";
import axios from "axios";
export default {
  data() {
    return {
      crudStore: useCrudStore(),
      newItem: {
        product_name: "",
        product_amount: 1,
      },
      editingItem: null, 
      isModalVisible: false,
      itemToDelete: null, 
    };
  },
  methods: {
    async addNewItem() {
      try {
        const response = await axios.post(
          "/api/sandbox/crud",
          this.newItem
        );
        this.crudStore.addItem(response.data); 
        this.newItem = {}; 
        window.location.reload(); 
      } catch (error) {
        console.error("Ошибка при добавлении:", error);
      }
    },

    async deleteItem(id) {
      await this.crudStore.deleteItem(id);
    },

    showDeleteModal(item) {
      this.isModalVisible = true;
      this.itemToDelete = item;
    },

    async confirmDelete() {
      if (this.itemToDelete) {
        await this.deleteItem(this.itemToDelete.id);
        this.isModalVisible = false; 
        this.itemToDelete = null; 
      }
    },

    cancelDelete() {
      this.isModalVisible = false;
      this.itemToDelete = null;
    },

    editItem(item) {
      this.editingItem = { ...item }; // Копируем данные товара для редактирования
      console.log("Товар для редактирования:", this.editingItem);
    },

    async updateItem() {
      if (this.editingItem) {
        try {
          const response = await axios.put(
            `/api/sandbox/crud/${this.editingItem.id}`,
            this.editingItem
          );
          console.log("Ответ от сервера:", response.data);
          this.crudStore.updateItem(this.editingItem); 
          this.editingItem = null; 
          window.location.reload();
        } catch (error) {
          console.error("Ошибка при обновлении:", error);
        }
      }
    },
  },
  async created() {
    await this.crudStore.fetchItems();
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}

input {
  transition: all 0.3s ease;
}

input:focus {
  border-color: #3b82f6; /* Цвет фокуса */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.transition-all {
  transition: all 0.3s ease-in-out;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.bg-gradient-to-r {
  background: linear-gradient(to right, #4CAF50, #81C784);
}

</style>
