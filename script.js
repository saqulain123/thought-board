document.addEventListener('DOMContentLoaded', function () {
    loadComments();
  });
  
  function switchTab(event, tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
  
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
  }
  
  function getComments() {
    return JSON.parse(localStorage.getItem('comments')) || [];
  }
  
  function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
  }
  
  function generateAvatarURL(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=40`;
  }
  
  function generateCommentHTML(comment, isReply = false, path = []) {
    return `
      <div class="${isReply ? 'reply' : 'comment'}" data-path='${JSON.stringify(path)}'>
        <div class="comment-content">
          <img src="${generateAvatarURL(comment.author)}" alt="${comment.author}">
          <div class="comment-body">
            <strong>${comment.author}</strong>
            <p>${comment.text}</p>
            <div class="comment-actions">
              <span onclick="likeComment(this)" data-likes="${comment.likes}">${comment.likes} Likes</span>
              <span onclick="showReplyBox(this)">Reply</span>
              <span onclick="showEditBox(this)">Edit</span>
              <span onclick="deleteComment(this)">Delete</span>
            </div>
          </div>
        </div>
        <div class="reply-box" style="display: none;">
          <input type="text" placeholder="Your name..." class="reply-name" />
          <input type="text" placeholder="Write a reply..." class="reply-text" />
          <button onclick="addReply(this)">Post</button>
        </div>
        <div class="edit-box" style="display: none;">
          <input type="text" value="${comment.text}" />
          <button onclick="saveEdit(this)">Save</button>
        </div>
        ${comment.replies.map((reply, index) => generateCommentHTML(reply, true, [...path, index])).join('')}
      </div>
    `;
  }
  
  function loadComments() {
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = '';
    const comments = getComments();
    comments.forEach((comment, index) => {
      commentsSection.innerHTML += generateCommentHTML(comment, false, [index]);
    });
  }
  
  function addComment() {
    const nameInput = document.getElementById('nameInput');
    const commentInput = document.getElementById('commentInput');
    const authorName = nameInput.value.trim() || 'Anonymous';
    const commentText = commentInput.value.trim();
  
    if (!commentText) return;
  
    const comments = getComments();
    const newComment = {
      author: authorName,
      text: commentText,
      likes: 0,
      replies: []
    };
  
    comments.unshift(newComment);
    saveComments(comments);
    loadComments();
    commentInput.value = '';
  }
  
  function likeComment(element) {
    let likes = parseInt(element.getAttribute('data-likes')) + 1;
    element.setAttribute('data-likes', likes);
    element.innerText = `${likes} Likes`;
    updateLocalStorage();
  }
  
  function showReplyBox(element) {
    const replyBox = element.closest('.comment, .reply').querySelector('.reply-box');
    replyBox.style.display = replyBox.style.display === 'block' ? 'none' : 'block';
  }
  
  function addReply(button) {
    const replyBox = button.closest('.reply-box');
    const nameInput = replyBox.querySelector('.reply-name');
    const textInput = replyBox.querySelector('.reply-text');
  
    const authorName = nameInput.value.trim() || 'Anonymous';
    const replyText = textInput.value.trim();
  
    if (!replyText) return;
  
    const path = JSON.parse(button.closest('.comment, .reply').getAttribute('data-path'));
    const comments = getComments();
    let target = comments;
    path.forEach(index => target = target[index].replies);
  
    target.push({
      author: authorName,
      text: replyText,
      likes: 0,
      replies: []
    });
  
    saveComments(comments);
    loadComments();
  
    // Clear input fields after reply
    nameInput.value = '';
    textInput.value = '';
  }
  
  function showEditBox(element) {
    const editBox = element.closest('.comment, .reply').querySelector('.edit-box');
    editBox.style.display = editBox.style.display === 'block' ? 'none' : 'block';
  }
  
  function saveEdit(button) {
    const editBox = button.closest('.edit-box');
    const input = editBox.querySelector('input');
    const newText = input.value.trim();
    if (!newText) return;
  
    const path = JSON.parse(button.closest('.comment, .reply').getAttribute('data-path'));
    const comments = getComments();
    let target = comments;
    path.slice(0, -1).forEach(index => target = target[index].replies);
    target[path[path.length - 1]].text = newText;
  
    saveComments(comments);
    loadComments();
  }
  
  function deleteComment(element) {
    const path = JSON.parse(element.closest('.comment, .reply').getAttribute('data-path'));
    const comments = getComments();
    let target = comments;
    path.slice(0, -1).forEach(index => target = target[index].replies);
    target.splice(path[path.length - 1], 1);
  
    saveComments(comments);
    loadComments();
  }
  
  function updateLocalStorage() {
    const comments = [];
    document.querySelectorAll('.comment').forEach(commentEl => {
      comments.push(serializeComment(commentEl));
    });
    saveComments(comments);
  }
  
  function serializeComment(element) {
    const text = element.querySelector('.comment-body p').innerText;
    const author = element.querySelector('.comment-body strong').innerText;
    const likes = parseInt(element.querySelector('.comment-actions span').getAttribute('data-likes'));
    const replies = Array.from(element.querySelectorAll(':scope > .reply')).map(replyEl => serializeComment(replyEl));
  
    return { author, text, likes, replies };
  }