const productImages = {
  tea: "https://t4.ftcdn.net/jpg/04/00/52/13/360_F_400521390_uWn8KdMCXK9V5Gkp3dVGOAyKsqQok03V.jpg",
  coffee: "https://media.istockphoto.com/id/1426308134/photo/south-indian-filter-coffee-served-in-a-traditional-tumbler-or-cup-over-roasted-raw-beans.jpg?s=612x612&w=0&k=20&c=0_pG57x7SK2y8hEBpcMvUrmBLtkwwWfdKDD4p4BZqhk=",
  biscuits: "https://t4.ftcdn.net/jpg/02/24/40/43/360_F_224404329_KrZ69DD38fjb4zYKL01AKCy46zALlkWv.jpg",
  vada: "https://cdn.pixabay.com/photo/2021/06/03/01/37/parippu-vada-6305691_1280.jpg",
  poori: "https://img.freepik.com/premium-photo/traditional-south-indian-poori-breakfast-with-potato-curry-coconut-chutney-banana-leaf_788415-9119.jpg?semt=ais_hybrid&w=740&q=80",
  pongal: "https://thumbs.dreamstime.com/b/ven-pongal-famous-south-indian-breakfast-served-banana-leaf-270630914.jpg",
  dosa: "https://i.pinimg.com/736x/e8/dc/7f/e8dc7f0b59b8602ba30621dee3c6291c.jpg",
  idly: "https://t3.ftcdn.net/jpg/02/21/25/16/360_F_221251677_H4e9ADfkdV8kyLRLbHrU9oxzy4DDaxth.jpg",
};
let products = [
  { id: "p-tea", name: "Tea", price: 20, image: productImages.tea, category: "Beverage" },
  { id: "p-coffee", name: "Coffee", price: 30, image: productImages.coffee, category: "Beverage" },
  { id: "p-biscuit", name: "Biscuits", price: 15, image: productImages.biscuits, category: "Snacks" },
  { id: "p-vada", name: "Vada", price: 8, image: productImages.vada, category: "Snacks" },
  { id: "p-poori", name: "Poori", price: 40, image: productImages.poori, category: "Breakfast" },
  { id: "p-pongal", name: "Pongal", price: 35, image: productImages.pongal, category: "Breakfast" },
  { id: "p-dosa", name: "Dosa", price: 45, image: productImages.dosa, category: "Breakfast" },
  { id: "p-idly", name: "Idly", price: 20, image: productImages.idly, category: "Breakfast" },
];
let orders = generateFakeOrders();
function generateFakeOrders() {
  const now = new Date();
  const items = [];
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const total = 200 + Math.round(Math.random() * 300);
    items.push({ id: `o-${i}`, total, createdAt: date.toISOString() });
  }
  return items;
}
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
export async function getProducts() {
  await delay();
  return [...products];
}
export async function createProduct(payload) {
  await delay();
  const product = {
    ...payload,
    id: `p-${Date.now()}`,
  };
  products = [product, ...products];
  return product;
}
export async function updateProduct(id, payload) {
  await delay();
  products = products.map((p) => (p._id === id ? { ...p, ...payload } : p));
  return products.find((p) => p._id === id);
}
export async function deleteProduct(id) {
  await delay();
  products = products.filter((p) => p._id !== id);
  return true;
}
export async function createOrder({ items, total }) {
  await delay();
  const order = {
    id: `o-${Date.now()}`,
    total,
    items,
    createdAt: new Date().toISOString(),
  };
  orders = [order, ...orders];
  return order;
}
export async function getSalesSummary(range = "weekly") {
  await delay();
  const now = new Date();
  const days = range === "weekly" ? 7 : 30;
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const label = range === "weekly" ? date.toLocaleDateString("en-US", { weekday: "short" }) : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const total = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        return diffDays <= i && diffDays > i - 1;
      })
      .reduce((sum, o) => sum + o.total, 0);
    buckets.push({ label, total });
  }
  const total = buckets.reduce((sum, b) => sum + b.total, 0);
  return { range, total, buckets }; 
}

