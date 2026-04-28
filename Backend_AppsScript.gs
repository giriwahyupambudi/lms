function doGet(e) {
  var sheetName = e.parameter.sheet;
  if (!sheetName) {
    return ContentService.createTextOutput(JSON.stringify({error: "Sheet tidak valid"}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  var rawData = sheet.getDataRange().getValues();
  var displayData = sheet.getDataRange().getDisplayValues();
  
  if (rawData.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Baca nama header secara dinamis & kebal geser posisi
  var headers = rawData[0].map(function(h) {
    return h.toString().toLowerCase().replace(/[^a-z0-9]/g, ''); 
  });
  
  var result = [];
  for (var i = 1; i < rawData.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        // Ambil displayData khusus untuk waktu agar format (00:00) aman
        if (headers[j] === "waktu" || headers[j] === "timestamp") {
           obj[headers[j]] = displayData[i][j];
        } else {
           obj[headers[j]] = rawData[i][j];
        }
        
        // Simpan key dengan huruf asli juga untuk kompatibilitas Admin Panel (CRUD)
        var originalHeader = rawData[0][j].toString().trim();
        if (originalHeader) {
           if (originalHeader.toLowerCase() === "waktu" || originalHeader.toLowerCase() === "timestamp") {
               obj[originalHeader] = displayData[i][j];
           } else {
               obj[originalHeader] = rawData[i][j];
           }
        }
      }
    }
    
    // TAMBAHAN UNTUK ADMIN PANEL: Menyimpan nomor baris untuk Edit/Hapus
    obj.rowNumber = i + 1; 
    
    result.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var sheetName = postData.sheet;
    var data = postData.data; // Dipakai di fungsi admin jika ada JSON string
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Beberapa action lama tidak mengirim sheetName, jadi didefinisikan secara lokal jika diperlukan.
    var sheet = sheetName ? ss.getSheetByName(sheetName) : null;
    
    // ----------------------------------------------------
    // ACTION 1: MENYIMPAN NILAI KUIS/PRAKTIK (FUNGSI LAMA)
    // ----------------------------------------------------
    if (action === 'saveScore') {
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet tidak ditemukan");
      
      var headersRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var newRow = new Array(headersRow.length).fill("");
      
      // Ambil data langsung dari postData (sesuai script lama)
      var pData = postData.data || postData;
      
      for (var i = 0; i < headersRow.length; i++) {
        var headerName = headersRow[i].toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (headerName === "username") newRow[i] = pData.username;
        else if (headerName === "nilai" || headerName === "skor") newRow[i] = pData.nilai;
        else if (headerName === "timestamp") newRow[i] = pData.timestamp;
        else if (headerName === "nama") newRow[i] = pData.nama;
        else if (headerName === "tipe") newRow[i] = pData.tipe;
        else if (headerName === "idmateri" || headerName === "id_materi") newRow[i] = pData.id_materi;
        else if (headerName === "waktu") newRow[i] = pData.waktu;
        else if (headerName.indexOf("jawaban") === 0) {
          var idx = parseInt(headerName.replace("jawaban", "")) - 1;
          if (pData.jawaban && pData.jawaban[idx] !== undefined) {
             newRow[i] = pData.jawaban[idx];
          }
        }
      }
      
      sheet.appendRow(newRow);
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION 2: MENGAMBIL WAKTU TIMER KUIS (FUNGSI LAMA)
    // ----------------------------------------------------
    if (action === "getTimer") {
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet tidak ditemukan");
      var pData = postData.data || postData;
      
      var rawData = sheet.getDataRange().getValues();
      if (rawData.length > 0) {
        var headers = rawData[0].map(function(h) { return h.toString().toLowerCase().replace(/[^a-z0-9]/g, ''); });
        
        var idxUser = headers.indexOf("username");
        var idxMateri = headers.indexOf("idmateri");
        if(idxMateri === -1) idxMateri = headers.indexOf("id_materi");
        var idxWaktu = headers.indexOf("waktuaktif");
        
        if(idxUser !== -1 && idxMateri !== -1 && idxWaktu !== -1) {
          for (var i = rawData.length - 1; i >= 1; i--) {
            if (rawData[i][idxUser] == pData.username && rawData[i][idxMateri] == pData.id_materi) {
              return ContentService.createTextOutput(JSON.stringify({status: "success", waktu_aktif: rawData[i][idxWaktu]}))
                                   .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: "success", waktu_aktif: 0}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION 3: MENYIMPAN/SYNC WAKTU TIMER KUIS (FUNGSI LAMA)
    // ----------------------------------------------------
    if (action === "syncTimer") {
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet tidak ditemukan");
      var pData = postData.data || postData;
      
      var rawData = sheet.getDataRange().getValues();
      var headers = [];
      
      // Jika sheet masih benar-benar kosong, buatkan header otomatis
      if (rawData.length === 0 || rawData[0].length === 0 || rawData[0][0] === "") {
        sheet.getRange(1, 1, 1, 3).setValues([["username", "idmateri", "waktuaktif"]]);
        headers = ["username", "idmateri", "waktuaktif"];
        rawData = sheet.getDataRange().getValues();
      } else {
        headers = rawData[0].map(function(h) { return h.toString().toLowerCase().replace(/[^a-z0-9]/g, ''); });
      }
      
      var idxUser = headers.indexOf("username");
      var idxMateri = headers.indexOf("idmateri");
      if (idxMateri === -1) idxMateri = headers.indexOf("id_materi");
      var idxWaktu = headers.indexOf("waktuaktif");
      
      // Jika ternyata headernya tidak sesuai format, paksa saja ke indeks 0, 1, dan 2
      if (idxUser === -1) idxUser = 0;
      if (idxMateri === -1) idxMateri = 1;
      if (idxWaktu === -1) idxWaktu = 2;
      
      var found = false;
      for (var i = rawData.length - 1; i >= 1; i--) {
        if (rawData[i][idxUser] == pData.username && rawData[i][idxMateri] == pData.id_materi) {
          sheet.getRange(i + 1, idxWaktu + 1).setValue(pData.waktu_aktif);
          found = true;
          break;
        }
      }
      
      if (!found) {
        var newRow = new Array(Math.max(headers.length, 3)).fill("");
        newRow[idxUser] = pData.username;
        newRow[idxMateri] = pData.id_materi;
        newRow[idxWaktu] = pData.waktu_aktif;
        sheet.appendRow(newRow);
      }
      
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // ===============================================
    // ACTION 4: ADD / EDIT DATA (ADMIN PANEL)
    // ===============================================
    if (action === "saveData") {
      if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan");

      var dataToSave;
      try {
        // Karena di admin.html data dikirim sebagai JSON string di dalam JSON,
        // kita parse lagi properti data-nya.
        dataToSave = (typeof data === "string") ? JSON.parse(data) : data;
      } catch (err) {
        throw new Error("Format data tidak valid (bukan JSON)");
      }

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // JIKA MENGEDIT BARIS YANG ADA
      if (postData.rowNumber && postData.rowNumber !== "") {
        var rowNum = parseInt(postData.rowNumber);
        var updateRow = new Array(headers.length).fill("");
        var existingData = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
        
        for (var i = 0; i < headers.length; i++) {
          var h = headers[i].toString().trim(); 
          var hLower = h.toLowerCase();
          
          if (dataToSave[h] !== undefined) {
             updateRow[i] = dataToSave[h];
          } else if (dataToSave[hLower] !== undefined) {
             updateRow[i] = dataToSave[hLower];
          } else {
             updateRow[i] = existingData[i]; 
          }
        }
        sheet.getRange(rowNum, 1, 1, headers.length).setValues([updateRow]);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil diperbarui" }))
                             .setMimeType(ContentService.MimeType.JSON);
      } 
      // JIKA MENAMBAH BARIS BARU
      else {
        var newRow = new Array(headers.length).fill("");
        for (var i = 0; i < headers.length; i++) {
          var h = headers[i].toString().trim();
          var hLower = h.toLowerCase();
          
          if (dataToSave[h] !== undefined) {
             newRow[i] = dataToSave[h];
          } else if (dataToSave[hLower] !== undefined) {
             newRow[i] = dataToSave[hLower];
          }
        }
        sheet.appendRow(newRow);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data baru berhasil ditambahkan" }))
                             .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ===============================================
    // ACTION 5: DELETE DATA (ADMIN PANEL)
    // ===============================================
    if (action === "deleteData") {
      if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan");

      var rowNum = parseInt(postData.rowNumber);
      if (rowNum && rowNum > 1) {
        sheet.deleteRow(rowNum);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil dihapus" }))
                             .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Nomor baris tidak valid");
      }
    }
    
    // ===============================================
    // ACTION 6: UPDATE NILAI LANGSUNG (ADMIN PANEL)
    // ===============================================
    if (action === "updateNilaiByUsernameMateri") {
       var sheetNilai = ss.getSheetByName("listNilai");
       if (!sheetNilai) throw new Error("Sheet listNilai tidak ditemukan");
       
       var targetUser = postData.username;
       var targetMateri = postData.id_materi;
       var newNilai = postData.nilai;
       
       var sheetData = sheetNilai.getDataRange().getValues();
       var headers = sheetData[0];
       var userCol = -1, materiCol = -1, nilaiCol = -1;
       
       for(var i = 0; i < headers.length; i++){
          var h = headers[i].toString().toLowerCase();
          if(h === "username" || h === "nisn") userCol = i;
          if(h === "id_materi" || h === "idmateri" || h === "modul") materiCol = i;
          if(h === "nilai" || h === "skor") nilaiCol = i;
       }
       
       if(userCol === -1 || materiCol === -1 || nilaiCol === -1) {
         throw new Error("Struktur kolom listNilai tidak lengkap (butuh username, id_materi, nilai)");
       }
       
       var updated = false;
       for(var j = sheetData.length - 1; j > 0; j--) {
          var rowUsername = sheetData[j][userCol].toString().trim();
          var rowMateri = sheetData[j][materiCol].toString().trim();
          
          if(rowUsername === targetUser && rowMateri === targetMateri) {
             sheetNilai.getRange(j + 1, nilaiCol + 1).setValue(newNilai);
             updated = true;
             break;
          }
       }
       
       if(updated) {
         return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Nilai berhasil diperbarui" }))
                              .setMimeType(ContentService.MimeType.JSON);
       } else {
         var newRow = new Array(headers.length).fill("");
         newRow[userCol] = targetUser;
         newRow[materiCol] = targetMateri;
         newRow[nilaiCol] = newNilai;
         
         for(var i = 0; i < headers.length; i++){
           var h = headers[i].toString().toLowerCase();
           if(h === "waktu" || h === "timestamp") {
              var now = new Date();
              newRow[i] = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
           }
           if(h === "tipe" || h === "jenis") newRow[i] = "Kuis";
         }
         sheetNilai.appendRow(newRow);
         return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Nilai baru berhasil ditambahkan" }))
                              .setMimeType(ContentService.MimeType.JSON);
       }
    }

    throw new Error("Aksi tidak dikenali: " + action);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.message || error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
