const apiUrl = 'http://localhost:3000/items';

async function fetchItems() {
  try {
    const res = await fetch(apiUrl, { credentials: 'include' });
    const items = await res.json();
    const list = document.getElementById('item-list');
    list.innerHTML = '';

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item';

      // 1) 아이템 이름
      const text = document.createElement('span');
      text.textContent = item.name;
      li.append(text);

      // 2) 설명 (있으면)
      if (item.description) {
        const desc = document.createElement('p');
        desc.textContent = item.description;
        li.append(desc);
      }

      // 3) 이미지 (있으면)
      if (item.imageUrl) {
        const img = document.createElement('img');
        img.src = `http://localhost:3000${item.imageUrl}`;
        img.style.maxWidth = '200px';
        img.style.display = 'block';
        img.style.margin = '8px 0';
        li.append(img);
      }

      // 4) 수정/삭제 버튼
      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.className = 'edit-btn';
      editBtn.onclick = () => editItem(item);

      const delBtn = document.createElement('button');
      delBtn.textContent = '삭제';
      delBtn.className = 'delete-btn';
      delBtn.onclick = () => deleteItem(item.id);

      actions.append(editBtn, delBtn);
      li.append(actions);

      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('item-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  await fetch(apiUrl, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  form.reset();
  fetchItems();
});

async function editItem(item) {
  const newName = prompt('새 이름을 입력하세요', item.name);
  if (!newName) return;

  await fetch(`${apiUrl}/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  });

  fetchItems();
}

async function deleteItem(id) {
  if (!confirm('정말 삭제하시겠어요?')) return;

  await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  fetchItems();
}

// 초기 데이터 로드
fetchItems();
