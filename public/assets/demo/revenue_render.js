(async function fetchData() {
    try {
        const data = await fetch(`http://localhost:5001/admins/revenue`);
        const revenue = await data.json();
        const result = revenue.monthlyRevenue;
        var ctx = document.getElementById("revenueMonthly");
        const month = new Date().getMonth();
        ctx.textContent = `${result[month]}`
    } catch (e) {  
        console.log(e);
    }
})();