window.addEventListener('DOMContentLoaded', event => {
    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple, {
            searching: false, // Ẩn ô tìm kiếm
            paging: false, // Ẩn phân trang
            entries: [], // Ẩn số lượng dòng trên trang
        });
    }
});





