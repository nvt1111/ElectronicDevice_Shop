// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily =
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#292b2c";

// Pie Chart Example
(async function fetchData() {
  const data = await fetch("http://localhost:5001/admins/quantityCategories");
  const result = await data.json();

  function generateRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(generateRandomColor());
    }
    return colors;
  }

  const backgroundColor = generateRandomColors(result.name.length);

  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: result.name,
      datasets: [
        {
          data: result.quantity,
          backgroundColor,
        },
      ],
    },
  });

  
})();
