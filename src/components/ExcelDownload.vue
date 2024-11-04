<template>
    <div id="monthlyReportDownload">
      <h2>Oylik Hisobot</h2>
      
      <div class="calendar-container">
        <input type="month" v-model="selectedDate" @change="updateDownloadLink" />
      </div>
      
      <div class="download-container">
        <button @click="downloadReport" :disabled="!isDateSelected">
          Ko’chirib olish
        </button>
      </div>
    </div>
</template>
  
<script>
  import backAxios from '../services/back.axiosConfig';
  
  export default {
    data() {
      return {
        selectedDate: '',
      };
    },
    computed: {
      isDateSelected() {
        return !!this.selectedDate;
      },
    },
    methods: {
      updateDownloadLink() {
        // This method is called when the date is changed
        // It's not strictly necessary for this implementation,
        // but could be used for validation or other checks
      },
      async downloadReport() {
        if (!this.selectedDate) {
          alert('Please select a date');
          return;
        }
  
        const [year, month, day] = this.selectedDate.split('-');
        
        try {
          const response = await backAxios.get(
            `/buyer/activity/report/monthly-report/${year}/${month}`,
            { responseType: 'blob' }
          );
          
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `${year}_${month}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(link.href);
        } catch (error) {
          console.error('Error downloading report:', error);
          alert('Error downloading report. Please try again.');
        }
      },
    },
  };
</script>
  
<style scoped>
  #monthlyReportDownload {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }
  
  h2 {
    color: black;
    margin-bottom: 20px;
  }
  
  .calendar-container {
    margin-bottom: 20px;
  }
  
  input[type="date"] {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }
  
  .download-container {
    margin-top: 20px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>