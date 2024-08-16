<template>
  <div id="mijozlar">
    <div id="content">
      <div class="top-div">
        <h2>Mijozlar</h2>
        <button @click="openCreateModal">Mijoz Qo'shish</button>
      </div>

      <div id="buyerListContainer">
        <input id="searchBuyer" type="text" v-model="searchQuery" placeholder="Ism yoki telefon raqami bo'yicha qidirish" />

        <div id="buyerList">
          <div v-for="buyer in filteredBuyers" :key="buyer._id" :class="{'buyer-item': buyer.debt < 0, 'buyer-item debt': buyer.debt > 0}">
            <p class="buyer-name">{{ buyer.full_name }}</p>
            <p class="buyer-phone">{{ buyer.phone_num }}</p>
            <div class="price-grid">
              <div v-for="(price, category) in buyer.price" :key="category" class="price-item">
                <span class="price-category">{{ category }}:</span>
                <span class="price-value">{{ price }}</span>
              </div>
            </div>
            <p class="buyer-debt" :class="{ 'positive-debt': buyer.debt < 0, 'negative-debt': buyer.debt > 0 }">
              Qarz: {{ buyer.debt }}
            </p>
            <div class="button-grid">
              <button @click="openEditModal(buyer)" class="edit-button">Tahrirlash</button>
              <button @click="confirmDeleteBuyer(buyer)" class="delete-button">O'chirish</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Buyer Modal -->
      <div v-if="showCreateModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeCreateModal">&times;</span>
          <h3>Yangi Mijoz Yaratish</h3>
          <input type="text" v-model="newBuyer.full_name" placeholder="To'liq ism" required />
          <input type="text" v-model="newBuyer.phone_num" placeholder="Telefon raqami" required />
          <button @click="confirmCreateBuyer">Mijozni Yaratish</button>
        </div>
      </div>

      <!-- Edit Buyer Modal -->
      <div v-if="showEditModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeEditModal">&times;</span>
          <h3>Mijozni Tahrirlash</h3>
          <input type="hidden" v-model="currentBuyer._id" />
          <input type="text" v-model="currentBuyer.full_name" placeholder="To'liq ism" required />
          <input type="text" v-model="currentBuyer.phone_num" placeholder="Telefon raqami" required />
          <div class="price-inputs">
            <div v-for="(price, category) in currentBuyer.price" :key="category" class="price-input-item">
              <label :for="'price-' + category">{{ category }}</label>
              <input 
                :id="'price-' + category"
                v-model.number="currentBuyer.price[category]" 
                type="number"
                :placeholder="category"
              />
            </div>
          </div>
          <div class="debt-input">
            <label for="debt">Qarz</label>
            <input id="debt" v-model.number="currentBuyer.debt" type="number" placeholder="Qarz" />
          </div>
          <button @click="confirmUpdateBuyer">Saqlash</button>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal">
        <div class="modal-content">
          <h3>{{ confirmationMessage }}</h3>
          <button @click="confirmAction">Ha</button>
          <button @click="cancelAction">Yo'q</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buyers: [],
      searchQuery: '',
      showCreateModal: false,
      showEditModal: false,
      showConfirmModal: false,
      newBuyer: {
        full_name: '',
        phone_num: ''
      },
      currentBuyer: {
        _id: '',
        full_name: '',
        phone_num: '',
        price: {},
        debt: 0,
        activityId: null
      },
      confirmationMessage: '',
      pendingAction: null,
      defaultPrices: {}
    };
  },
  computed: {
    filteredBuyers() {
      const query = this.searchQuery.toLowerCase();
      return this.buyers.filter(buyer =>
        buyer.full_name.toLowerCase().includes(query) ||
        buyer.phone_num.includes(query)
      );
    }
  },
  methods: {
    async loadBuyers() {
      try {
        const [buyersResponse, activitiesResponse] = await Promise.all([
          fetch(`${process.env.VUE_APP_API_1_URL}/buyer/all`, {
            headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
          }),
          fetch(`${process.env.VUE_APP_API_1_URL}/buyer/activity/today/all`, {
            headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
          })
        ]);

        const buyers = await buyersResponse.json();
        const activities = await activitiesResponse.json();

        // Merge buyers with their activities
        this.buyers = buyers.map(buyer => {
          const activity = activities.find(a => a.buyer === buyer._id);
          return {
            ...buyer,
            price: activity && Object.keys(activity.price).length > 0 ? activity.price : {...this.defaultPrices},
            debt: activity ? activity.debt : 0,
            activityId: activity ? activity._id : null
          };
        });

      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    async loadDefaultPrices() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_2_URL}/data/prices`, {
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
        });
        this.defaultPrices = await response.json();
      } catch (error) {
        console.error('Error loading default prices:', error);
      }
    },
    async updateBuyer() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/${this.currentBuyer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') },
          body: JSON.stringify({
            full_name: this.currentBuyer.full_name,
            phone_num: this.currentBuyer.phone_num
          })
        });

        if (response.ok) {
          // Update buyer info
          await this.updateBuyerActivity(this.currentBuyer);
          this.showEditModal = false;
          this.loadBuyers();
        } else {
          alert('Tahrirlashda xatolik!');
        }
      } catch (error) {
        console.error('Error updating buyer:', error);
      }
    },
    async updateBuyerActivity(buyer) {
      if (!buyer.activityId) {
        console.error('No activity ID found for this buyer');
        return;
      }
      try {
        const response = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/activity/${buyer.activityId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'x-user-website': localStorage.getItem('username')
          },
          body: JSON.stringify({ 
            price: buyer.price,
            debt: buyer.debt
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update activity');
        }

        alert('Ma\'lumotlar muvaffaqiyatli yangilandi');
      } catch (error) {
        console.error('Error updating activity:', error);
        alert('Ma\'lumotlarni yangilashda xatolik yuz berdi');
      }
    },
    confirmCreateBuyer() {
      this.confirmationMessage = 'Yangi mijoz yaratishni tasdiqlaysizmi?';
      this.pendingAction = this.createBuyer;
      this.showConfirmModal = true;
    },
    async createBuyer() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') },
          body: JSON.stringify(this.newBuyer)
        });

        if (response.ok) {
          this.showCreateModal = false;
          this.loadBuyers();
        } else {
          alert('Yaratishda xatolik!');
        }
      } catch (error) {
        console.error('Error creating buyer:', error);
      }
    },
    confirmUpdateBuyer() {
      this.confirmationMessage = 'Mijoz ma‘lumotlarini o‘zgartirishni tasdiqlaysizmi?';
      this.pendingAction = this.updateBuyer;
      this.showConfirmModal = true;
    },
    async updateBuyer() {
      try {
        // Update buyer information
        const buyerResponse = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/${this.currentBuyer._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'x-user-website': localStorage.getItem('username')
          },
          body: JSON.stringify({
            full_name: this.currentBuyer.full_name,
            phone_num: this.currentBuyer.phone_num
          })
        });

        if (!buyerResponse.ok) {
          throw new Error('Failed to update buyer information');
        }

        // Update buyer activity
        if (this.currentBuyer.activityId) {
          const activityResponse = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/activity/${this.currentBuyer.activityId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json', 
              'x-user-website': localStorage.getItem('username')
            },
            body: JSON.stringify({ 
              price: this.currentBuyer.price,
              debt: this.currentBuyer.debt
            })
          });

          if (!activityResponse.ok) {
            throw new Error('Failed to update buyer activity');
          }
        } else {
          // If there's no activity, create a new one
          const newActivityResponse = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/activity/new`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'x-user-website': localStorage.getItem('username')
            },
            body: JSON.stringify({
              buyer: this.currentBuyer._id,
              price: this.currentBuyer.price,
              debt: this.currentBuyer.debt
            })
          });

          if (!newActivityResponse.ok) {
            throw new Error('Failed to create new buyer activity');
          }
        }

        this.showEditModal = false;
        await this.loadBuyers(); // Reload the buyers list to reflect the changes
        alert('Ma‘lumotlar muvaffaqiyatli yangilandi');
      } catch (error) {
        console.error('Error updating buyer:', error);
        alert('Tahrirlashda xatolik: ' + error.message);
      }
    },
    confirmDeleteBuyer(buyer) {
      this.currentBuyer = buyer;
      this.confirmationMessage = 'Mijozni o‘chirishni tasdiqlaysizmi?';
      this.pendingAction = this.deleteBuyer;
      this.showConfirmModal = true;
    },
    async deleteBuyer() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_1_URL}/buyer/${this.currentBuyer.phone_num}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
        });

        if (response.ok) {
          this.loadBuyers();
        } else {
          alert('O‘chirishda xatolik!');
        }
      } catch (error) {
        console.error('Error deleting buyer:', error);
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
    openCreateModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    openEditModal(buyer) {
      this.currentBuyer = { ...buyer };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    }
  },
  async mounted() {
    await this.loadDefaultPrices();
    await this.loadBuyers();
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
    color: #fff;
  }

  .top-div {
    width: 100%;
    display: inline-flex;
    justify-content: space-between;
  }
  
  #buyerListContainer {
    margin: 3% 0;
    display: grid;
    width: 100%;
    gap: 12px;
  }
  
  #searchBuyer {
    padding: 12px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    position: relative;
  }
  
  #buyerList {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }
  .buyer-item {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 15px;
  }

  .buyer-item.debt {
    border: 1px solid #dc3545 !important;
  }

  .buyer-info {
    margin-bottom: 10px;
  }

  .buyer-name, .buyer-phone {
    font-weight: bold;
    margin: 0;
  }

  .price-grid {
    display: inline-flex;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
  }

  .price-item {
    background-color: #f0f0f0;
    padding: 5px;
    border-radius: 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .price-category {
    font-size: 0.8em;
    color: #555;
  }

  .price-value {
    font-weight: bold;
  }

  .buyer-debt {
    font-weight: bold;
    margin: 10px 0;
    text-align: right;
  }

  .positive-debt { color: #28a745; }
  .negative-debt { color: #dc3545; }

  .button-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5%;
  }

  .button-grid button {
    padding: 8px 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
  }

  .edit-button {
    background-color: #007bff;
    color: white;
  }

  .edit-button:hover {
    background-color: #0056b3;
  }

  .delete-button {
    background-color: #dc3545;
    color: white;
  }

  .delete-button:hover {
    background-color: #c82333;
  }

  .modal-content {
    max-width: 400px;
    width: 90%;
  }

  .price-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
  }

  .price-input-item {
    display: flex;
    flex-direction: column;
  }

  .price-input-item label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  .price-input-item input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  #buyerList > div {
    padding: 1% 15%;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: inline-grid;
    gap: 5%;
    grid-template-columns: repeat(5, 1fr);
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  #buyerList p {
    margin: 0 0 12px 0;
  }
  
  button {
    background-color: #007bff;
    color: #ffffff;
    border: none;
    padding: 12px 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
    width: 150px;
  }
  
  button:hover {
    background-color: #0056b3;
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
    background-color: #ffffff;
    padding: 20px;
    border: 1px solid #ddd;
    width: 50%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  