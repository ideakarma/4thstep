function encryptData(data, password) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

function decryptData(cipher, password) {
    try {
        return JSON.parse(CryptoJS.AES.decrypt(cipher, password).toString(CryptoJS.enc.Utf8));
    } catch {
        return null;
    }
}

function loadEntries() {
    const useEncryption = document.getElementById('useEncryption').checked;
    const password = document.getElementById('password').value;
    let entries = [];

    if (useEncryption) {
        if (!password) return alert('Enter your encryption password.');
        const cipher = localStorage.getItem('encryptedEntries');
        if (cipher) entries = decryptData(cipher, password) || [];
    } else {
        entries = JSON.parse(localStorage.getItem('plainEntries') || '[]');
    }

    const container = document.getElementById('entries');
    container.innerHTML = entries.map((entry, i) => `
        <div class="border p-4 rounded bg-gray-50 relative">
            <span class="text-sm text-gray-500">${entry.category}</span>
            <h3 class="text-xl font-semibold">${entry.subject}</h3>
            <p><strong>Cause:</strong> ${entry.cause}</p>
            <p><strong>Affected Areas:</strong> ${entry.affected}</p>
            <p><strong>My Part:</strong> ${entry.myPart}</p>
            <button onclick="deleteEntry(${i})" class="absolute top-2 right-2 text-red-500">Delete</button>
        </div>
    `).join('');
}

function addEntry() {
    const affectedCheckboxes = document.querySelectorAll('#affectedAreas input[type="checkbox"]');
    const affected = Array.from(affectedCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)
        .join(', ');

    const entry = {
        category: document.getElementById('category').value,
        subject: document.getElementById('subject').value,
        cause: document.getElementById('cause').value,
        affected: affected,
        myPart: document.getElementById('myPart').value,
    };

    if (!entry.subject || !entry.cause || !entry.affected || !entry.myPart) {
        return alert('Please fill out all fields.');
    }

    const useEncryption = document.getElementById('useEncryption').checked;
    const password = document.getElementById('password').value;

    let entries = [];
    if (useEncryption) {
        if (!password) return alert('Enter your encryption password.');
        const cipher = localStorage.getItem('encryptedEntries');
        entries = cipher ? decryptData(cipher, password) || [] : [];
        entries.push(entry);
        localStorage.setItem('encryptedEntries', encryptData(entries, password));
    } else {
        entries = JSON.parse(localStorage.getItem('plainEntries') || '[]');
        entries.push(entry);
        localStorage.setItem('plainEntries', JSON.stringify(entries));
    }

    // Clear inputs
    document.querySelectorAll('#subject, #cause, #myPart').forEach(el => el.value = '');
    affectedCheckboxes.forEach(checkbox => checkbox.checked = false);

    loadEntries();
}

function deleteEntry(index) {
    const useEncryption = document.getElementById('useEncryption').checked;
    const password = document.getElementById('password').value;
    let entries = useEncryption 
        ? decryptData(localStorage.getItem('encryptedEntries'), password) || [] 
        : JSON.parse(localStorage.getItem('plainEntries') || '[]');

    entries.splice(index, 1);
    localStorage.setItem(useEncryption ? 'encryptedEntries' : 'plainEntries', useEncryption ? encryptData(entries, password) : JSON.stringify(entries));
    loadEntries();
}
function exportEntries(exportType) {
    const useEncryption = document.getElementById('useEncryption').checked;
    const password = document.getElementById('password').value;
    let entries = [];

    if (useEncryption) {
        if (!password) return alert('Enter your encryption password.');
        const cipher = localStorage.getItem('encryptedEntries');
        entries = cipher ? decryptData(cipher, password) || [] : [];
    } else {
        entries = JSON.parse(localStorage.getItem('plainEntries') || '[]');
    }

    if (!entries.length) return alert('No entries to export.');

    if (exportType === 'pdf') {
        // Your styled PDF export code goes here (as finalized before)
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const wrapWidth = pageWidth - margin * 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(30, 30, 30);
        doc.text("AA 4th Step Inventory", pageWidth / 2, 15, { align: "center" });
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(10, 20, pageWidth - 10, 20);

        let y = 30;

   entries.forEach((entry, index) => {
    if (y > 260) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 80, 120);
    doc.text(`${index + 1}. ${entry.category}`, margin, y);
    y += 8;

    // Subject
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Person or Entity:", margin, y);
    doc.setFont("times", "normal");
    const subjectLines = doc.splitTextToSize(entry.subject, wrapWidth);
    doc.text(subjectLines, margin + 35, y);
    y += subjectLines.length * 6 + 4;

    // Cause
    doc.setFont("helvetica", "bold");
    doc.text("Cause:", margin, y);
    doc.setFont("times", "normal");
    const causeLines = doc.splitTextToSize(entry.cause, wrapWidth - 35);
    doc.text(causeLines, margin + 35, y);
    y += causeLines.length * 6 + 4;

    // Affected Areas
    doc.setFont("helvetica", "bold");
    doc.text("Affected Areas:", margin, y);
    doc.setFont("times", "normal");
    const affectedLines = doc.splitTextToSize(entry.affected, wrapWidth - 35);
    doc.text(affectedLines, margin + 35, y);
    y += affectedLines.length * 6 + 4;

    // My Part
    doc.setFont("helvetica", "bold");
    doc.text("My Part:", margin, y);
    doc.setFont("times", "normal");
    const myPartLines = doc.splitTextToSize(entry.myPart, wrapWidth - 35);
    doc.text(myPartLines, margin + 35, y);
    y += myPartLines.length * 6 + 6;

    // Divider
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
});


        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, 290, { align: "right" });
        }

        doc.save('FourthStepInventory.pdf');

    } else if (exportType === 'html') {
        const htmlContent = `
        <html>
        <head>
            <title>AA 4th Step Inventory Export</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 p-8">
            <h1 class="text-3xl font-bold mb-6 text-center">AA 4th Step Inventory</h1>
            ${entries.map(entry => `
            <div class="bg-white shadow rounded-lg p-6 mb-4">
                <div class="mb-2">
                    <span class="text-gray-500 text-sm">${entry.category}</span>
                    <h2 class="text-xl font-semibold">${entry.subject}</h2>
                </div>
                <p><strong class="text-gray-700">Cause:</strong> ${entry.cause}</p>
                <p><strong class="text-gray-700">Affected Areas:</strong> ${entry.affected}</p>
                <p><strong class="text-gray-700">My Part:</strong> ${entry.myPart}</p>
            </div>`).join('')}
        </body>
        </html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.download = 'FourthStepInventory.html';
        link.href = URL.createObjectURL(blob);
        link.click();
    }
}

function clearInventory() {
    if (confirm('Clear your entire inventory?')) {
        localStorage.removeItem('encryptedEntries');
        localStorage.removeItem('plainEntries');
        loadEntries();
    }
}

document.getElementById('useEncryption').onchange = loadEntries;
document.getElementById('password').onchange = loadEntries;
window.onload = loadEntries;

const exportButton = document.getElementById('exportButton');
const exportMenu = document.getElementById('exportMenu');

exportButton.addEventListener('click', () => {
    exportMenu.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!exportButton.contains(e.target) && !exportMenu.contains(e.target)) {
        exportMenu.classList.add('hidden');
    }
});
// Modal functionality
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');

openModal.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

// Close modal when clicking outside content
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
});

// Print functionality for the modal
function printModal() {
    const printContents = document.querySelector('#modalOverlay .relative').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `<div>${printContents}</div>`;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload(); // Reload to restore full JS functionality after printing
}
