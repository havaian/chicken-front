<template>
  <div id="kuryerlar">
    <div id="content">
      <div class="top-div">
        <h2>Kuryerlar</h2>

        <button @click="openCreateModal">Kuryer Qo‘shish</button>
      </div>

      <div id="courierListContainer">
        <input
          type="text"
          id="searchCourier"
          placeholder="Ism, telefon raqami yoki avtomobil raqami bo‘yicha qidirish"
          v-model="searchTerm"
        />

        <div id="courierList">
          <div v-if="filteredCouriers.length === 0">No couriers available.</div>
          <div v-for="courier in filteredCouriers" :key="courier._id">
            <p>{{ new Date(courier.createdAt).toLocaleDateString("ru-RU") }}</p>
            <p>{{ courier.full_name }}</p>
            <p>{{ courier.phone_num }}</p>
            <p>{{ courier.car_num || "-" }}</p>
            <button class="edit-button" @click="openEditModal(courier)">Tahrirlash</button>
            <button class="delete-button" @click="confirmDeleteCourier(courier)">O‘chirish</button>
          </div>
        </div>
      </div>

      <!-- Edit Courier Modal -->
      <div v-if="showEditModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeEditModal">&times;</span>
          <h3>Kuryerni Tahrirlash</h3>
          <input type="hidden" v-model="currentCourier._id" />
          <input v-model="currentCourier.full_name" type="text" placeholder="To‘liq ism" required />
          <input v-model="currentCourier.phone_num" type="text" placeholder="Telefon raqami" required />
          <input v-model="currentCourier.car_num" type="text" placeholder="Avtomobil raqami" />
          <button @click="confirmUpdateCourier">Saqlash</button>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal">
        <div class="modal-content">
          <h3>{{ confirmationMessage }}</h3>
          <button @click="confirmAction">Ha</button>
          <button @click="cancelAction">Yo‘q</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosInstance from '../services/back.axiosConfig';

export default {
  data() {
    return {
      couriers: [],
      searchTerm: '',
      showCreateModal: false,
      showEditModal: false,
      showConfirmModal: false,
      currentCourier: {
        _id: '',
        full_name: '',
        phone_num: '',
        car_num: ''
      },
      confirmationMessage: '',
      pendingAction: null
    };
  },
  computed: {
    filteredCouriers() {
      const term = this.searchTerm.trim().toLowerCase();
      return this.couriers.filter(courier => {
        const fullName = courier.full_name ? courier.full_name.toLowerCase() : '';
        const phoneNum = courier.phone_num ? courier.phone_num : '';
        const carNum = courier.car_num ? courier.car_num.toLowerCase() : '';

        return fullName.includes(term) ||
               phoneNum.includes(term) ||
               carNum.includes(term);
      });
    }
  },
  methods: {
    async loadCouriers() {
      try {
        const response = await axiosInstance.get('/courier/all');
        this.couriers = await response.data;
      } catch (error) {
        console.error('Error loading couriers:', error);
      }
    },
    confirmUpdateCourier() {
      this.confirmationMessage = 'Kuryer ma\'lumotlarini o\'zgartirishni tasdiqlaysizmi?';
      this.pendingAction = this.updateCourier;
      this.showConfirmModal = true;
    },
    async updateCourier() {
      try {
        // First, check if the courier has started their day
        const activityResponse = await axiosInstance.get(`/courier/activity/today/${this.currentCourier.phone_num}`);
        
        const activityData = await activityResponse.data;
        
        if (activityData.accepted_today) {
          alert("Ushbu kuryer ish kunini boshlagan. Kun tugaguncha ma'lumotlarni o'zgartirib bo'lmaydi.");
          this.closeEditModal();
          return;
        }
        
        const updateResponse = await axiosInstance.put(`/courier/${this.currentCourier._id}`, {
          full_name: this.currentCourier.full_name,
          phone_num: this.currentCourier.phone_num,
          car_num: this.currentCourier.car_num
        });
        
        if (updateResponse.status === 200) {
          this.closeEditModal();
          await this.loadCouriers();
        } else {
          alert('Tahrirlashda xatolik!');
        }
      } catch (error) {
        console.error('Error updating courier:', error);
        alert("Tahrirlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    },
    confirmDeleteCourier(courier) {
      this.currentCourier = courier;
      this.confirmationMessage = 'Kuryerni o‘chirishni tasdiqlaysizmi?';
      this.pendingAction = this.deleteCourier;
      this.showConfirmModal = true;
    },
    async deleteCourier() {
      try {
        const activityResponse = await axiosInstance.get(`/courier/activity/today/${this.currentCourier.phone_num}`);
        
        if (activityResponse.data.accepted_today) {
          alert("Ushbu kuryer ish kunini boshlagan. Kun tugaguncha ma'lumotlarni o'zgartirib bo'lmaydi.");
          return;
        }
        
        const deleteResponse = await axiosInstance.delete(`/courier/${this.currentCourier.phone_num}`);
        
        if (deleteResponse.status === 200) {
          await this.loadCouriers();
        } else {
          alert("O'chirishda xatolik!");
        }
      } catch (error) {
        console.error('Error deleting courier:', error);
        alert("O'chirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    },
    confirmAction() {
      this.showConfirmModal = false;
      if (this.pendingAction) {
        this.pendingAction();
        this.pendingAction = null;
      }
    },
    cancelAction() {
      this.showConfirmModal = false;
      this.pendingAction = null;
    },
    openEditModal(courier) {
      this.currentCourier = { ...courier };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    }
  },
  mounted() {
    this.loadCouriers();
  }
};
</script>

<style scoped>
  #content {
    margin-left: 240px;
    padding: 20px;
    color: #000;
  }

  #content h2 {
    color: #000;
  }

  .top-div {
    width: 100%;
    display: inline-flex;
    justify-content: space-between;
  }
  
  #courierListContainer {
    margin: 3% 0;
    display: grid;
    width: 100%;
    gap: 12px;
  }
  
  #searchCourier {
    padding: 12px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    position: relative;
  }
  
  #courierList {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }
  
  #courierList div {
    padding: 1% 15%;
    background-color: #fff;
    border: 1px solid #aaa;
    border-radius: 6px;
    display: inline-grid;
    gap: 5%;
    grid-template-columns: repeat(6, 1fr);
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  #courierList p {
    margin: 0 0 12px 0;
  }
  
  button {
    border: none;
    padding: 12px 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: white;
    background-color: #007bff;
    transition: background-color 0.3s;
    width: 150px;
  }
  
  button:hover {
    background-color: #0056b3;
  }

  .edit-button {
    background-color: #007bff;
  }

  .edit-button:hover {
    background-color: #0056b3;
  }

  .delete-button {
    background-color: #dc3545;
  }

  .delete-button:hover {
    background-color: #c82333;
  }
  
  .modal {
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    width: 50%;
    max-width: 500px;
    border-radius: 8px;
  }

  .modal-content button {
    margin-top: 3%;
    margin-right: 5%;
  }

  .modal-content h3 {
    margin-top: 0;
  }
  
  .modal-content input {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }
</style>