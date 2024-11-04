<template>
  <div class="excel-upload">
    <h3>Excel Fayl Yuklash</h3>
    
    <!-- File Selection Input -->
    <div class="file-input-container">
      <input 
        type="file" 
        id="file-input"
        ref="fileInput" 
        @change="handleFileChange" 
        accept=".xlsx, .xls"
        class="hidden-file-input"
      >
      <label for="file-input" class="file-input-label">
        {{ fileName || 'Tanlang' }}
      </label>
    </div>
    
    <!-- File Upload Input -->
    <div class="upload-container">
      <button @click="confirmUpload" :disabled="!selectedFile" class="upload-button">
        Yuklash
      </button>
    </div>
    
    <div v-if="loading" class="loading">Yuklanmoqda...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="processedData" class="success">
      <pre>{{ JSON.stringify(processedData, null, 2) }}</pre>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <h3>Faylni yuklashni tasdiqlaysizmi?</h3>
        <button @click="uploadFile">Ha</button>
        <button @click="cancelUpload">Yo'q</button>
      </div>
    </div>
  </div>
</template>

<script>
import backAxios from '../services/back.axiosConfig';

export default {
  name: 'ExcelUpload',
  data() {
    return {
      selectedFile: null,
      fileName: '',
      loading: false,
      error: '',
      processedData: null,
      showConfirmModal: false
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.fileName = this.selectedFile ? this.selectedFile.name : '';
      this.error = ''; // Clear any previous errors when a new file is selected
    },
    confirmUpload() {
      this.showConfirmModal = true;
    },
    cancelUpload() {
      this.showConfirmModal = false;
    },
    async uploadFile() {
      this.showConfirmModal = false;
      if (!this.selectedFile) {
        this.error = 'Iltimos, avval faylni tanlang.';
        return;
      }

      this.loading = true;
      this.error = '';
      this.processedData = null;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await backAxios.post('/excel/extract', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.processedData = response.data.message;
        // Here you can add logic to handle the processed data
      } catch (err) {
        this.error = 'Faylni qayta ishlashda xatolik yuz berdi: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
h3 {
  color: black;
  margin-bottom: 2vh;
  font-size: 20px;
}

.excel-upload {
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.file-input-container, .upload-container {
  margin-bottom: 15px;
}

.hidden-file-input {
  display: none;
}

.file-input-label, .upload-button {
  display: inline-block;
  padding: 10px 15px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.file-input-label {
  background-color: #007bff;
}

.file-input-label:hover {
  background-color: #0056b3;
}

.upload-button {
  background-color: #28a745;
  border: none;
}

.upload-button:hover {
  background-color: #218838;
}

.file-input-label:active, .upload-button:active {
  transform: scale(0.98);
}

.upload-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.loading, .error, .success {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.loading {
  background-color: #f0f0f0;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f9fa;
  border: 1px solid #eaeaea;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
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
  padding: 10px 15px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  border: none;
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

.modal-content h3 {
  margin-top: 0;
  font-size: 18px;
  margin-bottom: 20px;
}
</style>