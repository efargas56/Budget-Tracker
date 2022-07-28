let db;

const request = indexedDB.open('entry', 1);


request.onupgradeneeded = function(event) {

  const db = event.target.result;
  db.createObjectStore('new_entry', { autoIncrement: true });
};

request.onsuccess = function(event) {

  db = event.target.result;

  if (navigator.onLine) {
    uploadEntry();
  }
};

request.onerror = function(event) {

  console.log(event.target.errorCode);
};

function saveRecord(record) {

  const transaction = db.transaction(['new_entry'], 'readwrite');

  const entryObjectStore = transaction.objectStore('new_entry');

  entryObjectStore.add(record)
}

function uploadEntry() {

  const transaction = db.transaction(['new_entry'], 'readwrite');

  const entryObjectStore = transaction.objectStore('new_entry');

  const getAllEntries = entryObjectStore.getAll();

  getAllEntries.onsuccess = function() {
    
    if (getAllEntries.result.length > 0) {
      fetch('/api/entry', {
        method: 'POST',
        body: JSON.stringify(getAllEntries.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_entry'], 'readwrite');
          const entryObjectStore = transaction.objectStore('new_entry');
          entryObjectStore.clear();
          alert('A transaction has been uploaded');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadEntry);
