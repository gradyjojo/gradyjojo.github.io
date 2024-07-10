// Menghubungkan setiap link navigasi untuk mengubah halaman sesuai data-id
document.querySelectorAll("nav a").forEach((e) => e.addEventListener("click", (_) => change(e.dataset.id)));

// Fungsi untuk mengubah panel berdasarkan nomor panel yang dipilih
function change(n) {
  let panels = document.querySelectorAll("main section");
  panels.forEach((p) => p.classList.remove("active"));
  panels[n - 1].classList.add("active");
}

// Fungsi untuk mengelola dropdown, menampilkan dan menyembunyikannya berdasarkan ID
function toggleDropdown(id) {
  const dropdowns = document.querySelectorAll(".dropdown-content");
  dropdowns.forEach((dropdown) => {
    if (dropdown.id !== id) {
      dropdown.classList.remove("show");
    }
  });
  document.getElementById(id).classList.toggle("show");
}

// Fungsi untuk memilih semua opsi dalam dropdown berdasarkan sumber checkbox
function selectAll(dropdownId, source) {
  const checkboxes = document.querySelectorAll(`#${dropdownId} .option${dropdownId.charAt(dropdownId.length - 1)}`);
  checkboxes.forEach((checkbox) => (checkbox.checked = source.checked));
}

// Menutup dropdown saat mengklik di luar area dropdown
window.onclick = function (event) {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => dropdown.classList.remove("show"));
  }
};

// Fungsi untuk menampilkan halaman berdasarkan ID halaman yang dipilih dan mengatur status tombol
function showPage(pageId, btn) {
  // Sembunyikan semua halaman
  var pages = document.getElementsByClassName("page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }

  // Menampilkan halaman yang dipilih
  document.getElementById(pageId).style.display = "block";

  // Menghapus kelas "active-button" dari semua tombol
  var buttons = document.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active-button");
    buttons[i].classList.add("inactive-button");
  }

  // Menambahkan kelas "active-button" ke tombol yang diklik
  btn.classList.add("active-button");
  btn.classList.remove("inactive-button");
}

// Menampilkan halaman pertama secara default dan menetapkan tombol pertama sebagai aktif
window.onload = function () {
  showPage("page-1", document.getElementById("btn-1"));
};

// Chart & KPI
document.addEventListener("DOMContentLoaded", function () {
  let data = []; // Variabel scope global

  // Mengambil data dari data.json
  fetch("../Asset/data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((jsonData) => {
      data = jsonData; // Assign fetched data to higher scope variable
      populateKompositDropdown(data); // Populate komposit dropdown dynamically
      populateYearDropdown(data); // Populate year dropdown dynamically
      updateKPI(data); // Initial update without filter
      updateCharts(data, true); // Initial update without filter
    });

  // Fungsi untuk mengisi dropdown komposit secara dinamis
  function populateKompositDropdown(data) {
    const dropdownContent = document.getElementById("dropdown-content1");
    dropdownContent.innerHTML = ""; // Menghapus konten dropdown yang ada

    const categories = [
      { value: "1", text: "Sangat Rentan" },
      { value: "2", text: "Rentan" },
      { value: "3", text: "Agak Rentan" },
      { value: "4-5-6", text: "Tahan" },
    ];

    // Menambahkan opsi "Pilih Semua"
    const selectAllLabel = document.createElement("label");
    const selectAllInput = document.createElement("input");
    selectAllInput.type = "checkbox";
    selectAllInput.id = "select-all1";
    selectAllInput.onclick = function () {
      const checkboxes = dropdownContent.querySelectorAll(".option1");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllInput.checked;
      });
      applyFilters();
    };
    selectAllLabel.appendChild(selectAllInput);
    selectAllLabel.appendChild(document.createTextNode(" Pilih Semua"));
    dropdownContent.appendChild(selectAllLabel);

    categories.forEach((category) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "option1";
      input.value = category.value;
      input.onclick = applyFilters;
      label.appendChild(input);
      label.appendChild(document.createTextNode(category.text));
      dropdownContent.appendChild(label);
    });
  }

  // Fungsi untuk mengisi dropdown tahun secara dinamis
  function populateYearDropdown(data) {
    const dropdownContent = document.getElementById("dropdown-content2");
    dropdownContent.innerHTML = ""; // Menghapus konten dropdown yang ada

    // Mengambil tahun-tahun unik dari data
    const uniqueYears = [...new Set(data.map((item) => item.Tahun.split("-")[0]))].sort().reverse();

    // Menambahkan opsi "Pilih Semua"
    const selectAllLabel = document.createElement("label");
    const selectAllInput = document.createElement("input");
    selectAllInput.type = "checkbox";
    selectAllInput.id = "select-all2";
    selectAllInput.onclick = function () {
      const checkboxes = dropdownContent.querySelectorAll(".option2");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllInput.checked;
      });
      applyFilters();
    };
    selectAllLabel.appendChild(selectAllInput);
    selectAllLabel.appendChild(document.createTextNode(" Pilih Semua"));
    dropdownContent.appendChild(selectAllLabel);

    uniqueYears.forEach((year) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "option2";
      input.value = year;
      input.onclick = applyFilters;
      label.appendChild(input);
      label.appendChild(document.createTextNode(year));
      dropdownContent.appendChild(label);
    });
  }

  // Fungsi untuk menerapkan filter berdasarkan tahun dan komposit yang dipilih
  function applyFilters() {
    const selectedYears = Array.from(document.querySelectorAll("#dropdown-content2 .option2:checked")).map((checkbox) => checkbox.value);

    const selectedKomposit = Array.from(document.querySelectorAll("#dropdown-content1 .option1:checked")).map((checkbox) => checkbox.value);

    // Menggunakan semua tahun, jika tidak ada komposit yang dipilih
    if (selectedYears.length === 0) {
      selectedYears.push(...new Set(data.map((item) => item.Tahun.split("-")[0])));
    }

    // Menggunakan semua komposit, jika tidak ada komposit yang dipilih
    if (selectedKomposit.length === 0) {
      selectedKomposit.push("1", "2", "3", "4", "5", "6");
    }

    // Menggabungkan nilai "4", "5", dan "6" menjadi satu kategori "Tahan"
    const kompositValues = selectedKomposit.flatMap((value) => {
      if (value === "4-5-6") {
        return ["4", "5", "6"];
      }
      return value;
    });

    // Memfilter data berdasarkan tahun dan komposit yang dipilih
    const filteredData = data.filter((item) => selectedYears.includes(item.Tahun.split("-")[0]) && kompositValues.includes(item.Komposit.toString()));

    updateKPI(filteredData); // Update with filtered data
    updateCharts(filteredData, false); // Update with filtered data
  }

  // Fungsi untuk mengosongkan pilihan pada dropdown komposit dan tahun
  function resetDropdowns() {
    // Reset dropdown komposit
    const checkboxes1 = document.querySelectorAll("#dropdown-content1 .option1");
    checkboxes1.forEach((checkbox) => (checkbox.checked = false));
    document.getElementById("select-all1").checked = false;

    // Reset dropdown tahun
    const checkboxes2 = document.querySelectorAll("#dropdown-content2 .option2");
    checkboxes2.forEach((checkbox) => (checkbox.checked = false));
    document.getElementById("select-all2").checked = false;
  }

  // Tombol reset
  const resetButton = document.getElementById("reset-btn");
  resetButton.addEventListener("click", function () {
    resetDropdowns(); // Reset dropdown komposit dan tahun
    updateKPI(data); // Update data tanpa filter
    updateCharts(data, false); // Update data tanpa filter
  });

  // Fungsi untuk menghitung rata-rata dari suatu properti dalam data (untuk informasi KPI)
  function calculateAverageKPI(data, property) {
    const values = [];

    data.forEach((item) => {
      const value = parseFloat(item[property]);
      if (!isNaN(value)) {
        values.push(value);
      }
    });

    if (values.length === 0) {
      return NaN;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const averageKPI = parseFloat(avg.toFixed(2));

    return averageKPI;
  }

  // Fungsi untuk melakukan pembaruan KPI berdasarkan data yang difilter
  function updateKPI(data) {
    const ncprAverages = calculateAverageKPI(data, "NCPR");
    const kemiskinanAverages = calculateAverageKPI(data, "Kemiskinan");
    const pengeluaranPanganAverages = calculateAverageKPI(data, "Pengeluaran_Pangan");
    const tanpaListrikAverages = calculateAverageKPI(data, "Tanpa_Listrik");
    const tanpaAirBersihAverages = calculateAverageKPI(data, "Tanpa_Air_Bersih");
    const lamaSekolahPerempuanAverages = calculateAverageKPI(data, "Lama_Sekolah_Perempuan");
    const rasioTenagaKesehatanAverages = calculateAverageKPI(data, "Rasio_Tenaga_Kesehatan");
    const angkaHarapanHidupAverages = calculateAverageKPI(data, "Angka_Harapan_Hidup");
    const stuntingAverages = calculateAverageKPI(data, "Stunting");

    // Melakukan pembaruan elemen HTML dengan nilai KPI yang telah dihitung
    updateKPIElement("#page-1 .chart-2 .card-title p", ncprAverages, "NCPR");
    updateKPIElement("#page-2 .chart-2 .card-title p", kemiskinanAverages, "Kemiskinan", "%");
    updateKPIElement("#page-3 .chart-2 .card-title p", pengeluaranPanganAverages, "Pengeluaran_Pangan", "%");
    updateKPIElement("#page-4 .chart-2 .card-title p", tanpaListrikAverages, "Tanpa_Listrik", "%");
    updateKPIElement("#page-5 .chart-2 .card-title p", tanpaAirBersihAverages, "Tanpa_Air_Bersih", "%");
    updateKPIElement("#page-6 .chart-2 .card-title p", parseFloat(lamaSekolahPerempuanAverages).toFixed(0), "Lama_Sekolah_Perempuan", " tahun");
    updateKPIElement("#page-7 .chart-2 .card-title p", rasioTenagaKesehatanAverages, "Rasio_Tenaga_Kesehatan");
    updateKPIElement("#page-8 .chart-2 .card-title p", parseFloat(angkaHarapanHidupAverages).toFixed(0), "Angka_Harapan_Hidup", " tahun");
    updateKPIElement("#page-9 .chart-2 .card-title p", stuntingAverages, "Stunting", "%");
  }

  // Fungsi untuk memperbarui elemen KPI dan mengubah warna berdasarkan nilai
  function updateKPIElement(selector, value, type, unit = "") {
    const element = document.querySelector(selector);
    element.textContent = value + unit;

    // Ubah warna berdasarkan nilai
    if (type === "NCPR") {
      if (value >= 1) {
        element.style.color = "#FF967E"; // Warna untuk NCPR >= 1
      } else {
        element.style.color = "#18B87E"; // Warna untuk NCPR < 1
      }
    } else if (type === "Kemiskinan") {
      if (value >= 20) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Pengeluaran_Pangan") {
      if (value >= 50) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Tanpa_Listrik") {
      if (value >= 30) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Tanpa_Air_Bersih") {
      if (value >= 50) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Lama_Sekolah_Perempuan") {
      if (value <= 7.5) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Rasio_Tenaga_Kesehatan") {
      if (value >= 15) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Angka_Harapan_Hidup") {
      if (value <= 64) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    } else if (type === "Stunting") {
      if (value >= 30) {
        element.style.color = "#FF967E";
      } else {
        element.style.color = "#18B87E";
      }
    }
  }

  // Fungsi untuk menghitung rata-rata properti dari setiap kabupaten/kota dalam data (untuk informasi Chart)
  function calculateAverageCharts(data, property) {
    const groupedData = {};
    data.forEach((item) => {
      if (!groupedData[item.Kabupaten_Kota]) {
        groupedData[item.Kabupaten_Kota] = [];
      }
      const value = parseFloat(item[property]);
      if (!isNaN(value)) {
        groupedData[item.Kabupaten_Kota].push(value);
      }
    });

    const averageCharts = {};
    Object.keys(groupedData).forEach((kabupaten) => {
      const sum = groupedData[kabupaten].reduce((acc, val) => acc + val, 0);
      const avg = sum / groupedData[kabupaten].length;

      // Memodifikasi pembulatan nilai
      let roundedAvg;
      if (avg > 4) {
        roundedAvg = Math.ceil(avg * 100) / 100; // Bulatkan ke atas dua angka di belakang koma
      } else {
        roundedAvg = parseFloat(avg.toFixed(2)); // Bulatkan ke bawah atau sesuai ke dua angka di belakang koma
      }

      averageCharts[kabupaten] = roundedAvg;
    });

    return averageCharts;
  }

  // Fungsi untuk melakukan pembaruan Charts berdasarkan data yang difilter
  function updateCharts(data, isInitial) {
    const ncprAverages = calculateAverageCharts(data, "NCPR");
    const kemiskinanAverages = calculateAverageCharts(data, "Kemiskinan");
    const pengeluaranPanganAverages = calculateAverageCharts(data, "Pengeluaran_Pangan");
    const tanpaListrikAverages = calculateAverageCharts(data, "Tanpa_Listrik");
    const tanpaAirBersihAverages = calculateAverageCharts(data, "Tanpa_Air_Bersih");
    const lamaSekolahPerempuanAverages = calculateAverageCharts(data, "Lama_Sekolah_Perempuan");
    const rasioTenagaKesehatanAverages = calculateAverageCharts(data, "Rasio_Tenaga_Kesehatan");
    const angkaHarapanHidupAverages = calculateAverageCharts(data, "Angka_Harapan_Hidup");
    const stuntingAverages = calculateAverageCharts(data, "Stunting");

    // Fungsi untuk mengambil top 10 nilai rata-rata
    // Diurutkan dari terbesar ke terkecil
    function getTop10Desc(data) {
      return Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    }

    // Diurutkan dari terkecil ke terbesar
    function getTop10Asc(data) {
      return Object.entries(data)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 10);
    }

    const top10Ncpr = getTop10Desc(ncprAverages);
    const top10Kemiskinan = getTop10Desc(kemiskinanAverages);
    const top10PengeluaranPangan = getTop10Desc(pengeluaranPanganAverages);
    const top10TanpaListrik = getTop10Desc(tanpaListrikAverages);
    const top10TanpaAirBersih = getTop10Desc(tanpaAirBersihAverages);
    const top10LamaSekolahPerempuan = getTop10Asc(lamaSekolahPerempuanAverages);
    const top10RasioTenagaKerja = getTop10Desc(rasioTenagaKesehatanAverages);
    const top10AngkaHarapanHidup = getTop10Asc(angkaHarapanHidupAverages);
    const top10Stunting = getTop10Desc(stuntingAverages);

    // Menghapus Charts yang ada jika sudah ada
    function clearExistingCharts() {
      for (let i = 1; i <= 9; i++) {
        const chart = Chart.getChart(`myChart-${i}`);
        if (chart) {
          chart.destroy();
        }
      }
    }

    if (!isInitial) {
      clearExistingCharts();
    }

    // Membuat Chart untuk masing-masing indikator
    createChart(
      document.getElementById("myChart-1").getContext("2d"),
      top10Ncpr.map((item) => item[0]),
      top10Ncpr.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Nilai NCPR (Tinggi ke Rendah)",
      "Rasio Konsumsi Normatif Kapita Terhadap Ketersediaan Bersih Karbohidrat per Daerah",
      "Rata-rata NCPR"
    );
    createChart(
      document.getElementById("myChart-2").getContext("2d"),
      top10Kemiskinan.map((item) => item[0]),
      top10Kemiskinan.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Persentase Angka Kemiskinan (Tinggi ke Rendah)",
      "Persentase Penduduk yang Hidup Dibawah Garis Kemiskinan per Daerah",
      "Rata-rata Kemiskinan (%)"
    );
    createChart(
      document.getElementById("myChart-3").getContext("2d"),
      top10PengeluaranPangan.map((item) => item[0]),
      top10PengeluaranPangan.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Persentase Jumlah Pengeluaran Pangan (Tinggi ke Rendah)",
      "Persentase Rumah Tangga dengan Pengeluaran Pangan > 65% Total Konsumsi per Daerah",
      "Rata-rata Pengeluaran Pangan (%)"
    );
    createChart(
      document.getElementById("myChart-4").getContext("2d"),
      top10TanpaListrik.map((item) => item[0]),
      top10TanpaListrik.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Persentase Tanpa Listrik (Tinggi ke Rendah)",
      "Persentase Rumah Tangga yang Tidak Memiliki Akses Terhadap Listrik per Daerah",
      "Rata-rata Tanpa Listrik (%)"
    );
    createChart(
      document.getElementById("myChart-5").getContext("2d"),
      top10TanpaAirBersih.map((item) => item[0]),
      top10TanpaAirBersih.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Persentase Tanpa Air Bersih (Tinggi ke Rendah)",
      "Persentase Rumah Tangga yang Tidak Memiliki Akses ke Air Minum per Daerah",
      "Rata-rata Tanpa Air Bersih (%)"
    );
    createChart(
      document.getElementById("myChart-6").getContext("2d"),
      top10LamaSekolahPerempuan.map((item) => item[0]),
      top10LamaSekolahPerempuan.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Lama Waktu Perempuan Sekolah (Rendah ke Tinggi)",
      "Lama Sekolah (dalam Tahun) Perempuan Berusia 15 Tahun ke atas per Daerah",
      "Rata-rata Lama Sekolah Perempuan (tahun)"
    );
    createChart(
      document.getElementById("myChart-7").getContext("2d"),
      top10RasioTenagaKerja.map((item) => item[0]),
      top10RasioTenagaKerja.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Rasio Tenaga Kesehatan (Tinggi ke Rendah)",
      "Rasio Penduduk per Tenaga Kesehatan Terhadap Tingkat Kepadatan Penduduk per Daerah",
      "Rata-rata Rasio Tenaga Kesehatan"
    );
    createChart(
      document.getElementById("myChart-8").getContext("2d"),
      top10AngkaHarapanHidup.map((item) => item[0]),
      top10AngkaHarapanHidup.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Angka Harapan Hidup (Rendah ke Tinggi)",
      "Angka Harapan Hidup (dalam Tahun) per Daerah",
      "Rata-rata Angka Harapan Hidup (tahun)"
    );
    createChart(
      document.getElementById("myChart-9").getContext("2d"),
      top10Stunting.map((item) => item[0]),
      top10Stunting.map((item) => item[1]),
      "Top 10 Daerah Berdasarkan Persentase Stunting (Tinggi ke Rendah)",
      "Persentase Balita dengan Tinggi Badan Dibawah Standar (Stunting) per Daerah",
      "Rata-rata Stunting (%)"
    );
  }

  // Fungsi untuk membuat chart menggunakan Chart.js
  function createChart(ctx, labels, data, Title, subTitle, xTitle) {
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(252, 255, 102, 1)"); // Start color
    gradient.addColorStop(1, "rgba(171, 208, 6, 0.1)"); // End color
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: Title, // Menggunakan Title sebagai label dataset
            data: data,
            backgroundColor: gradient,
            borderColor: "rgba(214, 245, 242, 0.5)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        layout: {
          padding: 20,
        },
        plugins: {
          title: {
            display: true,
            text: Title,
            color: "#8DE2DB", // Warna judul chart
            font: {
              size: 16,
            },
            padding: {
              bottom: 10,
            },
          },
          subtitle: {
            display: true,
            text: subTitle,
            color: "#E7F9F7", // Warna judul chart
            font: {
              size: 12,
              style: "italic",
            },
            padding: {
              bottom: 30,
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Kabupaten/Kota",
              color: "#8DE2DB",
              padding: {
                bottom: 15
              },
            },
            ticks: {
              color: "#E7F9F7",
            },
          },
          x: {
            title: {
              display: true,
              text: xTitle,
              color: "#8DE2DB",
              padding: {
                top: 15
              },
            },
            ticks: {
              color: "#E7F9F7",
              callback: function (value) {
                return value.toFixed(2);
              },
            },
          },
        },
      },
    });
  }
});
