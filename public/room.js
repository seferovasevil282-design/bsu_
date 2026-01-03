const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const selectedFaculty = localStorage.getItem('selectedFaculty');

if (!currentUser || !selectedFaculty) {
    window.location.href = '/';
}

const socket = io();
let blockedUsers = [];
let selectedUserId = null;
let currentPrivateChatUser = null;

// Initialize
document.getElementById('facultyName').textContent = selectedFaculty;

// Join faculty room
socket.emit('join-faculty', { userId: currentUser.id, faculty: selectedFaculty });

// Get blocked users
fetch(`/api/blocked-users/${currentUser.id}`)
    .then(res => res.json())
    .then(data => {
        blockedUsers = data;
    });

// Get daily topic
fetch('/api/daily-topic')
    .then(res => res.json())
    .then(data => {
        document.getElementById('dailyTopicMini').textContent = `⭐ ${data.topic}`;
    });

// Receive previous messages
socket.on('previous-messages', (messages) => {
    messages.forEach(msg => {
        if (!blockedUsers.includes(msg.user_id)) {
            displayMessage(msg);
        }
    });
    scrollToBottom();
});

// Receive new messages
socket.on('new-message', (message) => {
    if (!blockedUsers.includes(message.user_id)) {
        displayMessage(message);
        scrollToBottom();
    }
});

// Display message
function displayMessage(msg) {
    const messagesList = document.getElementById('messagesList');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.user_id === currentUser.id ? 'message-own' : 'message-other'}`;
    
    const time = new Date(msg.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    
    if (msg.user_id !== currentUser.id) {
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar" onclick="showUserInfo(${msg.user_id})">
                    ${msg.profile_picture ? `<img src="${msg.profile_picture}" alt="">` : msg.fullname.charAt(0)}
                </div>
                <div class="message-info">
                    <div class="message-name">${msg.fullname}</div>
                    <div class="message-meta">${msg.degree} - ${msg.course}-ci kurs</div>
                </div>
                <div class="message-menu" onclick="showMessageMenu(${msg.user_id}, this)">⋮</div>
            </div>
            <div class="message-content">${msg.message}</div>
            <div class="message-time">${time}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${msg.message}</div>
            <div class="message-time">${time}</div>
        `;
    }
    
    messagesList.appendChild(messageDiv);
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    socket.emit('send-message', {
        userId: currentUser.id,
        faculty: selectedFaculty,
        message
    });
    
    input.value = '';
    input.style.height = 'auto';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Auto-resize textarea
document.getElementById('messageInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Scroll to bottom
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

// Show user info
function showUserInfo(userId) {
    selectedUserId = userId;
    fetch(`/api/admin/users`)
        .then(res => res.json())
        .then(users => {
            const user = users.find(u => u.id === userId);
            if (user) {
                document.getElementById('modalUserName').textContent = user.fullname;
                document.getElementById('modalUserInfo').textContent = `${user.faculty} - ${user.degree} - ${user.course}-ci kurs`;
                const picture = document.getElementById('modalUserPicture');
                if (user.profile_picture) {
                    picture.innerHTML = `<img src="${user.profile_picture}" alt="">`;
                } else {
                    picture.textContent = user.fullname.charAt(0);
                }
                document.getElementById('userModal').classList.add('active');
            }
        });
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

// Open private chat
function openPrivateChat() {
    currentPrivateChatUser = selectedUserId;
    closeUserModal();
    
    fetch(`/api/admin/users`)
        .then(res => res.json())
        .then(users => {
            const user = users.find(u => u.id === currentPrivateChatUser);
            if (user) {
                document.getElementById('privateChatTitle').textContent = `Şəxsi chat: ${user.fullname}`;
                document.getElementById('privateChatModal').classList.add('active');
                
                // Join private chat
                socket.emit('join-private-chat', {
                    userId: currentUser.id,
                    otherUserId: currentPrivateChatUser
                });
            }
        });
}

// Private messages
socket.on('previous-private-messages', (messages) => {
    const list = document.getElementById('privateMessagesList');
    list.innerHTML = '';
    messages.forEach(msg => {
        displayPrivateMessage(msg);
    });
    scrollPrivateToBottom();
});

socket.on('new-private-message', (message) => {
    if (message.sender_id === currentPrivateChatUser || message.receiver_id === currentPrivateChatUser) {
        displayPrivateMessage(message);
        scrollPrivateToBottom();
    }
});

function displayPrivateMessage(msg) {
    const list = document.getElementById('privateMessagesList');
    const messageDiv = document.createElement('div');
    const isOwn = msg.sender_id === currentUser.id;
    messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
    
    const time = new Date(msg.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${msg.message}</div>
        <div class="message-time">${time}</div>
    `;
    
    list.appendChild(messageDiv);
}

function sendPrivateMessage() {
    const input = document.getElementById('privateMessageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    socket.emit('send-private-message', {
        senderId: currentUser.id,
        receiverId: currentPrivateChatUser,
        message
    });
    
    input.value = '';
}

function handlePrivateKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendPrivateMessage();
    }
}

function closePrivateChat() {
    document.getElementById('privateChatModal').classList.remove('active');
}

function scrollPrivateToBottom() {
    const container = document.getElementById('privateMessagesContainer');
    container.scrollTop = container.scrollHeight;
}

// Block user
async function blockUser() {
    if (confirm('Bu istifadəçini əngəlləmək istədiyinizdən əminsiniz?')) {
        try {
            await fetch('/api/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    blockedUserId: selectedUserId
                })
            });
            blockedUsers.push(selectedUserId);
            alert('İstifadəçi əngəlləndi');
            closeUserModal();
            location.reload();
        } catch (error) {
            alert('Xəta baş verdi');
        }
    }
}

// Report user
async function reportUser() {
    if (confirm('Bu istifadəçini şikayət etmək istədiyinizdən əminsiniz?')) {
        try {
            await fetch('/api/report-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporterId: currentUser.id,
                    reportedUserId: selectedUserId
                })
            });
            alert('Şikayət qeyd edildi');
            closeUserModal();
        } catch (error) {
            alert('Xəta baş verdi');
        }
    }
}

function goBack() {
    window.location.href = '/chat.html';
}
