// views/ItemsManagement.vue
<template>
  <div class="items-management">
    <!-- Header Section -->
    <div class="top-div">
      <h2>Maxsulotlarni Boshqarish</h2>
      <button class="primary-button" @click="showAddCategoryModal = true">
        Yangi Kategoriya
      </button>
    </div>

    <!-- Main Content -->
    <div id="content">
      <div v-if="loading" class="loading-state">
        <span>Yuklanmoqda...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <span>{{ error }}</span>
        <button @click="loadAllData">Qayta yuklash</button>
      </div>

      <div v-else class="categories-section">
        <!-- Categories -->
        <div v-for="category in categories" :key="category._id" class="category-container">
          <div class="category-header" @click="toggleCategory(category._id)">
            <div class="category-main-info">
              <i :class="['arrow', expandedCategories.includes(category._id) ? 'down' : 'right']"></i>
              <div class="info-container">
                <h3>{{ category.name }}</h3>
                <span v-if="category.description" class="description-indicator" title="Tavsif mavjud">
                  <span class="tooltip">{{ category.description }}</span>
                  <i class="info-icon">i</i>
                </span>
              </div>
              <span class="unit-badge">{{ category.unit }}</span>
            </div>
            
            <div class="category-actions">
              <div class="price-group">
                <div class="price-input">
                  <label>Ishlab chiqarish:</label>
                  <input
                    type="number"
                    v-model.number="category.baseProductionCost"
                    @change="updateCategoryPrices(category)"
                    @click.stop
                  />
                </div>
                <div class="price-input">
                  <label>Sotish:</label>
                  <input
                    type="number"
                    v-model.number="category.baseSalePrice"
                    @change="updateCategoryPrices(category)"
                    @click.stop
                  />
                </div>
              </div>
              <div class="action-buttons">
                <button 
                  class="edit-button"
                  @click.stop="openEditCategoryModal(category)"
                >
                  O'zgartirish
                </button>
                <button 
                  class="delete-button"
                  @click.stop="deleteCategory(category)"
                >
                  O'chirish
                </button>
                <button 
                  class="add-button"
                  @click.stop="openAddSubcategoryModal(category)"
                >
                  + Subkategoriya
                </button>
              </div>
            </div>
          </div>

          <!-- Subcategories -->
          <div 
            v-if="expandedCategories.includes(category._id)"
            class="subcategories-container"
          >
            <div 
              v-for="subcategory in getSubcategoriesForCategory(category._id)"
              :key="subcategory._id"
              class="subcategory-container"
            >
              <div class="subcategory-header" @click="toggleSubcategory(subcategory._id)">
                <div class="subcategory-main-info">
                  <i :class="['arrow', expandedSubcategories.includes(subcategory._id) ? 'down' : 'right']"></i>
                  <div class="info-container">
                    <h4>{{ subcategory.name }}</h4>
                    <span v-if="subcategory.description" class="description-indicator" title="Tavsif mavjud">
                      <span class="tooltip">{{ subcategory.description }}</span>
                      <i class="info-icon">i</i>
                    </span>
                  </div>
                  <span class="unit-badge">{{ subcategory.unit }}</span>
                </div>
                
                <div class="subcategory-actions">
                  <div class="price-group">
                    <div class="price-input">
                      <label>Ishlab chiqarish:</label>
                      <input
                        type="number"
                        v-model.number="subcategory.productionCost"
                        @change="updateSubcategoryPrices(subcategory)"
                        @click.stop
                      />
                    </div>
                    <div class="price-input">
                      <label>Sotish:</label>
                      <input
                        type="number"
                        v-model.number="subcategory.salePrice"
                        @change="updateSubcategoryPrices(subcategory)"
                        @click.stop
                      />
                    </div>
                  </div>
                  <div class="action-buttons">
                    <button 
                      class="edit-button"
                      @click.stop="openEditSubcategoryModal(subcategory)"
                    >
                      O'zgartirish
                    </button>
                    <button 
                      class="delete-button"
                      @click.stop="deleteSubcategory(subcategory)"
                    >
                      O'chirish
                    </button>
                    <button 
                      class="add-button"
                      @click.stop="openAddItemModal(subcategory)"
                    >
                      + Maxsulot
                    </button>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div 
                v-if="expandedSubcategories.includes(subcategory._id)"
                class="items-container"
              >
                <div 
                  v-for="item in getItemsForSubcategory(subcategory._id)"
                  :key="item._id"
                  class="item-container"
                >
                  <div class="item-main-info">
                    <div class="info-container">
                      <h5>{{ item.name }}</h5>
                      <span v-if="item.description" class="description-indicator" title="Tavsif mavjud">
                        <span class="tooltip">{{ item.description }}</span>
                        <i class="info-icon">i</i>
                      </span>
                    </div>
                    <div class="badges">
                      <span class="unit-badge">{{ item.unit }}</span>
                      <span v-if="item.variety" class="variety-badge">{{ item.variety }}</span>
                    </div>
                  </div>
                  
                  <div class="item-actions">
                    <div class="price-group">
                      <div class="price-input">
                        <label>Ishlab chiqarish:</label>
                        <input
                          type="number"
                          v-model.number="item.productionCost"
                          @change="updateItemPrices(item)"
                        />
                      </div>
                      <div class="price-input">
                        <label>Sotish:</label>
                        <input
                          type="number"
                          v-model.number="item.salePrice"
                          @change="updateItemPrices(item)"
                        />
                      </div>
                    </div>
                    <div class="action-buttons">
                      <button 
                        class="edit-button"
                        @click.stop="openEditItemModal(item)"
                      >
                        O'zgartirish
                      </button>
                      <button 
                        class="delete-button"
                        @click.stop="deleteItem(item)"
                      >
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <Modal v-model="showAddCategoryModal" title="Yangi Kategoriya">
      <form @submit.prevent="addCategory" class="add-form">
        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="newCategory.name" 
            required 
            type="text"
            placeholder="Kategoriya nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="newCategory.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="newCategory.baseProductionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="newCategory.baseSalePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="newCategory.description"
            placeholder="Kategoriya tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showAddCategoryModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>

    <!-- Add Subcategory Modal -->
    <Modal v-model="showAddSubcategoryModal" title="Yangi Subkategoriya">
      <form @submit.prevent="addSubcategory" class="add-form">
        <div class="form-group">
          <label>Kategoriya:</label>
          <input 
            :value="selectedCategory?.name" 
            disabled 
            type="text"
          />
        </div>

        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="newSubcategory.name" 
            required 
            type="text"
            placeholder="Subkategoriya nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="newSubcategory.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="newSubcategory.productionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="newSubcategory.salePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="newSubcategory.description"
            placeholder="Subkategoriya tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showAddSubcategoryModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>

    <!-- Add Item Modal -->
    <Modal v-model="showAddItemModal" title="Yangi Maxsulot">
      <form @submit.prevent="addItem" class="add-form">
        <div class="form-group">
          <label>Subkategoriya:</label>
          <input 
            :value="selectedSubcategory?.name" 
            disabled 
            type="text"
          />
        </div>

        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="newItem.name" 
            required 
            type="text"
            placeholder="Maxsulot nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="newItem.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>

          <label>Turi:</label>
          <input 
            v-model="newItem.variety" 
            type="text"
            placeholder="Maxsulot turini kiriting"
          />
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="newItem.productionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="newItem.salePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="newItem.description"
            placeholder="Maxsulot tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showAddItemModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit Category Modal -->
    <Modal v-model="showEditCategoryModal" title="Kategoriyani o'zgartirish">
      <form @submit.prevent="updateCategory" class="add-form">
        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="editingCategory.name" 
            required 
            type="text"
            placeholder="Kategoriya nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="editingCategory.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="editingCategory.baseProductionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="editingCategory.baseSalePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="editingCategory.description"
            placeholder="Kategoriya tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showEditCategoryModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit Subcategory Modal -->
    <Modal v-model="showEditSubcategoryModal" title="Subkategoriyani o'zgartirish">
      <form @submit.prevent="updateSubcategory" class="add-form">
        <div class="form-group">
          <label>Kategoriya:</label>
          <input 
            :value="editingSubcategory.category?.name" 
            disabled 
            type="text"
          />
        </div>

        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="editingSubcategory.name" 
            required 
            type="text"
            placeholder="Subkategoriya nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="editingSubcategory.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="editingSubcategory.productionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="editingSubcategory.salePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="editingSubcategory.description"
            placeholder="Subkategoriya tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showEditSubcategoryModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit Item Modal -->
    <Modal v-model="showEditItemModal" title="Maxsulotni o'zgartirish">
      <form @submit.prevent="updateItem" class="add-form">
        <div class="form-group">
          <label>Subkategoriya:</label>
          <input 
            :value="editingItem.subcategory?.name" 
            disabled 
            type="text"
          />
        </div>

        <div class="form-group">
          <label>Nomi:</label>
          <input 
            v-model="editingItem.name" 
            required 
            type="text"
            placeholder="Maxsulot nomini kiriting"
          />
        </div>

        <div class="form-group">
          <label>O'lchov birligi:</label>
          <select v-model="editingItem.unit" required>
            <option value="" hidden selected>Tanlang</option>
            <option v-for="unit in units" :key="unit.code" :value="unit.name">
              {{ unit.name }}
            </option>
          </select>

          <label>Turi:</label>
          <input 
            v-model="editingItem.variety" 
            type="text"
            placeholder="Maxsulot turini kiriting"
          />
        </div>

        <div class="form-group">
          <label>Ishlab chiqarish narxi:</label>
          <input 
            v-model.number="editingItem.productionCost" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Sotish narxi:</label>
          <input 
            v-model.number="editingItem.salePrice" 
            required 
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Tavsif:</label>
          <textarea 
            v-model="editingItem.description"
            placeholder="Maxsulot tavsifini kiriting"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="showEditItemModal = false">
            Bekor qilish
          </button>
          <button type="submit" class="primary-button" :disabled="loading">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import backAxios from '../services/back.axiosConfig';
import Modal from '../components/Modal.vue';

export default {
  name: 'ItemsManagement',
  components: {
    Modal
  },
  setup() {
    // State
    const categories = ref([]);
    const subcategories = ref([]);
    const items = ref([]);
    const units = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // UI State
    const expandedCategories = ref([]);
    const expandedSubcategories = ref([]);
    const showAddCategoryModal = ref(false);
    const showAddSubcategoryModal = ref(false);
    const showAddItemModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showEditSubcategoryModal = ref(false);
    const showEditItemModal = ref(false);

    // Selected items for modals
    const selectedCategory = ref(null);
    const selectedSubcategory = ref(null);

    // Form data
    const newCategory = ref({
      name: '',
      unit: '',
      baseProductionCost: 0,
      baseSalePrice: 0,
      description: ''
    });

    const newSubcategory = ref({
      name: '',
      unit: '',
      productionCost: 0,
      salePrice: 0,
      description: ''
    });

    const newItem = ref({
      name: '',
      unit: '',
      productionCost: 0,
      salePrice: 0,
      description: '',
      variety: '' // Add this
    });

    const editingCategory = ref({
      _id: '',
      name: '',
      unit: '',
      baseProductionCost: 0,
      baseSalePrice: 0,
      description: ''
    });

    const editingSubcategory = ref({
      _id: '',
      name: '',
      unit: '',
      productionCost: 0,
      salePrice: 0,
      description: '',
      category: null
    });

    const editingItem = ref({
      _id: '',
      name: '',
      unit: '',
      productionCost: 0,
      salePrice: 0,
      description: '',
      variety: '', // Add this
      subcategory: null
    });

    // Methods
    const loadAllData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const [categoriesRes, subcategoriesRes, itemsRes, unitsRes] = await Promise.all([
          backAxios.get('/inventory/category/'),
          backAxios.get('/inventory/subcategory/'),
          backAxios.get('/inventory/item/'),
          backAxios.get('/inventory/unit/')
        ]);
        
        categories.value = categoriesRes.data;
        subcategories.value = subcategoriesRes.data;
        items.value = itemsRes.data;
        units.value = unitsRes.data;
      } catch (err) {
        console.error('Error loading data:', err);
        error.value = 'Ma\'lumotlarni yuklashda xatolik yuz berdi';
      } finally {
        loading.value = false;
      }
    };

    const getSubcategoriesForCategory = (categoryId) => {
      return subcategories.value.filter(sub => 
        (sub.category._id || sub.category) === categoryId && !sub.deleted
      );
    };  

    const getItemsForSubcategory = (subcategoryId) => {
      return items.value.filter(item => 
        (item.subcategory._id || item.subcategory) === subcategoryId && !item.deleted
      );
    };

    // Toggle expansions
    const toggleCategory = (categoryId) => {
      const index = expandedCategories.value.indexOf(categoryId);
      if (index === -1) {
        expandedCategories.value.push(categoryId);
      } else {
        expandedCategories.value.splice(index, 1);
      }
    };

    const toggleSubcategory = (subcategoryId) => {
      const index = expandedSubcategories.value.indexOf(subcategoryId);
      if (index === -1) {
        expandedSubcategories.value.push(subcategoryId);
      } else {
        expandedSubcategories.value.splice(index, 1);
      }
    };

    // Modal handlers
    const openAddSubcategoryModal = (category) => {
      selectedCategory.value = category;
      newSubcategory.value = {
        name: '',
        unit: category.unit,
        productionCost: 0,
        salePrice: 0,
        description: ''
      };
      showAddSubcategoryModal.value = true;
    };

    const openAddItemModal = (subcategory) => {
      selectedSubcategory.value = subcategory;
      newItem.value = {
        name: '',
        unit: subcategory.unit,
        productionCost: 0,
        salePrice: 0,
        description: ''
      };
      showAddItemModal.value = true;
    };

    // CRUD operations
    const addCategory = async () => {
      loading.value = true;
      try {
        const response = await backAxios.post('/inventory/category/', newCategory.value);
        categories.value.push(response.data);
        showAddCategoryModal.value = false;
        alert('Kategoriya muvaffaqiyatli qo\'shildi!');
      } catch (err) {
        console.error('Error adding category:', err);
        alert('Kategoriyani qo\'shishda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    const addSubcategory = async () => {
      loading.value = true;
      try {
        const data = {
          ...newSubcategory.value,
          category: selectedCategory.value._id
        };
        const response = await backAxios.post('/inventory/subcategory/', data);
        subcategories.value.push(response.data);
        showAddSubcategoryModal.value = false;
        alert('Subkategoriya muvaffaqiyatli qo\'shildi!');
      } catch (err) {
        console.error('Error adding subcategory:', err);
        alert('Subkategoriyani qo\'shishda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    const addItem = async () => {
      loading.value = true;
      try {
        const data = {
          ...newItem.value,
          subcategory: selectedSubcategory.value._id
        };
        const response = await backAxios.post('/inventory/item/', data);
        items.value.push(response.data);
        showAddItemModal.value = false;
        alert('Maxsulot muvaffaqiyatli qo\'shildi!');
      } catch (err) {
        console.error('Error adding item:', err);
        alert('Maxsulotni qo\'shishda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    // Price updates
    const updateCategoryPrices = async (category) => {
      try {
        await backAxios.patch(`/inventory/category/${category._id}/prices`, {
          productionCost: category.baseProductionCost,
          salePrice: category.baseSalePrice
        });
        alert('Narxlar yangilandi!');
      } catch (err) {
        console.error('Error updating category prices:', err);
        alert('Narxlarni yangilashda xatolik yuz berdi');
      }
    };

    const updateSubcategoryPrices = async (subcategory) => {
      try {
        await backAxios.patch(`/inventory/subcategory/${subcategory._id}/prices`, {
          productionCost: subcategory.productionCost,
          salePrice: subcategory.salePrice
        });
        alert('Narxlar yangilandi!');
      } catch (err) {
        console.error('Error updating subcategory prices:', err);
        alert('Narxlarni yangilashda xatolik yuz berdi');
      }
    };

    const updateItemPrices = async (item) => {
      try {
        await backAxios.patch(`/inventory/item/${item._id}/prices`, {
          productionCost: item.productionCost,
          salePrice: item.salePrice
        });
        alert('Narxlar yangilandi!');
      } catch (err) {
        console.error('Error updating item prices:', err);
        alert('Narxlarni yangilashda xatolik yuz berdi');
      }
    };
    
    const openEditCategoryModal = (category) => {
      editingCategory.value = { ...category };
      showEditCategoryModal.value = true;
    };

    const openEditSubcategoryModal = (subcategory) => {
      editingSubcategory.value = { ...subcategory };
      showEditSubcategoryModal.value = true;
    };

    const openEditItemModal = (item) => {
      editingItem.value = { ...item };
      showEditItemModal.value = true;
    };

    // Update methods
    const updateCategory = async () => {
      loading.value = true;
      try {
        const response = await backAxios.put(`/inventory/category/${editingCategory.value._id}`, {
          name: editingCategory.value.name,
          unit: editingCategory.value.unit,
          baseProductionCost: editingCategory.value.baseProductionCost,
          baseSalePrice: editingCategory.value.baseSalePrice,
          description: editingCategory.value.description
        });

        // Update the categories list
        const index = categories.value.findIndex(c => c._id === editingCategory.value._id);
        if (index !== -1) {
          categories.value[index] = response.data;
        }

        showEditCategoryModal.value = false;
        alert('Kategoriya muvaffaqiyatli yangilandi!');
      } catch (err) {
        console.error('Error updating category:', err);
        alert('Kategoriyani yangilashda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    const updateSubcategory = async () => {
      loading.value = true;
      try {
        const response = await backAxios.put(`/inventory/subcategory/${editingSubcategory.value._id}`, {
          name: editingSubcategory.value.name,
          unit: editingSubcategory.value.unit,
          productionCost: editingSubcategory.value.productionCost,
          salePrice: editingSubcategory.value.salePrice,
          description: editingSubcategory.value.description
        });

        // Update the subcategories list
        const index = subcategories.value.findIndex(s => s._id === editingSubcategory.value._id);
        if (index !== -1) {
          subcategories.value[index] = response.data;
        }

        showEditSubcategoryModal.value = false;
        alert('Subkategoriya muvaffaqiyatli yangilandi!');
      } catch (err) {
        console.error('Error updating subcategory:', err);
        alert('Subkategoriyani yangilashda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    const updateItem = async () => {
      loading.value = true;
      try {
        const response = await backAxios.put(`/inventory/item/${editingItem.value._id}`, {
          name: editingItem.value.name,
          unit: editingItem.value.unit,
          productionCost: editingItem.value.productionCost,
          salePrice: editingItem.value.salePrice,
          description: editingItem.value.description,
          variety: editingItem.value.variety
        });

        // Update the items list
        const index = items.value.findIndex(i => i._id === editingItem.value._id);
        if (index !== -1) {
          items.value[index] = response.data;
        }

        showEditItemModal.value = false;
        alert('Maxsulot muvaffaqiyatli yangilandi!');
      } catch (err) {
        console.error('Error updating item:', err);
        alert('Maxsulotni yangilashda xatolik yuz berdi');
      } finally {
        loading.value = false;
      }
    };

    // Delete methods
    const deleteCategory = async (category) => {
      if (!confirm('Kategoriyani o\'chirmoqchimisiz?')) return;
      
      try {
        await backAxios.delete(`/inventory/category/${category._id}`);
        categories.value = categories.value.filter(c => c._id !== category._id);
        alert('Kategoriya muvaffaqiyatli o\'chirildi!');
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Kategoriyani o\'chirishda xatolik yuz berdi');
      }
    };

    const deleteSubcategory = async (subcategory) => {
      if (!confirm('Subkategoriyani o\'chirmoqchimisiz?')) return;
      
      try {
        await backAxios.delete(`/inventory/subcategory/${subcategory._id}`);
        subcategories.value = subcategories.value.filter(s => s._id !== subcategory._id);
        alert('Subkategoriya muvaffaqiyatli o\'chirildi!');
      } catch (err) {
        console.error('Error deleting subcategory:', err);
        alert('Subkategoriyani o\'chirishda xatolik yuz berdi');
      }
    };

    const deleteItem = async (item) => {
      if (!confirm('Maxsulotni o\'chirmoqchimisiz?')) return;
      
      try {
        await backAxios.delete(`/inventory/item/${item._id}`);
        items.value = items.value.filter(i => i._id !== item._id);
        alert('Maxsulot muvaffaqiyatli o\'chirildi!');
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Maxsulotni o\'chirishda xatolik yuz berdi');
      }
    };

    // Lifecycle
    onMounted(loadAllData);

    return {
      // State
      categories,
      subcategories,
      items,
      units,
      loading,
      error,
      expandedCategories,
      expandedSubcategories,
      showAddCategoryModal,
      showAddSubcategoryModal,
      showAddItemModal,
      selectedCategory,
      selectedSubcategory,
      newCategory,
      newSubcategory,
      newItem,

      // New modal states
      showEditCategoryModal,
      showEditSubcategoryModal,
      showEditItemModal,

      // Methods
      loadAllData,
      getSubcategoriesForCategory,
      getItemsForSubcategory,
      toggleCategory,
      toggleSubcategory,
      openAddSubcategoryModal,
      openAddItemModal,
      addCategory,
      addSubcategory,
      addItem,
      updateCategoryPrices,
      updateSubcategoryPrices,
      updateItemPrices,
      
      // Edit states
      editingCategory,
      editingSubcategory,
      editingItem,
      
      // Edit methods
      openEditCategoryModal,
      openEditSubcategoryModal,
      openEditItemModal,
      updateCategory,
      updateSubcategory,
      updateItem,
      
      // Delete methods
      deleteCategory,
      deleteSubcategory,
      deleteItem,
    };
  }
};
</script>

<style scoped>
#content {
  border-radius: 8px;
  padding: 40px;
  padding-top: 20px;
  background-color: #ffffff;
  color: black;
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

.items-management {
  padding: 20px;
  margin-left: 240px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 20px;
}

/* Category styling */
.category-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
}

.category-header, .subcategory-header {
  padding: 15px;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-main-info, .subcategory-main-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Subcategory styling */
.subcategories-container {
  padding-left: 20px;
}

.subcategory-container {
  border-left: 2px solid #e0e0e0;
  margin: 10px 0;
}

/* Item styling */
.items-container {
  padding-left: 40px;
}

.item-container {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Update existing badges section */
.badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.unit-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  text-align: center;
}

.variety-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  text-align: center;
}

/* Update item-main-info */
.item-main-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-main-info h5 {
  margin: 0;
  font-size: 1rem;
  color: #000000;
}

.price-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.price-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-input label {
  font-size: 0.8em;
  color: #666;
}

.price-input input {
  width: 120px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Form styling */
.add-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Buttons */
.primary-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.primary-button:hover {
  background: #1565c0;
}

.secondary-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.secondary-button:hover {
  background: #d32f2f;
}

.add-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
}

.add-button:hover {
  background: #43a047;
}

/* Arrow icon */
.arrow {
  border: solid #666;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.2s ease;
}

.arrow.right {
  transform: rotate(-45deg);
}

.arrow.down {
  transform: rotate(45deg);
}

/* Action buttons container */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: 15px;
}

/* Edit button */
.edit-button {
  background: #ffa726;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background: #fb8c00;
}

/* Delete button */
.delete-button {
  background: #ef5350;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background: #e53935;
}

/* Modify existing category-actions and item-actions to accommodate new buttons */
.category-actions,
.subcategory-actions,
.item-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Add hover effects to all buttons */
.add-button,
.edit-button,
.delete-button,
.primary-button,
.secondary-button {
  transition: all 0.2s ease;
}

/* Optional: Add disabled state styles */
.edit-button:disabled,
.delete-button:disabled,
.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Optional: Add focus states for better accessibility */
.edit-button:focus,
.delete-button:focus,
.add-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

/* Base text color for entire component */
.items-management {
  padding: 20px;
  margin-left: 240px;
  color: #000000;
}

/* Ensure modal text is black */
.modal-content {
  color: #000000;
}

/* Form inputs text color */
.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #000000;
}

/* Labels */
.form-group label,
.price-input label {
  color: #000000;
}

/* Headers */
h2, h3, h4, h5 {
  color: #000000;
}

/* Ensure disabled input text is still readable */
input:disabled,
select:disabled,
textarea:disabled {
  color: #000000;
  opacity: 0.7;
}

/* Price inputs */
.price-input input {
  color: #000000;
}

/* Placeholder text - slightly lighter but still readable */
::placeholder {
  color: #666666;
}

.info-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.description-indicator {
  position: relative;
  cursor: help;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  font-size: 12px;
  font-style: normal;
  font-weight: bold;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 100%;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: pre-wrap;
  max-width: 250px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.description-indicator:hover .tooltip {
  visibility: visible;
}

/* Add arrow to tooltip */
.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
</style>