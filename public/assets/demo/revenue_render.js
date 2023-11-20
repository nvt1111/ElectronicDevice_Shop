(async function fetchData() {
    try {
        const data = await fetch(`http://localhost:5001/admins/revenue`);
        const revenue = await data.json();
        const result = revenue.monthlyRevenue;
        var ctx = document.getElementById("revenueMonthly");
        const today = new Date().getMonth();
        ctx.textContent = `${result[9]}/${today + 1}`
    } catch (e) {
        console.log(e);
    }
})();