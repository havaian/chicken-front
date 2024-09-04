<template>
  <div id="mijozlar">
    <div id="content">
      <div class="top-div">
        <h2>Mijozlar</h2>
        <div class="debt-info">
          <span>Umumiy qarz: </span>
          <span :class="{ 'positive-debt': totalDebt < 0, 'negative-debt': totalDebt > 0 }">
            {{ totalDebt.toLocaleString() }}
          </span>
        </div>
        <button @click="openCreateModal">Mijoz Qo'shish</button>
      </div>

      <div class="debt-limit-row">
        <span>Qarz Chegarasi:</span>
        <input 
          type="number" 
          v-model.number="debtLimit" 
          @change="updateDebtLimit"
          :disabled="updatingDebtLimit"
        >
      </div>

      <div id="buyerListContainer">
        <div class="filter-options">
          <label v-for="option in filterOptions" :key="option.value">
            <input type="checkbox" v-model="selectedFilters" :value="option.value">
            {{ option.label }}
          </label>
        </div>
        <input 
          id="searchBuyer" 
          type="text" 
          v-model="searchQuery" 
          :placeholder="getPlaceholder()" 
        />

        <div id="buyerList">
          <div v-for="buyer in filteredBuyers" :key="buyer._id" :class="{'buyer-item': buyer.debt < 0, 'buyer-item debt': buyer.debt > 0}">
            <span class="deactivation-status">{{ buyer.deactivated ? '❌' : '✅' }}</span>
            <p class="buyer-name">{{ buyer.full_name }}</p>
            <p class="buyer-phone">{{ buyer.phone_num }}</p>
            <div class="price-grid">
              <div v-for="(price, category) in buyer.price" :key="category" class="price-item">
                <span class="price-category">{{ category }}:</span>
                <span class="price-value">{{ price }}</span>
              </div>
            </div>
            <div class="buyer-debt" :class="{ 'positive-debt': buyer.debt < 0, 'negative-debt': buyer.debt > 0 }">
              <span class="debt-label">Qarz:</span>
              <span class="debt-value">{{ buyer.debt.toLocaleString() }}</span>
            </div>
            <div class="button-grid">
              <button @click="openEditModal(buyer)" class="edit-button">Tahrirlash</button>
              <button 
                @click="confirmDeleteBuyer(buyer)" 
                class="delete-button"
                :title="buyer.debt > 0 ? 'Qarzi bo\'lgan mijozni o\'chirib bo\'lmaydi' : ''"
              >
                O'chirish
              </button>
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
      <div v-if="showEditModal" class="modal" @click.self="closeEditModal">
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
          <div class="debt-limit-input">
            <label for="individualDebtLimit">Shaxsiy Qarz Chegarasi</label>
            <input id="individualDebtLimit" v-model.number="currentBuyer.individualDebtLimit" type="number" placeholder="Shaxsiy Qarz Chegarasi" />
          </div>
          <div class="deactivate-option">
            <label>
              Deactivate
            </label>
            <input type="checkbox" v-model="currentBuyer.deactivated">
          </div>
          <button @click="confirmUpdateBuyer">Saqlash</button>

          <!-- Last 30 Days Activities Table -->
          <div class="activities-table" v-if="lastThirtyDaysActivities.length > 0">
            <h4>So'nggi 30 kunlik faoliyat</h4>
            <table>
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Qabul qilingan</th>
                  <th>To'lov</th>
                  <th>Qarz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in lastThirtyDaysActivities" :key="activity._id">
                  <td>{{ formatDate(activity.date) }}</td>
                  <td>
                    <div v-for="accepted in activity.accepted" :key="accepted.time">
                      <div class="price-grid">
                        <div v-for="egg in accepted.eggs" :key="egg.category" class="price-item edit-modal">
                          <span class="price-category edit-modal">{{ egg.category }}</span>
                          <span class="price-value edit-modal">{{ egg.amount }}</span>
                          <span class="egg-price edit-modal">({{ egg.price }})</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div v-for="accepted in activity.accepted" :key="accepted.payment">
                      <div>
                        <span>{{ accepted.payment.toLocaleString() }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ activity.debt.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
import backAxios from '../services/back.axiosConfig';
import botAxios from '../services/bot.axiosConfig';

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
        activityId: null,
        deactivated: false,
        individualDebtLimit: 0 
      },
      confirmationMessage: '',
      pendingAction: null,
      defaultPrices: {},
      filterOptions: [
        { value: 'name', label: 'Ism' },
        { value: 'phone', label: 'Telefon raqami' },
        { value: 'price', label: 'Tuxum narxi' },
        { value: 'debt', label: 'Qarz' }
      ],
      selectedFilters: ['name', 'phone'],
      lastThirtyDaysActivities: [],
      debtLimit: 0,
      updatingDebtLimit: false,
    };
  },
  computed: {
    totalDebt() {
      return this.buyers.reduce((sum, buyer) => sum + buyer.debt, 0);
    },
    filteredBuyers() {
      const query = this.searchQuery.toLowerCase().trim();
      
      if (!query) {
        return this.buyers; // Return all buyers if the search query is empty
      }

      return this.buyers.filter(buyer => {
        if (this.selectedFilters.includes('name') && (buyer.full_name || '').toLowerCase().includes(query)) {
          return true;
        }
        if (this.selectedFilters.includes('phone') && (buyer.phone_num || '').toLowerCase().includes(query)) {
          return true;
        }
        if (this.selectedFilters.includes('price') && Object.values(buyer.price || {}).some(price => 
          price.toString().includes(query)
        )) {
          return true;
        }
        if (this.selectedFilters.includes('debt') && buyer.debt.toString().includes(query)) {
          return true;
        }
        return false;
      });
    },
  },
  methods: {
    getPlaceholder() {
      const selectedLabels = this.filterOptions
        .filter(option => this.selectedFilters.includes(option.value))
        .map(option => option.label)
        .join(', ');
      return `${selectedLabels} bo'yicha qidirish`;
    },
    async loadBuyers() {
      try {
        const [buyersResponse, activitiesResponse] = await Promise.all([
          backAxios.get('/buyer/all'),
          backAxios.get('/buyer/activity/today/all')
        ]);

        const buyers = await buyersResponse.data;
        const activities = await activitiesResponse.data;

        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        // Merge buyers with their activities
        this.buyers = buyers.map(buyer => {
          const activity = activities.find(a => a.buyer === buyer._id);

          let price;

          if (activity.isToday) {
            // If activity exists and is from today, use its price
            price = activity.price;
          } else {
            // If no activity or activity is not from today, use default prices
            price = {...this.defaultPrices};
          }

          return {
            ...buyer,
            price: price,
            debt: activity ? activity.debt : 0,
            activityId: activity ? activity._id : null,
            individualDebtLimit: buyer.debt_limit
          };
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    async loadDefaultPrices() {
      try {
        const response = await botAxios.get('/data/prices');
        this.defaultPrices = await response.data;
      } catch (error) {
        console.error('Error loading default prices:', error);
      }
    },
    confirmCreateBuyer() {
      this.confirmationMessage = 'Yangi mijoz yaratishni tasdiqlaysizmi?';
      this.pendingAction = this.createBuyer;
      this.showConfirmModal = true;
    },
    async createBuyer() {
      try {
        const response = await backAxios.post('/buyer/new', this.newBuyer);

        if (response.status === 200) {
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
        const buyerResponse = await backAxios.put(`/buyer/${this.currentBuyer._id}`, {
          full_name: this.currentBuyer.full_name,
          phone_num: this.currentBuyer.phone_num,
          deactivated: this.currentBuyer.deactivated,
          debt_limit: this.currentBuyer.individualDebtLimit
        });

        if (!buyerResponse.status === 200) {
          throw new Error('Failed to update buyer information');
        }

        // Fetch today's activity for the buyer
        const todayActivityResponse = await backAxios.get(`/buyer/activity/today/${this.currentBuyer._id}`);

        if (!todayActivityResponse.status === 200) {
          throw new Error('Failed to fetch today\'s activity');
        }

        const todayActivity = await todayActivityResponse.data;

        // Update the activity with new price and debt
        const updatedActivity = {
          ...todayActivity,
          price: this.currentBuyer.price,
          debt: this.currentBuyer.debt
        };

        const activityResponse = await backAxios.put(`/buyer/activity/${todayActivity._id}`, updatedActivity);

        if (!activityResponse.status === 200) {
          throw new Error('Failed to update buyer activity');
        }

        this.showEditModal = false;
        await this.loadBuyers(); // Reload the buyers list to reflect the changes
        alert("Ma'lumotlar muvaffaqiyatli yangilandi");
      } catch (error) {
        console.error('Error updating buyer:', error);
        alert('Tahrirlashda xatolik: ' + error.message);
      }
    },
    confirmDeleteBuyer(buyer) {
      if (buyer.debt > 0) {
        alert("Bu mijozni o'chirib bo'lmaydi, chunki ularning faol qarzi bor.");
        return;
      }
      this.currentBuyer = buyer;
      this.confirmationMessage = 'Mijozni o\'chirishni tasdiqlaysizmi?';
      this.pendingAction = this.deleteBuyer;
      this.showConfirmModal = true;
    },
    async deleteBuyer() {
      if (this.currentBuyer.debt > 0) {
        alert("Bu mijozni o'chirib bo'lmaydi, chunki ularning faol qarzi bor.");
        return;
      }
      try {
        const response = await backAxios.delete(`/buyer/${this.currentBuyer.phone_num}`);

        if (response.status === 200) {
          this.loadBuyers();
        } else {
          alert('O\'chirishda xatolik!');
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
    async openEditModal(buyer) {
      this.currentBuyer = { 
        ...buyer,
        deactivated: buyer.deactivated,
        individualDebtLimit: buyer.debt_limit !== undefined ? buyer.debt_limit : this.debtLimit
      };
      this.showEditModal = true;
      await this.fetchLastThirtyDaysActivities();
    },
    async fetchLastThirtyDaysActivities() {
      try {
        const response = await backAxios.get(`/buyer/activity/last30days/${this.currentBuyer._id}`);
        if (response.status === 200) {
          this.lastThirtyDaysActivities = await response.data;
        } else {
          console.error('Failed to fetch last 30 days activities');
        }
      } catch (error) {
        console.error('Error fetching last 30 days activities:', error);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async fetchDebtLimit() {
      try {
        const response = await botAxios.get('/data/debt-limit');
        if (response.status === 200) {
          const data = await response.data;
          this.debtLimit = data.debtLimit;
        } else {
          console.error('Failed to fetch debt limit');
        }
      } catch (error) {
        console.error('Error fetching debt limit:', error);
      }
    },
    async updateDebtLimit() {
      this.updatingDebtLimit = true;
      try {
        const response = await botAxios.put('/data/debt-limit', this.debtLimit);
        if (response.status === 200) {
          console.log('Debt limit updated successfully');
        } else {
          console.error('Failed to update debt limit');
          // Revert to the previous value if update fails
          await this.fetchDebtLimit();
        }
      } catch (error) {
        console.error('Error updating debt limit:', error);
        // Revert to the previous value if update fails
        await this.fetchDebtLimit();
      } finally {
        this.updatingDebtLimit = false;
      }
    },
  },
  async mounted() {
    await this.loadDefaultPrices();
    await this.loadBuyers();
    await this.fetchDebtLimit();
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

  .top-div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .debt-info {
    color: #000;
    font-size: 18px;
    display: inline-flex;
    gap: 25px;
  }

  .positive-debt { color: #28a745; font-weight: 700; }
  .negative-debt { color: #dc3545; font-weight: 700; }
  
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
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
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
    font-weight: bold;
    font-size: 0.8em;
    color: #555;
  }

  .price-value {
    font-weight: bold;
  }

  .price-value.edit-modal {
    font-weight: normal;
  }

  .egg-price {
    font-size: 0.8em;
    color: #555;
  }

  .buyer-debt {
    display: grid;
    padding-bottom: 1.2vh;
  }

  .debt-label {
    font-size: 0.9em;
    color: #555;
  }

  .debt-value {
    white-space: nowrap;
    font-weight: bold;
  }

  .positive-debt .debt-value { color: #28a745; }
  .negative-debt .debt-value { color: #dc3545; }

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
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    width: 90%;
    max-width: 500px;
    border-radius: 8px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close {
    color: #aaa;
    position: sticky;
    top: 0;
    right: 10px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    float: right;
    z-index: 1;
  }
  
  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
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
  
  #buyerList p {
    margin: 0 0 12px 0;
  }
  
  button {
    background-color: #007bff;
    color: #fff;
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

  .filter-options {
    margin-bottom: 10px;
  }

  .filter-options label {
    margin-right: 15px;
    cursor: pointer;
  }

  .filter-options input[type="checkbox"] {
    margin-right: 5px;
  }

  .activities-table {
    margin-top: 20px;
    max-height: 300px;
    overflow-y: auto;
  }

  .activities-table table {
    width: 100%;
    border-collapse: collapse;
  }

  .activities-table th, .activities-table td {
    padding: 8px;
    text-align: left;
  }

  .activities-table th {
    background-color: #f2f2f2;
  }

  .activities-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .deactivation-status {
    margin-right: 10px;
    font-size: 1.2em;
  }

  .deactivate-option {
    width: 100%;
    display: inline-flex;
    margin-bottom: 1vh;
  }

  .deactivate-option label {
    display: flex;
    align-items: center;
  }

  .deactivate-option input[type="checkbox"] {
    width: fit-content !important;
    margin: 10px !important;
  }

  .debt-limit-row {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .debt-limit-row span {
    margin-right: 10px;
  }

  .debt-limit-row input {
    width: 150px;
    padding: 5px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
</style>
  