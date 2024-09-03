<template>
    <div id="tuxum-narxi">
      <div class="top-div">
        <h2>Tuxum Narxi</h2>
      </div>
      <div id="content">
        <div id="prices" v-if="prices">
          <div v-for="(value, key) in prices" :key="key">
            <label :for="key">{{ key }}:</label>
            <input
              type="number"
              :id="key"
              v-model.number="localPrices[key]"
            />
          </div>
          <button @click="savePrices">Save</button>
        </div>
      </div>
    </div>
</template>
  
<script>
export default {
  name: 'TuxumNarxi',
  data() {
    return {
      prices: null,
      localPrices: {}
    };
  },
  async mounted() {
    await this.loadPrices();
  },
  methods: {
    async loadPrices() {
      try {
        const response = await fetch(`http://141.98.153.217:16005/data/prices`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') }
        });
        this.prices = await response.json();
        this.localPrices = { ...this.prices };
      } catch (error) {
        console.error('Error loading prices:', error);
      }
    },
    async savePrices() {
      try {
        // Update prices
        await fetch(`http://141.98.153.217:16005/data/prices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') },
          body: JSON.stringify(this.localPrices),
        });

        // Update today's activities' prices
        await fetch(`http://141.98.153.217:16004/buyer/activity/update-todays-prices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-website': localStorage.getItem('username') },
          body: JSON.stringify({ price: this.localPrices }),
        });

        alert('Prices updated successfully!');
        await this.loadPrices(); // Reload prices to reflect updates
      } catch (error) {
        console.error('Error updating prices:', error);
        alert('An error occurred while updating prices. Please try again.');
      }
    }
  }
}
</script>

<style scoped>
#tuxum-narxi {
  color: #000;
  padding: 20px;
  margin-left: 240px; /* Adjust this value based on your sidebar width */
}

#content {
  border-radius: 8px;
  padding: 40px;
  padding-top: 20px;
  background-color: #ffffff;
}

.top-div {
  width: 100%;
  color: #000;
  display: inline-flex;
  justify-content: space-between;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

#prices {
  display: grid;
  gap: 5%;
}

.price-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  margin-right: 10px;
}

input[type="number"] {
  width: 150px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
  
button {
  background-color: #007bff;
  color: #fff;
  border: none;
  margin: 0.5%;
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

.loading {
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
}
</style>