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
          <div v-for="(buyer, index) in filteredBuyers" :key="buyer._id" :class="{'buyer-item': buyer.activity.debt < 0, 'buyer-item debt': buyer.activity.debt > 0}">
            <span class="buyer-index">{{ index + 1 }}</span>
            <span class="deactivation-status">{{ buyer.deactivated ? '❌' : '✅' }}</span>
            <p class="buyer-name">{{ buyer.full_name }}</p>
            <p class="buyer-phone">{{ buyer.phone_num }}</p>
            <div class="price-grid">
              <div v-for="(price, category) in buyer.activity.price" :key="category" class="price-item">
                <span class="price-category">{{ category }}:</span>
                <span class="price-value">{{ price }}</span>
              </div>
            </div>
            <div class="buyer-debt" :class="{ 'positive-debt': buyer.activity.debt < 0, 'negative-debt': buyer.activity.debt > 0 }">
              <span class="debt-label">Qarz:</span>
              <span class="debt-value">{{ buyer.activity.debt.toLocaleString() }}</span>
            </div>
            <div class="button-grid">
              <button @click="openEditModal(buyer)" class="edit-button">Tahrirlash</button>
              <button 
                @click="confirmDeleteBuyer(buyer)" 
                class="delete-button"
                :title="buyer.activity.debt > 0 ? 'Qarzi bo\'lgan mijozni o\'chirib bo\'lmaydi' : ''"
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
          <div class="top-div">
            <h3>Yangi Mijoz Yaratish</h3>
            <span class="close" @click="closeCreateModal">&times;</span>
          </div>
          <input type="text" v-model="newBuyer.full_name" placeholder="To'liq ism" required />
          <input type="text" v-model="newBuyer.phone_num" placeholder="Telefon raqami" required />
          <button @click="confirmCreateBuyer">Mijozni Yaratish</button>
        </div>
      </div>

      <!-- Edit Buyer Modal -->
      <div v-if="showEditModal" class="modal" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="top-div">
            <h3>Mijozni Tahrirlash</h3>
            <span class="close" @click="closeEditModal">&times;</span>
          </div>
          <input type="hidden" v-model="currentBuyer._id" />
          <input type="text" v-model="currentBuyer.full_name" placeholder="To'liq ism" required />
          <input type="text" v-model="currentBuyer.phone_num" placeholder="Telefon raqami" required />
          <div class="price-inputs">
            <div v-for="(price, category) in currentBuyer.activity.price" :key="category" class="price-input-item">
              <label :for="'price-' + category">{{ category }}</label>
              <input 
                :id="'price-' + category"
                v-model.number="currentBuyer.activity.price[category]" 
                type="number"
                :placeholder="category"
              />
            </div>
          </div>
          <div class="debt-input">
            <label for="debt">Qarz</label>
            <input id="debt" v-model.number="currentBuyer.activity.debt" type="number" placeholder="Qarz" />
          </div>
          <div class="debt-limit-input">
            <label for="individualDebtLimit">Shaxsiy Qarz Chegarasi</label>
            <input id="individualDebtLimit" v-model.number="currentBuyer.debt_limit" type="number" placeholder="Shaxsiy Qarz Chegarasi" />
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
                <tr class="table-head">
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
                  <td class="activity-payment">
                    <div class="cell-content">
                      <div v-for="accepted in activity.accepted" :key="accepted.payment">
                        <div>
                          <span>{{ accepted.payment.toLocaleString() }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="activity-debt">{{ activity.debt.toLocaleString() }}</td>
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
          <div class="confirmation-buttons">
            <button @click="confirmAction" class="confirm-button">Ha</button>
            <button @click="cancelAction" class="cancel-button">Yo'q</button>
          </div>
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
        deactivated: false,
        debt_limit: 0,
        activity: {
          price: {},
          debt: 0,
          _id: null
        }
      },
      confirmationMessage: '',
      pendingAction: null,
      defaultPrices: {},
      filterOptions: [
        { value: 'name', label: 'Ism' },
        { value: 'phone', label: 'Telefon raqami' },
        { value: 'price', label: 'Maxsulot narxi' },
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
      return this.buyers.reduce((sum, buyer) => sum + buyer.activity.debt, 0);
    },
    filteredBuyers() {
      const query = this.searchQuery.toLowerCase().trim();
      
      if (!query) {
        return this.buyers;
      }

      return this.buyers.filter(buyer => {
        if (this.selectedFilters.includes('name') && (buyer.full_name || '').toLowerCase().includes(query)) {
          return true;
        }
        if (this.selectedFilters.includes('phone') && (buyer.phone_num || '').toLowerCase().includes(query)) {
          return true;
        }
        if (this.selectedFilters.includes('price') && Object.values(buyer.activity.price || {}).some(price => 
          price.toString().includes(query)
        )) {
          return true;
        }
        if (this.selectedFilters.includes('debt') && buyer.activity.debt.toString().includes(query)) {
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
        const response = await backAxios.get('/buyer/activity/today/all');
        this.buyers = await response.data;
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

        if (response.status === 201) {
          alert("Yangi mijoz muvaffaqiyatli qo'shildi!")
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
      this.confirmationMessage = 'Mijoz ma\'lumotlarini o\'zgartirishni tasdiqlaysizmi?';
      this.pendingAction = this.updateBuyer;
      this.showConfirmModal = true;
    },
    
    async updateBuyer() {
      try {
        const buyerResponse = await backAxios.put(`/buyer/${this.currentBuyer._id}`, {
          full_name: this.currentBuyer.full_name,
          phone_num: this.currentBuyer.phone_num,
          deactivated: this.currentBuyer.deactivated,
          debt_limit: this.currentBuyer.debt_limit
        });

        if (buyerResponse.status !== 200) {
          throw new Error('Failed to update buyer information');
        }

        const updatedActivity = {
          price: this.currentBuyer.activity.price,
          debt: this.currentBuyer.activity.debt
        };

        const todaysActivityResponse = await backAxios.get(`/buyer/activity/today/${this.currentBuyer._id}`, updatedActivity);

        const activityResponse = await backAxios.put(`/buyer/activity/${todaysActivityResponse.data._id}`, updatedActivity);

        if (activityResponse.status !== 200) {
          throw new Error('Failed to update buyer activity');
        }

        this.showEditModal = false;
        await this.loadBuyers();
        alert("Ma'lumotlar muvaffaqiyatli yangilandi");
      } catch (error) {
        console.error('Error updating buyer:', error);
        alert('Tahrirlashda xatolik: ' + error.message);
      }
    },
    
    confirmDeleteBuyer(buyer) {
      if (buyer.activity.debt > 0) {
        alert("Bu mijozni o'chirib bo'lmaydi, chunki ularning faol qarzi bor.");
        return;
      }
      this.currentBuyer = buyer;
      this.confirmationMessage = 'Mijozni o\'chirishni tasdiqlaysizmi?';
      this.pendingAction = this.deleteBuyer;
      this.showConfirmModal = true;
    },
    
    async deleteBuyer() {
      if (this.currentBuyer.activity.debt > 0) {
        alert("Bu mijozni o'chirib bo'lmaydi, chunki ularning faol qarzi bor.");
        return;
      }
      try {
        const response = await backAxios.delete(`/buyer/${this.currentBuyer._id}`);

        if (response.status === 200) {
          alert("Mijoz muvaffaqiyatli o'chirildi!")
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
      this.currentBuyer = { ...buyer };
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
        const response = await botAxios.put('/data/debt-limit', { debtLimit: this.debtLimit });
        if (response.status === 200) {
          console.log('Debt limit updated successfully');
        } else {
          console.error('Failed to update debt limit');
          await this.fetchDebtLimit();
        }
      } catch (error) {
        console.error('Error updating debt limit:', error);
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
    position: relative;
  }

  #content h2 {
    color: #000;
  }

  #content > .top-div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 20px;
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: thin solid lightgrey;
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
    padding: 1% 15% 1% 10%;
    background-color: #fff;
    border: 1px solid #aaa;
    border-radius: 6px;
    display: inline-grid;
    gap: 5%;
    grid-template-columns: repeat(7, 1fr);
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

  .modal .top-div {
    width: 100%;
    display: flex;
    justify-content: space-between;
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

  .confirmation-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .confirm-button, .cancel-button {
    padding: 12px 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: white;
    transition: background-color 0.3s;
    width: 150px;
    border: none;
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

  .modal-content button:first-of-type {
    background-color: #28a745;
  }

  .modal-content button:first-of-type:hover {
    background-color: #218838;
  }

  .modal-content button:last-of-type {
    background-color: #dc3545;
  }

  .modal-content button:last-of-type:hover {
    background-color: #c82333;
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
    text-align: left;
    border: thin solid lightgrey
  }

  .activities-table th {
    padding: 8px;
    text-align: left;
    border: thin solid lightgrey
  }

  .activities-table td > div {
    padding: 8px;
    border-bottom: thin solid lightgrey
  }

  .activities-table td > div:last-child {
    border-bottom: thin solid transparent;  
  }

  .activities-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f2f2f2;
    border: thin solid lightgrey
  }

  .activities-table tr {
    border: thin solid lightgrey
  }

  .activities-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .activities-table .activity-payment {
    position: relative;
    height: 100%;
    width: 5.5vw;
    padding: 0 !important;
  }

  .activities-table .activity-payment > .cell-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 8px;
  }

  .activities-table .activity-payment > .cell-content > div {
    width: 100%;
    text-align: center;
  }

  .activities-table .activity-debt {
    width: 4vw;
    text-align: center;
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
  