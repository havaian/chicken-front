<template>
  <div id="kuryerlar">
    <div id="content">
      <div class="top-div">
        <h2>Kuryer kamomad</h2>
      </div>

      <div id="courierListContainer">
        <input
          type="text"
          id="searchCourier"
          placeholder="Ism, telefon raqami yoki avtomobil raqami bo'yicha qidirish"
          v-model="searchTerm"
        />

        <button @click="openCalendar">Kalendar</button>

        <h2 v-if="selectedDate" class="selected-date">
          Sana: {{ formatDate(selectedDate) }}
        </h2>

        <div v-if="showCalendar" class="calendar-modal" @click.self="closeCalendar">
          <div class="calendar-content">
            <span class="close-btn" @click="closeCalendar">&times;</span>
            <input type="date" v-model="selectedDate" />
            <button @click="submitDate">Tasdiqlash</button>
          </div>
        </div>

        <div id="courierList">
          <div v-if="filteredCouriers.length === 0">No couriers available.</div>
          <div v-for="courier in filteredCouriers" :key="courier._id" class="courier-item">
            <h3>{{ courier.full_name }}</h3>
            <p>{{ courier.phone_num }}</p>
            <p>{{ courier.car_num || "-" }}</p>
            
            <div v-if="courierData[courier._id] || warehouseData[courier._id]" class="comparison-data">
              <h4>Ma'lumotlar</h4>
              <div class="data-grid">
                <div class="data-item">
                  <h5>Kuryer ma'lumotlari</h5>
                  <div v-if="courierData[courier._id]">
                    <h6>Nasechka</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in courierData[courier._id].incision" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                    <h6>Qolgan</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in courierData[courier._id].current_by_courier" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                    <h6>Melanj</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in courierData[courier._id].melange_by_courier" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data-item">
                  <h5>Ombor ma'lumotlari</h5>
                  <div v-if="warehouseData[courier._id]">
                    <h6>Kamomad (Incision)</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in warehouseData[courier._id].incision" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                    <h6>Qolgan (Remained)</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in warehouseData[courier._id].remained" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                    <h6>Melanj (Melange)</h6>
                    <div class="price-grid">
                      <div v-for="(value, category) in warehouseData[courier._id].melange" :key="category" class="price-item">
                        <span class="price-category">{{ category }}:</span>
                        <span class="price-value">{{ value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      couriers: [],
      searchTerm: '',
      showCalendar: false,
      selectedDate: new Date().toISOString().split('T')[0], // Today's date
      courierData: {},
      warehouseData: {},
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
        const response = await fetch(`http://141.98.153.217:16004/courier/all`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
        });
        this.couriers = await response.json();
      } catch (error) {
        console.error('Error loading couriers:', error);
      }
    },
    openCalendar() {
      this.showCalendar = true;
    },
    closeCalendar() {
      this.showCalendar = false;
    },
    async submitDate() {
      if (!this.selectedDate) {
        alert('Please select a date');
        return;
      }

      const warehouseDate = new Date(this.selectedDate);
      warehouseDate.setDate(warehouseDate.getDate() + 1);

      try {
        const [courierResponse, warehouseResponse] = await Promise.all([
          fetch(`http://141.98.153.217:16004/courier/activity/by-date/${this.selectedDate}`, {
            headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
          }),
          fetch(`http://141.98.153.217:16004/warehouse/activity/by-date/${warehouseDate.toISOString()}`, {
            headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
          })
        ]);

        const courierData = await courierResponse.json();
        console.log(courierData);
        const warehouseData = await warehouseResponse.json();

        this.processFetchedData(courierData, warehouseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      this.closeCalendar();
    },
    processFetchedData(courierData, warehouseData) {
      this.courierData = {};
      this.warehouseData = {};

      if (Array.isArray(courierData)) {
        courierData.forEach(courier => {
          const courierId = courier.courier._id;
          this.courierData[courierId] = {
            current: courier.current || {},
            melange_by_courier: courier.melange_by_courier || {}
          };
        });
      }

      if (Array.isArray(warehouseData)) {
        warehouseData.forEach(activity => {
          if (Array.isArray(activity.distributed_to)) {
            activity.distributed_to.forEach(distribution => {
              const courierId = distribution._id;
              this.warehouseData[courierId] = {
                incision: distribution.incision || {},
                remained: distribution.remained || {},
                melange: distribution.melange || {}
              };
            });
          }
        });
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('uz-UZ', options);
    },
  },
  mounted() {
    this.loadCouriers();
    this.submitDate(); // Load data for today's date
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
  
  .courier-item {
    padding: 15px;
    background-color: #fff;
    border: 1px solid #aaa;
    border-radius: 6px;
  }
  
  .courier-item h3 {
    margin-top: 0;
  }
  
  .courier-item p {
    margin: 5px 0;
  }
  
  .comparison-data {
    margin-top: 15px;
  }
  
  .data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .data-item {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 6px;
  }
  
  .data-item h5 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #fff;
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .calendar-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .calendar-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }
  
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
    color: #555;
  }
  
  button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #0056b3;
  }
</style>