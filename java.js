 // DOM Elements
 const themeToggle = document.getElementById('themeToggle');
 const addSkillBtn = document.getElementById('addSkillBtn');
 const skillsContainer = document.getElementById('skillsContainer');
 const skillNameInput = document.getElementById('skillName');
 const skillCategorySelect = document.getElementById('skillCategory');
 const editModal = document.getElementById('editModal');
 const closeModalBtn = document.querySelector('.close-modal');
 const cancelEditBtn = document.getElementById('cancelEditBtn');
 const saveEditBtn = document.getElementById('saveEditBtn');
 const editSkillName = document.getElementById('editSkillName');
 const editSkillCategory = document.getElementById('editSkillCategory');
 const editSkillProgress = document.getElementById('editSkillProgress');
 const editSkillStatus = document.getElementById('editSkillStatus');
 const toast = document.getElementById('toast');
 const toastClose = document.querySelector('.toast-close');
 const totalSkillsEl = document.getElementById('totalSkills');
 const completedSkillsEl = document.getElementById('completedSkills');
 const inProgressSkillsEl = document.getElementById('inProgressSkills');
 const completionRateEl = document.getElementById('completionRate');
 const milestonesContainer = document.getElementById('milestonesContainer');

 // App State
 let skills = [];
 let currentEditId = null;
 let isDarkTheme = false;

 // Initialize App
 function initApp() {
     loadSkills();
     updateStats();
     updateMilestones();
     setupEventListeners();
 }

 // Event Listeners
 function setupEventListeners() {
     // Theme Toggle
     themeToggle.addEventListener('click', toggleTheme);
     
     // Add Skill
     addSkillBtn.addEventListener('click', addSkill);
     
     // Modal Controls
     closeModalBtn.addEventListener('click', closeModal);
     cancelEditBtn.addEventListener('click', closeModal);
     saveEditBtn.addEventListener('click', saveEditedSkill);
     
     // Toast Close
     toastClose.addEventListener('click', hideToast);
     
     // Form Submission
     skillNameInput.addEventListener('keypress', function(e) {
         if (e.key === 'Enter') {
             addSkill();
         }
     });
 }

 // Theme Management
 function toggleTheme() {
     isDarkTheme = !isDarkTheme;
     document.body.classList.toggle('dark-theme', isDarkTheme);
     
     const themeIcon = themeToggle.querySelector('i');
     const themeText = themeToggle.querySelector('span');
     
     if (isDarkTheme) {
         themeIcon.className = 'fas fa-sun';
         themeText.textContent = 'Light Mode';
     } else {
         themeIcon.className = 'fas fa-moon';
         themeText.textContent = 'Dark Mode';
     }
 }

 // Skills Management
 function addSkill() {
     const name = skillNameInput.value.trim();
     const category = skillCategorySelect.value;
     
     if (!name) {
         showToast('Please enter a skill name', 'error');
         return;
     }
     
     const newSkill = {
         id: Date.now(),
         name,
         category,
         progress: 0,
         status: 'planned',
         createdAt: new Date().toISOString()
     };
     
     skills.push(newSkill);
     saveSkills();
     renderSkills();
     updateStats();
     updateMilestones();
     
     skillNameInput.value = '';
     showToast('Skill added successfully!', 'success');
 }

 function deleteSkill(id) {
     skills = skills.filter(skill => skill.id !== id);
     saveSkills();
     renderSkills();
     updateStats();
     updateMilestones();
     showToast('Skill deleted', 'warning');
 }

 function openEditModal(skill) {
     currentEditId = skill.id;
     editSkillName.value = skill.name;
     editSkillCategory.value = skill.category;
     editSkillProgress.value = skill.progress;
     editSkillStatus.value = skill.status;
     editModal.style.display = 'flex';
 }

 function closeModal() {
     editModal.style.display = 'none';
     currentEditId = null;
 }

 function saveEditedSkill() {
     if (!currentEditId) return;
     
     const skillIndex = skills.findIndex(skill => skill.id === currentEditId);
     if (skillIndex === -1) return;
     
     const name = editSkillName.value.trim();
     const category = editSkillCategory.value;
     const progress = parseInt(editSkillProgress.value);
     const status = editSkillStatus.value;
     
     if (!name) {
         showToast('Please enter a skill name', 'error');
         return;
     }
     
     skills[skillIndex] = {
         ...skills[skillIndex],
         name,
         category,
         progress,
         status
     };
     
     saveSkills();
     renderSkills();
     updateStats();
     updateMilestones();
     closeModal();
     showToast('Skill updated successfully!', 'success');
 }

 // Data Persistence
 function saveSkills() {
     localStorage.setItem('skills', JSON.stringify(skills));
 }

 function loadSkills() {
     const savedSkills = localStorage.getItem('skills');
     if (savedSkills) {
         skills = JSON.parse(savedSkills);
         renderSkills();
     } else {
         // Sample data for first-time users
         skills = [
             {
                 id: 1,
                 name: 'JavaScript',
                 category: 'programming',
                 progress: 75,
                 status: 'in-progress',
                 createdAt: new Date().toISOString()
             },
             {
                 id: 2,
                 name: 'UI Design',
                 category: 'design',
                 progress: 90,
                 status: 'completed',
                 createdAt: new Date(Date.now() - 86400000).toISOString()
             },
             {
                 id: 3,
                 name: 'React',
                 category: 'programming',
                 progress: 30,
                 status: 'in-progress',
                 createdAt: new Date(Date.now() - 172800000).toISOString()
             }
         ];
         saveSkills();
         renderSkills();
     }
 }

 // UI Rendering
 function renderSkills() {
     if (skills.length === 0) {
         skillsContainer.innerHTML = `
             <div class="empty-state">
                 <div class="empty-icon">
                     <i class="fas fa-lightbulb"></i>
                 </div>
                 <div class="empty-text">No skills added yet. Start by adding your first learning goal!</div>
                 <button class="btn btn-primary" onclick="document.getElementById('skillName').focus()">
                     <i class="fas fa-plus"></i> Add Your First Skill
                 </button>
             </div>
         `;
         return;
     }
     
     skillsContainer.innerHTML = '';
     
     skills.forEach(skill => {
         const progressClass = getProgressClass(skill.progress);
         const statusClass = getStatusClass(skill.status);
         const statusText = getStatusText(skill.status);
         const categoryText = getCategoryText(skill.category);
         
         const skillCard = document.createElement('div');
         skillCard.className = `skill-card ${skill.status}`;
         skillCard.innerHTML = `
             <div class="skill-header">
                 <h3 class="skill-title">${skill.name}</h3>
                 <div class="skill-actions">
                     <button class="skill-action-btn edit" onclick="openEditModal(${JSON.stringify(skill).replace(/"/g, '&quot;')})">
                         <i class="fas fa-edit"></i>
                     </button>
                     <button class="skill-action-btn delete" onclick="deleteSkill(${skill.id})">
                         <i class="fas fa-trash"></i>
                     </button>
                 </div>
             </div>
             <span class="skill-category">${categoryText}</span>
             <div class="skill-progress">
                 <div class="progress-bar">
                     <div class="progress-fill ${progressClass}" style="width: ${skill.progress}%"></div>
                 </div>
             </div>
             <div class="skill-status">
                 <span class="status-badge ${statusClass}">${statusText}</span>
                 <div class="status-dropdown">
                     <select class="status-select" onchange="updateSkillStatus(${skill.id}, this.value)">
                         <option value="planned" ${skill.status === 'planned' ? 'selected' : ''}>Planned</option>
                         <option value="in-progress" ${skill.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                         <option value="completed" ${skill.status === 'completed' ? 'selected' : ''}>Completed</option>
                     </select>
                 </div>
             </div>
         `;
         
         skillsContainer.appendChild(skillCard);
     });
 }

 function updateSkillStatus(id, status) {
     const skillIndex = skills.findIndex(skill => skill.id === id);
     if (skillIndex !== -1) {
         skills[skillIndex].status = status;
         saveSkills();
         renderSkills();
         updateStats();
         updateMilestones();
     }
 }

 // Stats and Milestones
 function updateStats() {
     const total = skills.length;
     const completed = skills.filter(skill => skill.status === 'completed').length;
     const inProgress = skills.filter(skill => skill.status === 'in-progress').length;
     const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
     
     totalSkillsEl.textContent = total;
     completedSkillsEl.textContent = completed;
     inProgressSkillsEl.textContent = inProgress;
     completionRateEl.textContent = `${completionRate}%`;
 }

 function updateMilestones() {
     // Get last 5 completed skills
     const completedSkills = skills
         .filter(skill => skill.status === 'completed')
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(0, 5);
     
     if (completedSkills.length === 0) {
         milestonesContainer.innerHTML = `
             <div class="empty-state">
                 <div class="empty-text">No completed skills yet. Keep learning!</div>
             </div>
         `;
         return;
     }
     
     milestonesContainer.innerHTML = '';
     
     completedSkills.forEach(skill => {
         const date = new Date(skill.createdAt).toLocaleDateString();
         const categoryText = getCategoryText(skill.category);
         
         const milestoneItem = document.createElement('div');
         milestoneItem.className = 'milestone-item';
         milestoneItem.innerHTML = `
             <div class="milestone-icon">
                 <i class="fas fa-check"></i>
             </div>
             <div class="milestone-info">
                 <div class="milestone-title">${skill.name}</div>
                 <div class="milestone-date">${categoryText} • Completed on ${date}</div>
             </div>
             <div class="milestone-progress">
                 <div class="milestone-fill" style="width: 100%"></div>
             </div>
         `;
         
         milestonesContainer.appendChild(milestoneItem);
     });
 }

 // Helper Functions
 function getProgressClass(progress) {
     if (progress < 25) return 'progress-beginner';
     if (progress < 50) return 'progress-intermediate';
     if (progress < 75) return 'progress-advanced';
     return 'progress-expert';
 }

 function getStatusClass(status) {
     switch (status) {
         case 'completed': return 'status-completed';
         case 'in-progress': return 'status-in-progress';
         default: return 'status-planned';
     }
 }

 function getStatusText(status) {
     switch (status) {
         case 'completed': return 'Completed';
         case 'in-progress': return 'In Progress';
         default: return 'Planned';
     }
 }

 function getCategoryText(category) {
     switch (category) {
         case 'programming': return 'Programming';
         case 'design': return 'Design';
         case 'language': return 'Language';
         case 'business': return 'Business';
         default: return 'Other';
     }
 }

 function showToast(message, type = 'success') {
     const toastIcon = toast.querySelector('.toast-icon i');
     const toastMessage = toast.querySelector('.toast-message');
     
     toast.className = 'toast';
     toast.classList.add(`toast-${type}`);
     
     switch (type) {
         case 'success':
             toastIcon.className = 'fas fa-check-circle';
             break;
         case 'error':
             toastIcon.className = 'fas fa-exclamation-circle';
             break;
         case 'warning':
             toastIcon.className = 'fas fa-exclamation-triangle';
             break;
     }
     
     toastMessage.textContent = message;
     toast.classList.add('show');
     
     setTimeout(hideToast, 3000);
 }

 function hideToast() {
     toast.classList.remove('show');
 }

 // Initialize the app
 document.addEventListener('DOMContentLoaded', initApp);