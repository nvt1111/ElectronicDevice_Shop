const pagination = (data, currentPage) => {
  // (n-1)*x
  // end = start + x
  const slOrder1Page = 5;
  const start = (currentPage - 1) * slOrder1Page;
  const end = start + slOrder1Page;
  const totalPage = Math.ceil(data.length / slOrder1Page); //lam tròn lên

  return { start, end, totalPage };
};

module.exports = pagination
