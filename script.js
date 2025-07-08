const apiUrl = 'http://localhost:3000/items';

    async function fetchItems() {
      try {
        const res = await fetch(apiUrl);
        const items = await res.json();
        const list = document.getElementById('item-list');
        list.innerHTML = '';
        items.forEach(item => {
          const li = document.createElement('li');
          li.className = 'item';

          const text = document.createElement('span');
          text.textContent = item.name;

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
          li.append(text, actions);
          list.appendChild(li);
        });
      } catch (err) {
        console.error(err);
      }
    }

    document.getElementById('item-form').addEventListener('submit', async e => {
      e.preventDefault();
      const input = document.getElementById('item-input');
      const name = input.value.trim();
      if (!name) return;
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      input.value = '';
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
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      fetchItems();
    }

    fetchItems();