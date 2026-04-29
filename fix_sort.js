const fs = require('fs');

let content = fs.readFileSync('admin.html', 'utf-8');

// Add sorting functions
const sort_func = `
    // Sorting State
    let sortState = {
      materi: { col: '', asc: true },
      nilai: { col: '', asc: true },
      user: { col: '', asc: true }
    };

    function handleSort(table, col) {
      if (sortState[table].col === col) {
        sortState[table].asc = !sortState[table].asc;
      } else {
        sortState[table].col = col;
        sortState[table].asc = true;
      }
      
      document.querySelectorAll('.sort-icon-' + table).forEach(el => el.innerHTML = '<i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i>');
      let iconEl = document.getElementById('sort_' + table + '_' + col);
      if (iconEl) {
         iconEl.innerHTML = sortState[table].asc ? '<i data-lucide="chevron-up" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i>' : '<i data-lucide="chevron-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i>';
      }
      lucide.createIcons();

      if (table === 'materi') renderTableMateri();
      if (table === 'nilai') renderTableNilai();
      if (table === 'user') renderTableUser();
    }

`;

content = content.replace("    // Helper Fungsi", sort_func + "    // Helper Fungsi");

// Update Materi Header
const materi_header_old = '<tr><th>Modul / Judul</th><th>Kelas</th><th>Status</th><th style="text-align:center">Aksi</th></tr>';
const materi_header_new = `<tr>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('materi', 'judul')">Modul / Judul <span id="sort_materi_judul" class="sort-icon-materi"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('materi', 'kelas')">Kelas <span id="sort_materi_kelas" class="sort-icon-materi"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('materi', 'status')">Status <span id="sort_materi_status" class="sort-icon-materi"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="text-align:center">Aksi</th>
                  </tr>`;
content = content.replace(materi_header_old, materi_header_new);

// Update Materi Render
const materi_render_old = "      let html = '';\n      filtered.forEach((m, index) => {";
const materi_render_new = `      if (sortState.materi.col) {
          filtered.sort((a, b) => {
              let valA = '', valB = '';
              if (sortState.materi.col === 'judul') {
                  valA = (getVal(a, ['judul', 'materi', 'namamateri']) || "").toLowerCase();
                  valB = (getVal(b, ['judul', 'materi', 'namamateri']) || "").toLowerCase();
              } else if (sortState.materi.col === 'kelas') {
                  valA = (getVal(a, ['kelas', 'tingkat']) || "").toLowerCase();
                  valB = (getVal(b, ['kelas', 'tingkat']) || "").toLowerCase();
              } else if (sortState.materi.col === 'status') {
                  valA = (getVal(a, ['status']) || "").toLowerCase();
                  valB = (getVal(b, ['status']) || "").toLowerCase();
              }
              if (valA < valB) return sortState.materi.asc ? -1 : 1;
              if (valA > valB) return sortState.materi.asc ? 1 : -1;
              return 0;
          });
      }

      let html = '';
      filtered.forEach((m, index) => {`;
content = content.replace(materi_render_old, materi_render_new);

// Update User Header
const user_header_old = '<tr><th>Nama Pengguna</th><th>Username / NISN</th><th>Kelas</th><th style="text-align:center">Aksi</th></tr>';
const user_header_new = `<tr>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('user', 'nama')">Nama Pengguna <span id="sort_user_nama" class="sort-icon-user"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('user', 'username')">Username / NISN <span id="sort_user_username" class="sort-icon-user"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="cursor:pointer; user-select:none;" onclick="handleSort('user', 'kelas')">Kelas <span id="sort_user_kelas" class="sort-icon-user"><i data-lucide="chevrons-up-down" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-left:4px;"></i></span></th>
                    <th style="text-align:center">Aksi</th>
                  </tr>`;
content = content.replace(user_header_old, user_header_new);

// Update User Render
const user_render_old = "      let html = '';\n      filtered.forEach((u, index) => {";
const user_render_new = `      if (sortState.user.col) {
          filtered.sort((a, b) => {
              let valA = '', valB = '';
              if (sortState.user.col === 'nama') {
                  valA = (getVal(a, ['nama', 'namalengkap', 'namasiswa']) || "").toLowerCase();
                  valB = (getVal(b, ['nama', 'namalengkap', 'namasiswa']) || "").toLowerCase();
              } else if (sortState.user.col === 'username') {
                  valA = (getVal(a, ['username', 'nisn']) || "").toLowerCase();
                  valB = (getVal(b, ['username', 'nisn']) || "").toLowerCase();
              } else if (sortState.user.col === 'kelas') {
                  valA = (getVal(a, ['kelas', 'tingkat']) || "").toLowerCase();
                  valB = (getVal(b, ['kelas', 'tingkat']) || "").toLowerCase();
              }
              if (valA < valB) return sortState.user.asc ? -1 : 1;
              if (valA > valB) return sortState.user.asc ? 1 : -1;
              return 0;
          });
      }

      let html = '';
      filtered.forEach((u, index) => {`;
content = content.replace(user_render_old, user_render_new);

fs.writeFileSync('admin.html', content, 'utf-8');
console.log("Done");
