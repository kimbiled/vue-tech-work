  import { defineStore } from "pinia";
  import axios from "axios";

  export const useCrudStore = defineStore("crud", {
    state: () => ({
      items: [], 
      loading: false,
      error: null, 
    }),

    actions: {
      // Получение данных (GET)
      async fetchItems() {
        this.loading = true;
        this.error = null;
        try {
          const response = await axios.get("/api/sandbox/crud");
          const rows = response.data?.content?.rows; 
          if (Array.isArray(rows)) {
            this.items = rows;
          } else {
            console.error("Ошибка: данные не являются массивом.");
            this.items = [];
          }
        } catch (error) {
          this.error = error;
          console.error("Ошибка при получении данных:", error);
        } finally {
          this.loading = false;
        }
      },

      
      async addItem(newItem) {
        this.error = null;
        try {
          const response = await axios.post("/api/sandbox/crud", newItem);
          console.log("Ответ от сервера:", response.data);  
          const addedItem = response.data; 
          if (!addedItem || !addedItem.id) {
            console.error("Ошибка: сервер не вернул корректный объект.");
            return;
          }
          this.items.push(addedItem);
        } catch (error) {
          this.error = error;
          console.error("Ошибка при добавлении записи:", error);
        }
      },
      
      async updateItem(id, updatedItem) {
        this.error = null;
        try {
         
          const response = await axios.put(`/api/sandbox/crud/${id}`, updatedItem);
          const updatedFromServer = response.data;
          if (!updatedFromServer || !updatedFromServer.id) {
            console.error("Ошибка: сервер не вернул обновлённый объект.");
            return;
          }
      
          const index = this.items.findIndex((item) => item.id === id);
          if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updatedFromServer };
          } else {
            console.warn(`Элемент с ID ${id} не найден в локальном хранилище.`);
          }
        } catch (error) {
          this.error = error;
          console.error("Ошибка при обновлении записи:", error);
        }
      },
      
      async deleteItem(id) {
        this.error = null;
        try {
          await axios.delete(`/api/sandbox/crud/${id}`);
          this.items = this.items.filter(item => item.id !== id);
        } catch (error) {
          this.error = error;
          console.error(`Ошибка при удалении записи с ID ${id}:`, error);
        }
      },

      async syncWithServer() {
        try {
          const response = await axios.get("/api/sandbox/crud");
          const rows = response.data?.content?.rows;

          if (Array.isArray(rows)) {
            this.items = rows;
          } else {
            console.warn("Ошибка: данные от сервера не являются массивом.");
          }
        } catch (error) {
          console.error("Ошибка синхронизации данных с сервером:", error);
        }
      },
    },
  });
