// 学习目标管理器 JavaScript

class StudyGoalManager {
    constructor() {
        this.goals = this.loadGoals();
        this.init();
    }

    init() {
        this.renderGoals();
        this.updateStats();
        
        // 绑定回车键添加目标
        document.getElementById('goalTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addGoal();
            }
        });
        
        document.getElementById('goalDescription').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addGoal();
            }
        });

        document.getElementById('totalPages').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addGoal();
            }
        });

        document.getElementById('currentPage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addGoal();
            }
        });
    }

    // 从本地存储加载目标
    loadGoals() {
        const saved = localStorage.getItem('studyGoals');
        const goals = saved ? JSON.parse(saved) : [];
        
        // 迁移旧版本数据
        return goals.map(goal => {
            // 如果是旧版本数据（没有页数信息），保持原样
            if (goal.totalPages === undefined) {
                return goal;
            }
            
            // 确保新版本数据的完整性
            return {
                ...goal,
                currentPage: goal.currentPage || 0,
                totalPages: goal.totalPages || 1,
                progress: goal.totalPages > 0 ? Math.round((goal.currentPage / goal.totalPages) * 100) : goal.progress || 0
            };
        });
    }

    // 保存目标到本地存储
    saveGoals() {
        localStorage.setItem('studyGoals', JSON.stringify(this.goals));
    }

    // 添加新目标
    addGoal() {
        const titleInput = document.getElementById('goalTitle');
        const categorySelect = document.getElementById('goalCategory');
        const descriptionInput = document.getElementById('goalDescription');
        const totalPagesInput = document.getElementById('totalPages');
        const currentPageInput = document.getElementById('currentPage');

        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const description = descriptionInput.value.trim();
        const totalPages = parseInt(totalPagesInput.value) || 0;
        const currentPage = parseInt(currentPageInput.value) || 0;

        if (!title) {
            this.showNotification('请输入目标名称！', 'error');
            titleInput.focus();
            return;
        }

        if (totalPages <= 0) {
            this.showNotification('请输入有效的总页数！', 'error');
            totalPagesInput.focus();
            return;
        }

        if (currentPage < 0 || currentPage > totalPages) {
            this.showNotification('当前页数应该在0到总页数之间！', 'error');
            currentPageInput.focus();
            return;
        }

        const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

        const newGoal = {
            id: Date.now(),
            title: title,
            category: category,
            description: description,
            totalPages: totalPages,
            currentPage: currentPage,
            progress: progress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.goals.unshift(newGoal);
        this.saveGoals();
        this.renderGoals();
        this.updateStats();

        // 清空输入框
        titleInput.value = '';
        descriptionInput.value = '';
        totalPagesInput.value = '';
        currentPageInput.value = '0';
        categorySelect.value = '编程';

        this.showNotification('目标添加成功！', 'success');
        titleInput.focus();
    }

    // 删除目标
    deleteGoal(id) {
        if (confirm('确定要删除这个目标吗？')) {
            this.goals = this.goals.filter(goal => goal.id !== id);
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            this.showNotification('目标已删除', 'success');
        }
    }

    // 更新页数进度
    updateProgress(id, change) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            const newPage = Math.max(0, Math.min(goal.totalPages, goal.currentPage + change));
            goal.currentPage = newPage;
            goal.progress = goal.totalPages > 0 ? Math.round((goal.currentPage / goal.totalPages) * 100) : 0;
            goal.updatedAt = new Date().toISOString();
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            
            if (goal.progress >= 100) {
                this.showNotification(`🎉 恭喜完成目标："${goal.title}"！`, 'success');
            }
        }
    }

    // 直接设置当前页数
    setCurrentPage(id, page) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.currentPage = Math.max(0, Math.min(goal.totalPages, page));
            goal.progress = goal.totalPages > 0 ? Math.round((goal.currentPage / goal.totalPages) * 100) : 0;
            goal.updatedAt = new Date().toISOString();
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            
            if (goal.progress >= 100) {
                this.showNotification(`🎉 恭喜完成目标："${goal.title}"！`, 'success');
            }
        }
    }

    // 渲染目标列表
    renderGoals() {
        const goalsList = document.getElementById('goalsList');
        
        if (this.goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <h3>还没有学习目标</h3>
                    <p>添加你的第一个学习目标开始旅程吧！</p>
                </div>
            `;
            return;
        }

        const goalsHTML = this.goals.map(goal => this.createGoalHTML(goal)).join('');
        goalsList.innerHTML = goalsHTML;
    }

    // 创建单个目标的HTML
    createGoalHTML(goal) {
        const progressPercentage = Math.round(goal.progress);
        const isCompleted = goal.progress >= 100;
        const createdDate = new Date(goal.createdAt).toLocaleDateString('zh-CN');
        
        // 处理旧版本数据（没有页数信息的目标）
        const hasPageInfo = goal.totalPages !== undefined;
        const currentPage = goal.currentPage || 0;
        const totalPages = goal.totalPages || 1;
        
        return `
            <div class="goal-item ${isCompleted ? 'completed' : ''}">
                <div class="goal-line">
                    <div class="goal-basic-info">
                        <div class="goal-category">${goal.category}</div>
                        <div>
                            <div class="goal-title" style="font-size: 1.1rem; font-weight: 600; color: #2c3e50; margin-bottom: 2px;">${this.escapeHtml(goal.title)}</div>
                            ${goal.description ? `<div style="font-size: 0.85rem; color: #6c757d;">${this.escapeHtml(goal.description)}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="goal-progress-info">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.9rem; color: #495057; min-width: 80px;">
                                ${hasPageInfo ? `${currentPage}/${totalPages}页` : '进度'}
                            </span>
                            <div class="progress-bar-inline">
                                <div class="progress-fill-inline" style="width: ${progressPercentage}%"></div>
                            </div>
                            <span style="font-size: 0.9rem; font-weight: 600; color: #667eea; min-width: 35px;">${progressPercentage}%</span>
                        </div>
                        
                        ${hasPageInfo ? `
                            <input type="number" class="page-input-small" min="0" max="${totalPages}" 
                                   value="${currentPage}" title="跳转到页数"
                                   onchange="goalManager.setCurrentPage(${goal.id}, parseInt(this.value))">
                        ` : ''}
                    </div>
                    
                    <div class="goal-controls-inline">
                        ${hasPageInfo ? `
                            <button class="btn-small btn-decrease" onclick="goalManager.updateProgress(${goal.id}, -10)" 
                                    ${currentPage <= 0 ? 'disabled' : ''} title="减少10页">-10</button>
                            <button class="btn-small btn-decrease" onclick="goalManager.updateProgress(${goal.id}, -1)" 
                                    ${currentPage <= 0 ? 'disabled' : ''} title="减少1页">-1</button>
                            <button class="btn-small btn-increase" onclick="goalManager.updateProgress(${goal.id}, 1)" 
                                    ${isCompleted ? 'disabled' : ''} title="增加1页">+1</button>
                            <button class="btn-small btn-increase" onclick="goalManager.updateProgress(${goal.id}, 10)" 
                                    ${isCompleted ? 'disabled' : ''} title="增加10页">+10</button>
                        ` : `
                            <button class="btn-small btn-decrease" onclick="goalManager.updateProgress(${goal.id}, -10)" 
                                    ${goal.progress <= 0 ? 'disabled' : ''} title="减少10%">-10%</button>
                            <button class="btn-small btn-decrease" onclick="goalManager.updateProgress(${goal.id}, -5)" 
                                    ${goal.progress <= 0 ? 'disabled' : ''} title="减少5%">-5%</button>
                            <button class="btn-small btn-increase" onclick="goalManager.updateProgress(${goal.id}, 5)" 
                                    ${isCompleted ? 'disabled' : ''} title="增加5%">+5%</button>
                            <button class="btn-small btn-increase" onclick="goalManager.updateProgress(${goal.id}, 10)" 
                                    ${isCompleted ? 'disabled' : ''} title="增加10%">+10%</button>
                        `}
                        <button class="btn-small btn-delete-small" onclick="goalManager.deleteGoal(${goal.id})" title="删除目标">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新统计信息
    updateStats() {
        const total = this.goals.length;
        const completed = this.goals.filter(goal => goal.progress >= 100).length;
        const avgProgress = total > 0 ? 
            Math.round(this.goals.reduce((sum, goal) => sum + goal.progress, 0) / total) : 0;

        document.getElementById('totalGoals').textContent = total;
        document.getElementById('completedGoals').textContent = completed;
        document.getElementById('averageProgress').textContent = `${avgProgress}%`;
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // 添加通知样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .empty-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .goal-item.completed {
                opacity: 0.8;
                border-left: 5px solid #28a745;
            }
            .goal-item.completed .goal-title {
                text-decoration: line-through;
                color: #6c757d;
            }
        `;
        
        if (!document.querySelector('#dynamic-styles')) {
            style.id = 'dynamic-styles';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // HTML转义
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.goals, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `学习目标_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('数据导出成功！', 'success');
    }

    // 导入数据
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedGoals = JSON.parse(e.target.result);
                if (Array.isArray(importedGoals)) {
                    this.goals = importedGoals;
                    this.saveGoals();
                    this.renderGoals();
                    this.updateStats();
                    this.showNotification('数据导入成功！', 'success');
                } else {
                    throw new Error('无效的数据格式');
                }
            } catch (error) {
                this.showNotification('导入失败：数据格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 全局函数，供HTML调用
function addGoal() {
    goalManager.addGoal();
}

// 初始化应用
const goalManager = new StudyGoalManager();

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N 添加新目标
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('goalTitle').focus();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('学习目标管理器已加载');
    
    // 焦点设置到标题输入框
    document.getElementById('goalTitle').focus();
});